import React from 'react';

export const StatusBadge = ({ status }) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'Open':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'In Progress':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'Resolved':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Closed':
        return 'bg-slate-700/20 text-slate-400 border border-slate-750/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${getStatusStyle()}`}>
      {status}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const getPriorityStyle = () => {
    switch (priority) {
      case 'High':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'Low':
        return 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${getPriorityStyle()}`}>
      {priority}
    </span>
  );
};

export const TableWrapper = ({ children, headers }) => {
  return (
    <div className="w-full overflow-x-auto glass-card rounded-2xl border border-slate-800 shadow-2xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            {headers.map((header, idx) => (
              <th key={idx} className="p-4 py-3">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50 text-slate-300 text-sm">
          {children}
        </tbody>
      </table>
    </div>
  );
};
