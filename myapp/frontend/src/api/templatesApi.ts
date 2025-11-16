import { apiGet, apiPost, apiPut, apiDelete } from "../api";

export const getTemplates = () => apiGet("/api/templates");
export const getTemplate = (id: string) => apiGet(`/api/templates/${id}`);
export const createTemplate = (data: any) => apiPost("/api/templates", data);
export const updateTemplate = (id: string, data: any) =>
  apiPut(`/api/templates/${id}`, data);
export const deleteTemplate = (id: string) =>
  apiDelete(`/api/templates/${id}`);