import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getQuestions, createQuestion } from '../../services/questionService';
import { getDepartments, getAssignableUsers } from '../../services/userService';
import { StatusBadge, PriorityBadge, TableWrapper } from '../../components/Tables/Tables';
import { HelpCircle, Filter, Plus, Search, Check, AlertCircle, X } from 'lucide-react';

const Questions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Lists
  const [questions, setQuestions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [onlyMyAssigned, setOnlyMyAssigned] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Add Question form
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [deptId, setDeptId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [deptsData, usersData] = await Promise.all([
        getDepartments(),
        getAssignableUsers()
      ]);
      setDepartments(deptsData);
      setAssignees(usersData);
      if (deptsData.length > 0) setDeptId(deptsData[0].id.toString());
    } catch (err) {
      console.error(err);
      setError("Failed to load departments and user directories.");
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestionsList = async () => {
    try {
      const filters = {};
      if (filterStatus) filters.status = filterStatus;
      if (filterPriority) filters.priority = filterPriority;
      if (filterDept) filters.department_id = filterDept;
      if (onlyMyAssigned) filters.assigned_to = user.id;

      const data = await getQuestions(filters);
      setQuestions(data);
    } catch (err) {
      console.error(err);
      setError("Failed to query questions list.");
    }
  };

  useEffect(() => {
    loadData();
    
    // Check if ?create=true query parameter is present to open modal
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('create') === 'true' && ['admin', 'manager'].includes(user?.role)) {
      setShowAddModal(true);
    }
  }, [location.search, user]);

  useEffect(() => {
    fetchQuestionsList();
  }, [filterStatus, filterPriority, filterDept, onlyMyAssigned]);

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const payload = {
        title,
        description,
        priority,
        department_id: parseInt(deptId, 10),
        assigned_to: assignedTo ? parseInt(assignedTo, 10) : null
      };

      await createQuestion(payload);
      setTitle('');
      setDescription('');
      setPriority('Medium');
      if (departments.length > 0) setDeptId(departments[0].id.toString());
      setAssignedTo('');
      
      setShowAddModal(false);
      // Remove query param if present
      if (location.search.includes('create=true')) {
        navigate('/questions', { replace: true });
      }
      
      setSuccess("Question submitted successfully!");
      fetchQuestionsList();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit question.");
    } finally {
      setSaving(false);
    }
  };

  const filteredQuestions = questions.filter(q => {
    const query = searchQuery.toLowerCase();
    return (
      q.title.toLowerCase().includes(query) ||
      q.description.toLowerCase().includes(query) ||
      q.creator?.name?.toLowerCase().includes(query) ||
      q.assignee?.name?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900/40 via-indigo-950/10 to-slate-900/40">
        <div>
          <h2 className="text-2xl font-bold font-sans tracking-wide text-white flex items-center gap-2">
            Questions Hub <HelpCircle className="h-5 w-5 text-indigo-400" />
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Search, filter, and drill down on resolving details of submitted questions.
          </p>
        </div>
        {['admin', 'manager'].includes(user?.role) && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
          >
            <Plus className="h-4 w-4" /> Ask a Question
          </button>
        )}
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

      {/* Filters and Search toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions by title, description, or users..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
          />
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
        </div>

        {/* Filters dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mr-1 hidden sm:inline">Status</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-2 text-xs rounded-xl glass-input bg-slate-900 cursor-pointer text-slate-200 border-slate-800"
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Priority */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mr-1 hidden sm:inline">Priority</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-2.5 py-2 text-xs rounded-xl glass-input bg-slate-900 cursor-pointer text-slate-200 border-slate-800"
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Department */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mr-1 hidden sm:inline">Dept</span>
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="px-2.5 py-2 text-xs rounded-xl glass-input bg-slate-900 cursor-pointer text-slate-200 border-slate-800"
            >
              <option value="">All Depts</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* My Assigned Toggle */}
          {user?.role === 'employee' && (
            <label className="flex items-center gap-2 cursor-pointer border border-slate-800 bg-slate-900/40 p-2 py-1.5 rounded-xl hover:border-slate-700 transition-all">
              <input
                type="checkbox"
                checked={onlyMyAssigned}
                onChange={(e) => setOnlyMyAssigned(e.target.checked)}
                className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 bg-slate-900 cursor-pointer h-4 w-4"
              />
              <span className="text-xs text-slate-350 select-none">Assigned to Me</span>
            </label>
          )}
        </div>
      </div>

      {/* Main listing table */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="p-12 text-center text-slate-500 font-sans glass-card rounded-2xl border border-slate-800">
          No questions match your current search and filter settings.
        </div>
      ) : (
        <TableWrapper headers={['Question Title', 'Department', 'Assignee', 'Priority', 'Status', 'Asked Date']}>
          {filteredQuestions.map((q) => (
            <tr 
              key={q.id}
              onClick={() => navigate(`/questions/${q.id}`)}
              className="border-b border-slate-800/40 hover:bg-slate-800/25 cursor-pointer transition-colors"
            >
              <td className="p-4 py-3.5">
                <p className="font-bold text-slate-200 max-w-[280px] truncate leading-relaxed">{q.title}</p>
                <span className="text-[10px] text-slate-500 font-medium">Asked by {q.creator?.name}</span>
              </td>
              <td className="p-4 py-3.5 text-xs text-slate-400 font-medium">{q.department?.name}</td>
              <td className="p-4 py-3.5 text-xs">
                {q.assignee ? (
                  <span className="text-slate-300 font-semibold">{q.assignee.name}</span>
                ) : (
                  <span className="text-slate-500 italic">Unassigned</span>
                )}
              </td>
              <td className="p-4 py-3.5"><PriorityBadge priority={q.priority} /></td>
              <td className="p-4 py-3.5"><StatusBadge status={q.status} /></td>
              <td className="p-4 py-3.5 text-xs text-slate-500">
                {new Date(q.created_at).toLocaleDateString([], { dateStyle: 'medium' })}
              </td>
            </tr>
          ))}
        </TableWrapper>
      )}

      {/* Creation Modal overlay */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-card rounded-3xl border border-slate-800 p-6 space-y-6 shadow-2xl relative">
            <button 
              onClick={() => {
                setShowAddModal(false);
                if (location.search.includes('create=true')) navigate('/questions', { replace: true });
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-1.5">
                Submit a Question
              </h3>
              <p className="text-slate-450 text-xs">Add a new ticket routing request to a specific department.</p>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Question Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Invoicing error in client account"
                  required
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Description Details</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue or query in full context..."
                  required
                  rows="4"
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-xs resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Department</label>
                  <select
                    value={deptId}
                    onChange={(e) => setDeptId(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-xs bg-slate-900 cursor-pointer"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-xs bg-slate-900 cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Initial Assignee (Optional)</label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-xs bg-slate-900 cursor-pointer"
                >
                  <option value="">Leave Unassigned</option>
                  {assignees.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-650 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl font-semibold text-xs transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
              >
                {saving ? "Saving Ticket..." : "Submit Question"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Questions;
