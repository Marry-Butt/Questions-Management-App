import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getNotifications, markNotificationsRead } from '../../services/questionService';
import { Bell, User, LogOut, ChevronDown, MessageSquare, ClipboardList, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logoutUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  
  const navigate = useNavigate();
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const fetchNotifs = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifs();
    // Poll notifications every 30 seconds
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleMarkAsRead = async () => {
    try {
      await markNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'assignment':
        return <ClipboardList className="h-4 w-4 text-indigo-400" />;
      case 'status_change':
        return <CheckCircle className="h-4 w-4 text-emerald-400" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4 text-sky-400" />;
      default:
        return <Bell className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <header className="glass h-16 w-full flex items-center justify-between px-6 z-10 border-b border-slate-800">
      <div>
        <h1 className="text-xl font-semibold font-sans tracking-wide text-slate-100 hidden md:block">
          Welcome back, <span className="text-indigo-400 font-bold">{user?.name}</span>
        </h1>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => {
              setShowNotifDropdown(!showNotifDropdown);
              if (!showNotifDropdown) handleMarkAsRead();
            }}
            className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-100 transition-colors relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 bg-indigo-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 glass-card rounded-xl overflow-hidden z-20 shadow-2xl">
              <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                <span className="font-semibold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-xs text-indigo-400 font-medium">New Alerts</span>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">No notifications yet</div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`p-3 border-b border-slate-800/50 flex gap-3 text-xs transition-colors hover:bg-slate-800/40 ${!notif.is_read ? 'bg-indigo-950/20' : ''}`}
                    >
                      <div className="mt-0.5">{getNotifIcon(notif.type)}</div>
                      <div className="flex-1">
                        <p className="text-slate-300 font-medium leading-relaxed">{notif.message}</p>
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative border-l border-slate-800 pl-4" ref={profileRef}>
          <button 
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-2 hover:bg-slate-800/50 p-1.5 rounded-lg transition-colors"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/20">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-semibold text-slate-300">{user?.name}</p>
              <p className="text-[10px] text-slate-500 capitalize">{user?.role}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </button>

          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-48 glass-card rounded-xl overflow-hidden z-20 shadow-2xl">
              <button 
                onClick={() => {
                  setShowProfileDropdown(false);
                  navigate('/profile');
                }}
                className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-slate-850 hover:text-slate-100 flex items-center gap-2 transition-colors"
              >
                <User className="h-4 w-4 text-slate-400" /> My Profile
              </button>
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-xs text-rose-400 hover:bg-rose-950/20 flex items-center gap-2 border-t border-slate-800 transition-colors"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
