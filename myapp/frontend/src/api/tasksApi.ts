import { apiGet, apiPost, apiPut, apiDelete } from "../api";

export const getTasks = () => apiGet("/api/tasks");
export const getTask = (id: string) => apiGet(`/api/tasks/${id}`);
export const createTask = (data: any) => apiPost("/api/tasks", data);
export const updateTask = (id: string, data: any) =>
  apiPut(`/api/tasks/${id}`, data);
export const deleteTask = (id: string) =>
  apiDelete(`/api/tasks/${id}`);