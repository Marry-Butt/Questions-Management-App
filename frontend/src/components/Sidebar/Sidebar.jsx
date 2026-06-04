import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, HelpCircle, Building2, Users, User, LogOut, MessageSquare } from 'lucide-react';

const Sidebar = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      roles: ['admin', 'manager', 'employee']
    },
    {
      name: 'Questions',
      path: '/questions',
      icon: <HelpCircle className="h-5 w-5" />,
      roles: ['admin', 'manager', 'employee']
    },
    {
      name: 'Departments',
      path: '/departments',
      icon: <Building2 className="h-5 w-5" />,
      roles: ['admin', 'manager']
    },
    {
      name: 'Users',
      path: '/users',
      icon: <Users className="h-5 w-5" />,
      roles: ['admin']
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: <User className="h-5 w-5" />,
      roles: ['admin', 'manager', 'employee']
    }
  ];

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <aside className="w-64 glass h-screen flex flex-col border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800 bg-slate-950/20">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <MessageSquare className="h-5 w-5 text-white" />
        </div>
        <span className="font-sans font-extrabold text-lg tracking-wider bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
          Q&A HUB
        </span>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems
          .filter(item => item.roles.includes(user?.role))
          .map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 glow-indigo'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`
              }
            >
              <div className="transition-transform duration-200 group-hover:scale-110">
                {item.icon}
              </div>
              {item.name}
            </NavLink>
          ))}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-md">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="text-xs font-bold text-slate-200 truncate">{user?.name}</h4>
            <span className="text-[10px] text-slate-500 capitalize">{user?.role}</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-800 hover:border-rose-500/30 hover:bg-rose-950/10 text-slate-400 hover:text-rose-400 text-xs font-medium transition-all duration-200"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
