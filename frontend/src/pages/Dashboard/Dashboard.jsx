import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDashboardStats } from '../../services/userService';
import { getQuestions } from '../../services/questionService';
import { StatCard } from '../../components/Cards/Cards';
import { StatusBadge, PriorityBadge, TableWrapper } from '../../components/Tables/Tables';
import { HelpCircle, FolderOpen, CheckCircle, AlertOctagon, ArrowRight, Sparkles, ClipboardList } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentQuestions, setRecentQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, questionsData] = await Promise.all([
        getDashboardStats(),
        getQuestions()
      ]);
      setStats(statsData);
      
      // Get top 5 recent questions
      setRecentQuestions(questionsData.slice(0, 5));
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[400px]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900/40 via-indigo-950/10 to-slate-900/40">
        <div>
          <h2 className="text-2xl font-bold font-sans tracking-wide text-white flex items-center gap-2">
            Workspace Overview <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Analyze, assign, and track the resolving progress of submitted questions.
          </p>
        </div>
        <div className="flex gap-2">
          {['admin', 'manager'].includes(user?.role) && (
            <button
              onClick={() => navigate('/questions?create=true')}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all"
            >
              Ask a Question
            </button>
          )}
          <button
            onClick={() => navigate('/questions')}
            className="px-4 py-2.5 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all bg-slate-900/45"
          >
            View All Questions
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Cards Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Questions" 
          value={stats?.total_questions || 0} 
          type="primary" 
          icon="help" 
        />
        <StatCard 
          title="Active Questions" 
          value={stats?.open_questions || 0} 
          type="warning" 
          icon="open" 
        />
        <StatCard 
          title="Resolved Questions" 
          value={stats?.resolved_questions || 0} 
          type="success" 
          icon="check" 
        />
        <StatCard 
          title="High Priority" 
          value={stats?.high_priority_questions || 0} 
          type="danger" 
          icon="alert" 
        />
      </div>

      {/* Tables and recent lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Recent Questions Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-base font-semibold text-slate-200">Recent Questions</h3>
            <button 
              onClick={() => navigate('/questions')} 
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
            >
              All questions <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {recentQuestions.length === 0 ? (
            <div className="glass-card p-8 rounded-2xl text-center border border-slate-850">
              <ClipboardList className="h-10 w-10 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No questions available</p>
            </div>
          ) : (
            <TableWrapper headers={['Title', 'Department', 'Assignee', 'Priority', 'Status']}>
              {recentQuestions.map((q) => (
                <tr 
                  key={q.id}
                  onClick={() => navigate(`/questions/${q.id}`)}
                  className="border-b border-slate-800/40 hover:bg-slate-800/30 cursor-pointer transition-colors"
                >
                  <td className="p-4 py-3.5">
                    <p className="font-semibold text-slate-200 max-w-[200px] truncate">{q.title}</p>
                    <span className="text-[10px] text-slate-500">Created by {q.creator?.name}</span>
                  </td>
                  <td className="p-4 py-3.5 text-xs text-slate-400">{q.department?.name}</td>
                  <td className="p-4 py-3.5 text-xs text-slate-455">
                    {q.assignee ? (
                      <span className="text-slate-300 font-medium">{q.assignee.name}</span>
                    ) : (
                      <span className="text-slate-500 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="p-4 py-3.5"><PriorityBadge priority={q.priority} /></td>
                  <td className="p-4 py-3.5"><StatusBadge status={q.status} /></td>
                </tr>
              ))}
            </TableWrapper>
          )}
        </div>

        {/* Right Side: Quick info / Info panel */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-slate-200 px-2">Quick Stats</h3>
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-800/60">
              <span className="text-slate-400">Total Closed Questions</span>
              <span className="font-bold text-slate-200">{stats?.closed_questions || 0}</span>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Role Permissions</h4>
              <div className="space-y-2.5">
                <div className="p-2.5 rounded-xl bg-indigo-950/20 border border-indigo-500/10 text-xs">
                  <span className="font-semibold text-indigo-400">Admin</span>
                  <p className="text-slate-450 mt-0.5 text-[10px] leading-relaxed">Full control over users, role-changing, departments CRUD, status, comments, and questions.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/10 text-xs">
                  <span className="font-semibold text-emerald-400">Department Manager</span>
                  <p className="text-slate-450 mt-0.5 text-[10px] leading-relaxed">Can create questions, manage departments, assign questions to employees, set priorities, change statuses, and comment.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/10 text-xs">
                  <span className="font-semibold text-amber-400">Employee</span>
                  <p className="text-slate-450 mt-0.5 text-[10px] leading-relaxed">Can view assigned questions, update progress status (Open ➔ In Progress ➔ Resolved), and write comments.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
