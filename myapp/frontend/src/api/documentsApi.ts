import { apiGet, apiPost, apiPut, apiDelete } from "../api";

export const getDocuments = () => apiGet("/api/documents");
export const getDocument = (id: string) => apiGet(`/api/documents/${id}`);
export const createDocument = (data: any) => apiPost("/api/documents", data);
export const updateDocument = (id: string, data: any) =>
  apiPut(`/api/documents/${id}`, data);
export const deleteDocument = (id: string) =>
  apiDelete(`/api/documents/${id}`);