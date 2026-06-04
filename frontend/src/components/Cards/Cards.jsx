import React from 'react';
import { HelpCircle, FolderOpen, CheckCircle, AlertOctagon, ListTodo } from 'lucide-react';

export const StatCard = ({ title, value, type, icon }) => {
  const getColors = () => {
    switch (type) {
      case 'primary':
        return {
          bg: 'from-indigo-500/10 to-purple-500/5',
          border: 'border-indigo-500/20 hover:border-indigo-500/40',
          iconBg: 'bg-indigo-500/10 text-indigo-400',
          glow: 'glow-indigo'
        };
      case 'warning':
        return {
          bg: 'from-amber-500/10 to-orange-500/5',
          border: 'border-amber-500/20 hover:border-amber-500/40',
          iconBg: 'bg-amber-500/10 text-amber-400',
          glow: 'shadow-[0_0_40px_-10px_rgba(245,158,11,0.1)]'
        };
      case 'success':
        return {
          bg: 'from-emerald-500/10 to-teal-500/5',
          border: 'border-emerald-500/20 hover:border-emerald-500/40',
          iconBg: 'bg-emerald-500/10 text-emerald-400',
          glow: 'glow-emerald'
        };
      case 'danger':
        return {
          bg: 'from-rose-500/10 to-pink-500/5',
          border: 'border-rose-500/20 hover:border-rose-500/40',
          iconBg: 'bg-rose-500/10 text-rose-400',
          glow: 'shadow-[0_0_40px_-10px_rgba(244,63,94,0.1)]'
        };
      default:
        return {
          bg: 'from-slate-500/10 to-slate-650/5',
          border: 'border-slate-800 hover:border-slate-700',
          iconBg: 'bg-slate-800 text-slate-400',
          glow: ''
        };
    }
  };

  const colors = getColors();

  const getDefaultIcon = () => {
    switch (icon) {
      case 'help': return <HelpCircle className="h-6 w-6" />;
      case 'open': return <FolderOpen className="h-6 w-6" />;
      case 'check': return <CheckCircle className="h-6 w-6" />;
      case 'alert': return <AlertOctagon className="h-6 w-6" />;
      default: return <ListTodo className="h-6 w-6" />;
    }
  };

  return (
    <div className={`glass-card rounded-2xl p-6 border bg-gradient-to-br ${colors.bg} ${colors.border} ${colors.glow} transition-all duration-300 hover:-translate-y-1`}>
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-400 font-sans">{title}</p>
          <h3 className="text-3xl font-extrabold font-sans text-slate-100 tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${colors.iconBg}`}>
          {getDefaultIcon()}
        </div>
      </div>
    </div>
  );
};
