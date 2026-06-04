import api from './api';

export const getQuestions = async (filters = {}) => {
  const response = await api.get('/questions', { params: filters });
  return response.data;
};

export const createQuestion = async (questionData) => {
  const response = await api.post('/questions', questionData);
  return response.data;
};

export const getQuestionDetails = async (id) => {
  const response = await api.get(`/questions/${id}`);
  return response.data;
};

export const updateQuestion = async (id, questionData) => {
  const response = await api.put(`/questions/${id}`, questionData);
  return response.data;
};

export const deleteQuestion = async (id) => {
  const response = await api.delete(`/questions/${id}`);
  return response.data;
};

export const assignQuestion = async (questionId, assignedToId) => {
  const response = await api.post('/assign-question', {
    question_id: questionId,
    assigned_to: assignedToId ? parseInt(assignedToId, 10) : null
  });
  return response.data;
};

export const changeStatus = async (questionId, status) => {
  const response = await api.put('/change-status', {
    question_id: questionId,
    status
  });
  return response.data;
};

export const addComment = async (questionId, commentText) => {
  const response = await api.post(`/questions/${questionId}/comments`, {
    comment: commentText
  });
  return response.data;
};

export const getNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

export const markNotificationsRead = async () => {
  const response = await api.post('/notifications/read');
  return response.data;
};
