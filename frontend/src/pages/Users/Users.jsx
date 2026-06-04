import React, { useState, useEffect } from 'react';
import { getUsers, updateUserRole } from '../../services/userService';
import { TableWrapper } from '../../components/Tables/Tables';
import { ShieldAlert, Check, RefreshCw } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load users list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setError('');
    setSuccess('');
    try {
      await updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setSuccess("User role updated successfully!");
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update role.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[400px]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900/40 via-indigo-950/10 to-slate-900/40">
        <div>
          <h2 className="text-2xl font-bold font-sans tracking-wide text-white flex items-center gap-2">
            Users & Access Control <ShieldAlert className="h-5 w-5 text-indigo-400" />
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Change system access permissions and manage staff accounts.
          </p>
        </div>
        <button
          onClick={loadUsers}
          className="px-4 py-2 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all bg-slate-900/45"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh List
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl flex items-center gap-2">
          <Check className="h-4.5 w-4.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Users table */}
      {users.length === 0 ? (
        <div className="p-8 text-center text-slate-500 font-sans glass-card rounded-2xl border border-slate-800">
          No users registered in the system.
        </div>
      ) : (
        <TableWrapper headers={['Name', 'Email Address', 'Account Role', 'Joined Date', 'Actions']}>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors">
              <td className="p-4 py-3.5 font-semibold text-slate-200">{u.name}</td>
              <td className="p-4 py-3.5 text-xs text-slate-400">{u.email}</td>
              <td className="p-4 py-3.5">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${
                  u.role === 'admin' 
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                    : u.role === 'manager' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                }`}>
                  {u.role}
                </span>
              </td>
              <td className="p-4 py-3.5 text-xs text-slate-500">
                {new Date(u.created_at).toLocaleDateString([], { dateStyle: 'medium' })}
              </td>
              <td className="p-4 py-3.5">
                <select
                  value={u.role}
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  className="px-2 py-1 text-xs rounded-lg glass-input bg-slate-900 cursor-pointer text-slate-200 border-slate-800 focus:ring-1 focus:ring-indigo-500/40"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
            </tr>
          ))}
        </TableWrapper>
      )}
    </div>
  );
};

export default Users;
