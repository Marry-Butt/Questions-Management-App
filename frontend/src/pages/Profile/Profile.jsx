import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Calendar, Shield, Bookmark } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'from-rose-500 to-pink-500 text-rose-500';
      case 'manager':
        return 'from-emerald-500 to-teal-500 text-emerald-500';
      default:
        return 'from-indigo-500 to-indigo-600 text-indigo-400';
    }
  };

  const roleColor = getRoleColor(user?.role);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Banner */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 relative overflow-hidden bg-gradient-to-r from-slate-900/50 via-indigo-950/15 to-slate-900/50">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-xl shadow-indigo-500/20">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-2xl font-bold text-slate-100">{user?.name}</h2>
            <p className="text-slate-400 text-sm">{user?.email}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 capitalize">
              <Shield className="h-3 w-3" /> {user?.role} Role
            </div>
          </div>
        </div>
      </div>

      {/* Account Info Details */}
      <div className="glass-card rounded-3xl p-8 border border-slate-800 space-y-6">
        <h3 className="text-lg font-semibold text-slate-200 pb-3 border-b border-slate-800/80">Account Specifications</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="flex gap-3 items-start p-4 rounded-2xl bg-slate-900/30 border border-slate-850">
            <div className="p-2.5 rounded-xl bg-slate-800 text-slate-400 mt-0.5">
              <User className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">User Name</span>
              <p className="text-sm font-semibold text-slate-200 mt-0.5">{user?.name}</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex gap-3 items-start p-4 rounded-2xl bg-slate-900/30 border border-slate-850">
            <div className="p-2.5 rounded-xl bg-slate-800 text-slate-400 mt-0.5">
              <Mail className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Email Address</span>
              <p className="text-sm font-semibold text-slate-200 mt-0.5">{user?.email}</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="flex gap-3 items-start p-4 rounded-2xl bg-slate-900/30 border border-slate-850">
            <div className="p-2.5 rounded-xl bg-slate-800 text-slate-400 mt-0.5">
              <Shield className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Role Name</span>
              <p className="text-sm font-semibold text-slate-200 mt-0.5 capitalize">{user?.role}</p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="flex gap-3 items-start p-4 rounded-2xl bg-slate-900/30 border border-slate-850">
            <div className="p-2.5 rounded-xl bg-slate-800 text-slate-400 mt-0.5">
              <Calendar className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Created Timestamp</span>
              <p className="text-sm font-semibold text-slate-200 mt-0.5">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString([], { dateStyle: 'medium' }) : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Role details box */}
      <div className="p-4 bg-indigo-950/10 border border-indigo-500/10 rounded-2xl text-xs text-indigo-300/80 leading-relaxed flex gap-3">
        <Bookmark className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-indigo-300">Active Session Token</span>
          <p className="mt-1 font-mono text-[10px] text-indigo-400/70 truncate select-all">
            {localStorage.getItem('token') || "No active token found"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
