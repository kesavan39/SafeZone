import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project } from '../types';
import { api } from '../api';

const DEFAULT_PROJECTS: Project[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Customer A - Assembly Line",
    customer_name: "Contractor Alpha Corp",
    description: "High precision electronics assembly workcell with dynamic safety zones.",
    created_at: "2026-09-05T10:00:00Z"
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Customer B - Welding Line",
    customer_name: "Automotive Supplies Ltd",
    description: "Robotic arc welding station with human quality inspection zones.",
    created_at: "2026-09-05T11:00:00Z"
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: "Customer C - Packaging Line",
    customer_name: "PharmaPack Logistics",
    description: "High speed pick and place robot with human pallet loading operators.",
    created_at: "2026-09-05T12:00:00Z"
  }
];

interface ProjectContextType {
  projects: Project[];
  activeProject: Project | null;
  setActiveProject: (proj: Project) => void;
  loadProjects: () => Promise<void>;
  createProject: (name: string, customer_name: string, description?: string) => Promise<Project>;
}

const ProjectContext = createContext<ProjectContextType>({
  projects: DEFAULT_PROJECTS,
  activeProject: DEFAULT_PROJECTS[0],
  setActiveProject: () => {},
  loadProjects: async () => {},
  createProject: async () => DEFAULT_PROJECTS[0]
});

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const [activeProject, setActiveProject] = useState<Project | null>(DEFAULT_PROJECTS[0]);

  const loadProjects = async () => {
    try {
      const data = await api.getProjects();
      if (data && data.length > 0) {
        setProjects(data);
        if (!activeProject) setActiveProject(data[0]);
      }
    } catch (e) {
      console.warn('Using default initial projects fallback.', e);
    }
  };

  const createProject = async (name: string, customer_name: string, description?: string) => {
    try {
      const newProj = await api.createProject({ name, customer_name, description });
      await loadProjects();
      setActiveProject(newProj);
      return newProj;
    } catch (e) {
      const newProj: Project = {
        id: String(Date.now()),
        name,
        customer_name,
        description,
        created_at: new Date().toISOString()
      };
      const updated = [newProj, ...projects];
      setProjects(updated);
      setActiveProject(newProj);
      return newProj;
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <ProjectContext.Provider value={{ projects, activeProject, setActiveProject, loadProjects, createProject }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => useContext(ProjectContext);
