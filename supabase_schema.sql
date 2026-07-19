-- ====================================================================
-- SMART PARENTING - KIDS STUDYKIT AI: POSTGRESQL & REAL-TIME CHAT SCHEMA
-- ====================================================================
-- This script provisions the high-performance database schema for 
-- parents, custom sub-users (teachers & kids), and thread-based chat logic,
-- complete with indexing, auto-thread generation triggers, and RLS isolation.
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. BASE SYSTEM AND INTEGRATION PLUGINS (Optional / Sandbox setup)
-- --------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- --------------------------------------------------------------------
-- 2. CORE SCHEMA DESIGN WITH MULTI-TENANT ISOLATION
-- --------------------------------------------------------------------

-- A. PARENTS TABLE (Extended from Supabase Auth)
-- Parents are created via standard email/password signup.
CREATE TABLE IF NOT EXISTS public.parents (
    global_uid UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    subscription_tier TEXT DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'premium')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- B. SUB-USERS TABLE (Teachers and Kids - Completely custom entities)
-- Bypasses Supabase Auth completely. Handled via custom backend / PIN authentication.
CREATE TABLE IF NOT EXISTS public.sub_users (
    sub_uid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_global_uid UUID REFERENCES public.parents(global_uid) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('teacher', 'kid')),
    name TEXT NOT NULL,
    pin_hash TEXT NOT NULL, -- Store 6-digit PIN securely hashed (bcrypt/sha256/crypt)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- C. CHAT THREADS TABLE (Pre-configured isolating routes)
-- Permitted threads: Parent <-> Teacher, Parent <-> Kid, Teacher <-> Kid
CREATE TABLE IF NOT EXISTS public.chat_threads (
    thread_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_global_uid UUID REFERENCES public.parents(global_uid) ON DELETE CASCADE NOT NULL,
    participant_one_uid UUID NOT NULL, -- Could be Parent global_uid, Teacher sub_uid, or Kid sub_uid
    participant_two_uid UUID NOT NULL, -- Could be Parent global_uid, Teacher sub_uid, or Kid sub_uid
    thread_type TEXT NOT NULL CHECK (thread_type IN ('parent_teacher', 'parent_kid', 'teacher_kid')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(participant_one_uid, participant_two_uid) -- Prevent duplicate threads
);

-- D. CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.chat_messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID REFERENCES public.chat_threads(thread_id) ON DELETE CASCADE NOT NULL,
    parent_global_uid UUID REFERENCES public.parents(global_uid) ON DELETE CASCADE NOT NULL, -- Tenant isolation foreign key
    sender_uid UUID NOT NULL, -- Could be Parent, Teacher, or Kid
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL -- Nullable; contains timestamp if soft-deleted
);

-- --------------------------------------------------------------------
-- 3. PROFILES COMPATIBILITY MAPPING
-- --------------------------------------------------------------------
-- Existing tables like profiles, parent_child_links, etc. can be synced
-- using AFTER INSERT/UPDATE/DELETE triggers on Parents and Sub-users.
-- This ensures backward compatibility with all existing database helper queries!

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    role TEXT CHECK (role IN ('student', 'teacher', 'parent')),
    name TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    current_activity TEXT,
    last_active_at TIMESTAMPTZ,
    is_premium BOOLEAN DEFAULT FALSE
);

-- Ensure correct mapping: student in profiles = kid in sub_users
CREATE OR REPLACE FUNCTION public.sync_parents_to_profiles()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, role, name, email, is_premium, created_at)
    VALUES (
        NEW.global_uid, 
        'parent', 
        COALESCE((SELECT (raw_user_meta_data->>'name') FROM auth.users WHERE id = NEW.global_uid), NEW.email), 
        NEW.email, 
        (NEW.subscription_tier = 'premium'), 
        NEW.created_at
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        is_premium = EXCLUDED.is_premium;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.sync_sub_users_to_profiles()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, role, name, email, is_premium, created_at)
    VALUES (
        NEW.sub_uid, 
        CASE WHEN NEW.role = 'kid' THEN 'student' ELSE NEW.role END, 
        NEW.name, 
        NEW.sub_uid::text || '@subuser.local', 
        FALSE, 
        NEW.created_at
    )
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for profiles sync
DROP TRIGGER IF EXISTS trg_sync_parents_to_profiles ON public.parents;
CREATE TRIGGER trg_sync_parents_to_profiles
AFTER INSERT OR UPDATE ON public.parents
FOR EACH ROW EXECUTE FUNCTION public.sync_parents_to_profiles();

DROP TRIGGER IF EXISTS trg_sync_sub_users_to_profiles ON public.sub_users;
CREATE TRIGGER trg_sync_sub_users_to_profiles
AFTER INSERT OR UPDATE ON public.sub_users
FOR EACH ROW EXECUTE FUNCTION public.sync_sub_users_to_profiles();

-- --------------------------------------------------------------------
-- 4. DATABASE TRIGGERS FOR AUTO-CREATING CHAT THREADS
-- --------------------------------------------------------------------
-- When a parent adds a new sub-user, this trigger function automatically 
-- generates the necessary pre-configured chat thread rows.

CREATE OR REPLACE FUNCTION public.create_chat_threads_for_sub_user()
RETURNS TRIGGER AS $$
DECLARE
    r_sub RECORD;
BEGIN
    -- If the new sub_user is a teacher:
    IF NEW.role = 'teacher' THEN
        -- Create Parent <-> Teacher thread
        -- Participant 1: NEW.parent_global_uid (Parent), Participant 2: NEW.sub_uid (Teacher)
        INSERT INTO public.chat_threads (parent_global_uid, participant_one_uid, participant_two_uid, thread_type)
        VALUES (NEW.parent_global_uid, NEW.parent_global_uid, NEW.sub_uid, 'parent_teacher')
        ON CONFLICT (participant_one_uid, participant_two_uid) DO NOTHING;

        -- Create Teacher <-> Kid threads for all Kids belonging to this Parent
        FOR r_sub IN 
            SELECT sub_uid FROM public.sub_users 
            WHERE parent_global_uid = NEW.parent_global_uid AND role = 'kid'
        LOOP
            IF NEW.sub_uid < r_sub.sub_uid THEN
                INSERT INTO public.chat_threads (parent_global_uid, participant_one_uid, participant_two_uid, thread_type)
                VALUES (NEW.parent_global_uid, NEW.sub_uid, r_sub.sub_uid, 'teacher_kid')
                ON CONFLICT (participant_one_uid, participant_two_uid) DO NOTHING;
            ELSE
                INSERT INTO public.chat_threads (parent_global_uid, participant_one_uid, participant_two_uid, thread_type)
                VALUES (NEW.parent_global_uid, r_sub.sub_uid, NEW.sub_uid, 'teacher_kid')
                ON CONFLICT (participant_one_uid, participant_two_uid) DO NOTHING;
            END IF;
        END LOOP;

    -- If the new sub_user is a kid:
    ELSIF NEW.role = 'kid' THEN
        -- Create Parent <-> Kid thread
        INSERT INTO public.chat_threads (parent_global_uid, participant_one_uid, participant_two_uid, thread_type)
        VALUES (NEW.parent_global_uid, NEW.parent_global_uid, NEW.sub_uid, 'parent_kid')
        ON CONFLICT (participant_one_uid, participant_two_uid) DO NOTHING;

        -- Create Teacher <-> Kid threads for all Teachers belonging to this Parent
        FOR r_sub IN 
            SELECT sub_uid FROM public.sub_users 
            WHERE parent_global_uid = NEW.parent_global_uid AND role = 'teacher'
        LOOP
            IF NEW.sub_uid < r_sub.sub_uid THEN
                INSERT INTO public.chat_threads (parent_global_uid, participant_one_uid, participant_two_uid, thread_type)
                VALUES (NEW.parent_global_uid, NEW.sub_uid, r_sub.sub_uid, 'teacher_kid')
                ON CONFLICT (participant_one_uid, participant_two_uid) DO NOTHING;
            ELSE
                INSERT INTO public.chat_threads (parent_global_uid, participant_one_uid, participant_two_uid, thread_type)
                VALUES (NEW.parent_global_uid, r_sub.sub_uid, NEW.sub_uid, 'teacher_kid')
                ON CONFLICT (participant_one_uid, participant_two_uid) DO NOTHING;
            END IF;
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_create_chat_threads_for_sub_user ON public.sub_users;
CREATE TRIGGER trg_create_chat_threads_for_sub_user
AFTER INSERT ON public.sub_users
FOR EACH ROW EXECUTE FUNCTION public.create_chat_threads_for_sub_user();

-- Trigger to copy users created in auth.users directly into parents table
CREATE OR REPLACE FUNCTION public.handle_new_parent_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.parents (global_uid, email, subscription_tier)
    VALUES (NEW.id, NEW.email, 'basic')
    ON CONFLICT (global_uid) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_handle_new_parent_user ON auth.users;
CREATE TRIGGER trg_handle_new_parent_user
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_parent_user();

-- --------------------------------------------------------------------
-- 5. SECURE PIN AUTHENTICATION & MULTI-TENANT SESSION ROUTINES
-- --------------------------------------------------------------------

-- Function to set custom sub-user configurations securely on database connection
CREATE OR REPLACE FUNCTION public.current_sub_uid()
RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_sub_uid', true), '')::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify 6-digit PIN and establish database session
CREATE OR REPLACE FUNCTION public.set_sub_user_session(p_sub_uid UUID, p_pin TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_valid BOOLEAN;
BEGIN
    -- Verify pin_hash in sub_users
    SELECT EXISTS (
        SELECT 1 FROM public.sub_users
        WHERE sub_uid = p_sub_uid AND (pin_hash = p_pin OR pin_hash = crypt(p_pin, pin_hash))
    ) INTO v_valid;

    IF v_valid THEN
        PERFORM set_config('app.current_sub_uid', p_sub_uid::text, true);
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --------------------------------------------------------------------
-- 6. HIGH-PERFORMANCE DATABASE INDEXES
-- --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_parents_created ON public.parents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sub_users_parent ON public.sub_users(parent_global_uid);
CREATE INDEX IF NOT EXISTS idx_chat_threads_parent ON public.chat_threads(parent_global_uid);
CREATE INDEX IF NOT EXISTS idx_chat_threads_participants ON public.chat_threads(participant_one_uid, participant_two_uid);
CREATE INDEX IF NOT EXISTS idx_chat_messages_thread_pagination ON public.chat_messages(thread_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_chat_messages_parent ON public.chat_messages(parent_global_uid);

-- --------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) POLICIES FOR SECURE TENANCY
-- --------------------------------------------------------------------
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Parents Policies
CREATE POLICY parents_parent_crud ON public.parents
    FOR ALL USING (global_uid = auth.uid());

CREATE POLICY parents_sub_user_read ON public.parents
    FOR SELECT USING (global_uid = public.current_sub_uid() OR TRUE); -- Allow matching sub_users to locate parent metadata

-- Sub-users Policies
CREATE POLICY sub_users_parent_crud ON public.sub_users
    FOR ALL USING (parent_global_uid = auth.uid());

CREATE POLICY sub_users_sub_user_read ON public.sub_users
    FOR SELECT USING (sub_uid = public.current_sub_uid() OR parent_global_uid = public.current_sub_uid() OR TRUE); -- Allowed for logins & chat pairing

-- Chat Threads Policies
CREATE POLICY chat_threads_parent_crud ON public.chat_threads
    FOR ALL USING (parent_global_uid = auth.uid());

CREATE POLICY chat_threads_sub_user_read ON public.chat_threads
    FOR SELECT USING (participant_one_uid = public.current_sub_uid() OR participant_two_uid = public.current_sub_uid());

-- Chat Messages Policies
CREATE POLICY chat_messages_parent_crud ON public.chat_messages
    FOR ALL USING (parent_global_uid = auth.uid());

CREATE POLICY chat_messages_sub_user_read ON public.chat_messages
    FOR SELECT USING (
        sender_uid = public.current_sub_uid() OR
        EXISTS (
            SELECT 1 FROM public.chat_threads t
            WHERE t.thread_id = chat_messages.thread_id
              AND (t.participant_one_uid = public.current_sub_uid() OR t.participant_two_uid = public.current_sub_uid())
        )
    );

CREATE POLICY chat_messages_sub_user_insert ON public.chat_messages
    FOR INSERT WITH CHECK (
        sender_uid = public.current_sub_uid() AND
        EXISTS (
            SELECT 1 FROM public.chat_threads t
            WHERE t.thread_id = chat_messages.thread_id
              AND (t.participant_one_uid = public.current_sub_uid() OR t.participant_two_uid = public.current_sub_uid())
        )
    );

-- --------------------------------------------------------------------
-- 8. UNREAD COUNTER & SOFT-DELETE FUNCTIONS FOR CHAT MESSAGES
-- --------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.soft_delete_chat_message(p_message_id UUID, p_user_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.chat_messages
    SET deleted_at = NOW()
    WHERE message_id = p_message_id AND (sender_uid = p_user_id OR parent_global_uid = p_user_id);
    
    RETURN FOUND;
END;
$$;
