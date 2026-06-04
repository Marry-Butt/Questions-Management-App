import React, { useState, useEffect } from 'react';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../services/userService';
import { Building2, Plus, Edit2, Trash2, Check, AlertCircle } from 'lucide-react';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingDept, setEditingDept] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  
  const [showAddForm, setShowAddForm] = useState(false);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const data = await getDepartments();
      setDepartments(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load departments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleAddDept = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const newDept = await createDepartment({ name, description });
      setDepartments(prev => [...prev, newDept].sort((a, b) => a.name.localeCompare(b.name)));
      setName('');
      setDescription('');
      setShowAddForm(false);
      setSuccess(`Department '${newDept.name}' created successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create department.");
    }
  };

  const handleUpdateDept = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const updated = await updateDepartment(editingDept.id, { name: editName, description: editDesc });
      setDepartments(prev => prev.map(d => d.id === editingDept.id ? updated : d).sort((a, b) => a.name.localeCompare(b.name)));
      setEditingDept(null);
      setSuccess("Department details updated!");
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update department.");
    }
  };

  const handleDeleteDept = async (id, deptName) => {
    if (!window.confirm(`Are you sure you want to delete the department '${deptName}'?`)) return;
    setError('');
    setSuccess('');
    try {
      await deleteDepartment(id);
      setDepartments(prev => prev.filter(d => d.id !== id));
      setSuccess(`Department '${deptName}' deleted successfully.`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to delete department. Verify there are no active questions associated with it.");
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
            Departments Registry <Building2 className="h-5 w-5 text-indigo-400" />
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Group issues by categories and route questions to the correct teams.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingDept(null);
            setShowAddForm(!showAddForm);
          }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
        >
          <Plus className="h-4 w-4" /> Create Department
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl flex items-center gap-2">
          <Check className="h-4.5 w-4.5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Forms Overlay & inline containers */}
      {showAddForm && (
        <div className="glass-card p-6 rounded-3xl border border-indigo-500/25 bg-slate-900/50 glow-indigo">
          <h3 className="text-sm font-bold text-slate-200 mb-4 uppercase tracking-wider">New Department</h3>
          <form onSubmit={handleAddDept} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Department Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="IT Support"
                required
                className="w-full px-3 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Description (Optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Issues regarding hardware & systems"
                className="w-full px-3 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all"
              >
                Save Department
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2.5 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-medium transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {editingDept && (
        <div className="glass-card p-6 rounded-3xl border border-amber-500/25 bg-slate-900/50">
          <h3 className="text-sm font-bold text-slate-200 mb-4 uppercase tracking-wider text-amber-400">Edit Department</h3>
          <form onSubmit={handleUpdateDept} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Department Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Description</label>
              <input
                type="text"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold transition-all shadow-md"
              >
                Update Details
              </button>
              <button
                type="button"
                onClick={() => setEditingDept(null)}
                className="px-4 py-2.5 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-medium transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid listing */}
      {departments.length === 0 ? (
        <div className="p-8 text-center text-slate-500 font-sans glass-card rounded-2xl border border-slate-800">
          No departments created yet. Click "Create Department" to add one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div key={dept.id} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Building2 className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-200">{dept.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {dept.description || "No description provided."}
                </p>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-800/40 mt-auto">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingDept(dept);
                    setEditName(dept.name);
                    setEditDesc(dept.description || '');
                  }}
                  className="flex-1 py-2 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition-all bg-slate-900/25"
                >
                  <Edit2 className="h-3 w-3" /> Edit
                </button>
                <button
                  onClick={() => handleDeleteDept(dept.id, dept.name)}
                  className="px-3 py-2 border border-slate-800 hover:border-rose-500/20 text-slate-500 hover:text-rose-400 rounded-lg text-[10px] font-semibold flex items-center justify-center transition-all"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Departments;
