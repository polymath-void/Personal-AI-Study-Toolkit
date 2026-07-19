import React from "react";
import { LogOut } from "lucide-react";
import { getSupabase } from "../../lib/supabase";

export const LogoutButton = () => {
  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("study_buddy_demo_user");
      localStorage.removeItem("sub_user_session");
    }
    try {
      const supabase = getSupabase();
      await supabase.auth.signOut();
    } catch (e) {}
    window.location.reload();
  };
  return (
    <button 
      onClick={handleLogout} 
      className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition-all cursor-pointer font-bold text-xs"
    >
      <LogOut size={14} />
      <span>Logout</span>
    </button>
  );
};
