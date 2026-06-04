import api from './api';

export const getUsers = async () => {
  const response = await api.get('/users/');
  return response.data;
};

export const getAssignableUsers = async () => {
  const response = await api.get('/users/assignable');
  return response.data;
};

export const updateUserRole = async (userId, role) => {
  const response = await api.put(`/users/${userId}/role`, { role });
  return response.data;
};

export const getDepartments = async () => {
  const response = await api.get('/departments/');
  return response.data;
};

export const createDepartment = async (departmentData) => {
  const response = await api.post('/departments/', departmentData);
  return response.data;
};

export const updateDepartment = async (id, departmentData) => {
  const response = await api.put(`/departments/${id}`, departmentData);
  return response.data;
};

export const deleteDepartment = async (id) => {
  const response = await api.delete(`/departments/${id}`);
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await api.get('/dashboard-stats');
  return response.data;
};
