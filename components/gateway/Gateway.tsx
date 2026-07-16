import React, { useState, Suspense, lazy } from "react";
import { AuthForm } from "./AuthForm";
import { getCurrentProfile } from "../../lib/data_helpers";
import type { Profile } from "../../types";

// Lazy load modules (Code-splitting)
const StudentDashboard = lazy(() => import("../student/StudentDashboard"));
const TeacherDashboard = lazy(() => import("../teacher/TeacherDashboard"));
const ParentDashboard = lazy(() => import("../parent/ParentPortal"));

export default function Gateway() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    getCurrentProfile().then((p) => {
      setProfile(p);
      setLoading(false);
    });
  }, []);

  // Reusable Skeleton Loader for Suspense Fallbacks
  const ModuleLoader = ({ message }: { message: string }) => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-slate-800">
      <div className="space-y-4 text-center">
        <div className="w-12 h-12 rounded-2xl border-2 border-indigo-600/10 border-t-indigo-600 animate-spin mx-auto shadow-md" />
        <p className="text-xs font-mono text-slate-400 uppercase tracking-widest animate-pulse font-black">
          {message}
        </p>
      </div>
    </div>
  );

  if (loading) return <ModuleLoader message="Loading..." />;

  if (profile) {
    return (
      <Suspense fallback={<ModuleLoader message="Loading your dashboard..." />}>
        {profile.role === 'student' && <StudentDashboard profile={profile} />}
        {profile.role === 'teacher' && <TeacherDashboard profile={profile} />}
        {profile.role === 'parent' && <ParentDashboard profile={profile} />}
      </Suspense>
    );
  }

  // The main gateway UI (If no profile, show login/signup)
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800">
       <AuthForm />
    </div>
  );
}
