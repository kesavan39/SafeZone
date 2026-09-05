import { Project, LayoutObject, SimulationResult, UserFeedback } from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }

    return response.json();
  } catch (e) {
    console.warn(`Fetch to ${url} failed, using local mock fallback.`, e);
    throw e;
  }
}

export const api = {
  getProjects: () => request<Project[]>('/api/projects'),
  getProject: (id: string) => request<any>(`/api/projects/${id}`),
  createProject: (data: { name: string; customer_name: string; description?: string }) =>
    request<Project>('/api/projects', { method: 'POST', body: JSON.stringify(data) }),

  getLayoutsByProject: (projectId: string) => request<any[]>(`/api/layouts/project/${projectId}`),
  getLayout: (layoutId: string) => request<any>(`/api/layouts/${layoutId}`),
  saveLayout: (layoutPayload: any) => request<any>('/api/layouts', { method: 'POST', body: JSON.stringify(layoutPayload) }),

  runSimulation: (simParams: any) => request<SimulationResult>('/api/simulation/run', { method: 'POST', body: JSON.stringify(simParams) }),
  getSimulationRun: (runId: string) => request<any>(`/api/simulation/${runId}`),

  getScenarios: (projectId: string) => request<any[]>(`/api/scenarios/project/${projectId}`),
  runScenario: (scenarioId: string) => request<any>(`/api/scenarios/run/${scenarioId}`, { method: 'POST' }),

  runSensitivity: (sensitivityParams: any) => request<any>('/api/sensitivity/run', { method: 'POST', body: JSON.stringify(sensitivityParams) }),

  getFeedback: () => request<UserFeedback[]>('/api/feedback'),
  submitFeedback: (feedback: UserFeedback) => request<any>('/api/feedback', { method: 'POST', body: JSON.stringify(feedback) }),

  generateReport: (projectId: string) => request<any>(`/api/reports/generate/${projectId}`, { method: 'POST' }),
  getDownloadReportUrl: (projectId: string) => `${API_BASE}/api/reports/download/${projectId}`
};
