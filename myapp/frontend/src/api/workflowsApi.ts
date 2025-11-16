import { apiGet, apiPost, apiPut, apiDelete } from "../api";

export const getWorkflows = () => apiGet("/api/workflows");
export const getWorkflow = (id: string) => apiGet(`/api/workflows/${id}`);
// export const createWorkflow = (data: any) => apiPost("/api/workflows", data);
export const updateWorkflow = (id: string, data: any) =>
  apiPut(`/api/workflows/${id}`, data);
export const deleteWorkflow = (id: string) =>
  apiDelete(`/api/workflows/${id}`);
export const createWorkflow = async (data: any) => {
  const res = await apiPost("/api/workflows", data);
  return res;
};