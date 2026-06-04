import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getQuestionDetails, assignQuestion, changeStatus, addComment, updateQuestion } from '../../services/questionService';
import { getAssignableUsers } from '../../services/userService';
import { StatusBadge, PriorityBadge } from '../../components/Tables/Tables';
import { ArrowLeft, Clock, MessageSquare, Send, User, ChevronRight, AlertCircle, HelpCircle } from 'lucide-react';

const QuestionDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [question, setQuestion] = useState(null);
  const [assignees, setAssignees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Comment input
  const [newComment, setNewComment] = useState('');
  const [commentSaving, setCommentSaving] = useState(false);

  const loadQuestionDetails = async () => {
    try {
      setLoading(true);
      const [qData, usersData] = await Promise.all([
        getQuestionDetails(id),
        ['admin', 'manager'].includes(user?.role) ? getAssignableUsers() : Promise.resolve([])
      ]);
      setQuestion(qData);
      setAssignees(usersData);
    } catch (err) {
      console.error(err);
      setError("Failed to load question details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestionDetails();
  }, [id, user]);

  const handleAssigneeChange = async (newAssigneeId) => {
    setError('');
    setSuccess('');
    try {
      const updated = await assignQuestion(question.id, newAssigneeId);
      setQuestion(prev => ({ 
        ...prev, 
        assigned_to: updated.assigned_to, 
        assignee: updated.assignee 
      }));
      setSuccess("Question assignment updated!");
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update assignment.");
    }
  };

  const handlePriorityChange = async (newPriority) => {
    setError('');
    setSuccess('');
    try {
      const updated = await updateQuestion(question.id, { priority: newPriority });
      setQuestion(prev => ({ ...prev, priority: updated.priority }));
      setSuccess("Question priority updated!");
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update priority.");
    }
  };

  const handleStatusChange = async (newStatus) => {
    setError('');
    setSuccess('');
    try {
      const updated = await changeStatus(question.id, newStatus);
      setQuestion(prev => ({ ...prev, status: updated.status }));
      setSuccess("Question status updated!");
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to change status.");
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setError('');
    setCommentSaving(true);
    try {
      const commentOut = await addComment(question.id, newComment);
      
      // Manually push comment and user avatar details locally to avoid re-fetching
      const localComment = {
        ...commentOut,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      };

      setQuestion(prev => ({
        ...prev,
        comments: [...prev.comments, localComment]
      }));
      setNewComment('');
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to post comment.");
    } finally {
      setCommentSaving(false);
    }
  };

  const isAssignee = question?.assigned_to === user?.id;
  const isManagerOrAdmin = ['admin', 'manager'].includes(user?.role);
  const canUpdateStatus = isManagerOrAdmin || isAssignee;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[400px]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="p-8 text-center text-slate-450 glass-card rounded-2xl border border-slate-800 space-y-4 max-w-md mx-auto">
        <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-200">Question not found</h3>
        <button 
          onClick={() => navigate('/questions')}
          className="px-4 py-2 bg-indigo-605 text-white rounded-xl text-xs font-semibold"
        >
          Back to Questions
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back link */}
      <div>
        <button 
          onClick={() => navigate('/questions')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 font-semibold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Questions list
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl">
          {success}
        </div>
      )}

      {/* Main grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left column: Ticket card & comment center */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-3xl p-6 md:p-8 border border-slate-800 space-y-6">
            {/* Header tags */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/15">
                {question.department?.name}
              </span>
              <PriorityBadge priority={question.priority} />
              <StatusBadge status={question.status} />
            </div>

            {/* Title & info */}
            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl font-bold font-sans text-slate-100 leading-snug">
                {question.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> Asked by {question.creator?.name}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {new Date(question.created_at).toLocaleDateString([], { dateStyle: 'medium' })}</span>
              </div>
            </div>

            {/* Description */}
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-850">
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {question.description}
              </p>
            </div>
          </div>

          {/* Comment center */}
          <div className="glass-card rounded-3xl p-6 md:p-8 border border-slate-800 space-y-6">
            <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <MessageSquare className="h-4.5 w-4.5 text-indigo-400" />
              Comments ({question.comments?.length || 0})
            </h3>

            {/* Comments List */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {question.comments?.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 italic">
                  No comments posted yet. Start the conversation.
                </div>
              ) : (
                question.comments.map((comment) => (
                  <div key={comment.id} className="p-4 rounded-2xl bg-slate-900/30 border border-slate-850 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                          {comment.user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-200">{comment.user?.name}</span>
                        <span className="text-[10px] text-slate-500">({comment.user?.email})</span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(comment.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed pl-8">
                      {comment.comment}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Input Box */}
            <form onSubmit={handleAddComment} className="flex gap-3 pt-4 border-t border-slate-800/40">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write comment or status explanation here..."
                required
                disabled={commentSaving}
                className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs"
              />
              <button
                type="submit"
                disabled={commentSaving || !newComment.trim()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center transition-all"
              >
                {commentSaving ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right column: Action Board / Meta Panel */}
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-6">
            <h3 className="text-sm font-bold text-slate-250 uppercase tracking-wider pb-2.5 border-b border-slate-800/60">
              Control Panel
            </h3>

            {/* Assignment controls */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Assignee</label>
              {isManagerOrAdmin ? (
                <select
                  value={question.assigned_to || ''}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-slate-900 cursor-pointer text-slate-300"
                >
                  <option value="">Unassigned</option>
                  {assignees.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              ) : (
                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-850 flex items-center gap-2 text-xs">
                  <User className="h-4 w-4 text-indigo-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-300">
                      {question.assignee ? question.assignee.name : "Unassigned"}
                    </span>
                    <p className="text-[10px] text-slate-500 capitalize">{question.assignee?.role}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Priority control */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Set Priority</label>
              {isManagerOrAdmin ? (
                <select
                  value={question.priority}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-slate-900 cursor-pointer text-slate-300"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              ) : (
                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-850 flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
                  Priority: <PriorityBadge priority={question.priority} />
                </div>
              )}
            </div>

            {/* Status Tracking control */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status Tracking</label>
              {canUpdateStatus ? (
                <select
                  value={question.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-slate-900 cursor-pointer text-slate-300"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  {/* Employee can't close ticket; only managers/admins */}
                  {(isManagerOrAdmin || question.status === 'Closed') && (
                    <option value="Closed">Closed</option>
                  )}
                </select>
              ) : (
                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-850 flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
                  Status: <StatusBadge status={question.status} />
                </div>
              )}
              {user.role === 'employee' && !isAssignee && (
                <span className="text-[10px] text-slate-500 leading-tight block mt-1">
                  🔒 Locked: Only the assigned employee or manager can change progress status.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetails;
