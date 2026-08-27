'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getProjects, deleteProjectRecord, addProjectRecord, updateProjectRecord } from '@/app/actions/projects';

export interface BOQItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

export interface CommercialData {
  capex: number;
  opex: number;
  revenue: number;
}

export interface Project {
  id: string;
  name: string;
  customer: string;
  type?: string;
  location?: string;
  contractNo?: string;
  startDate?: string;
  targetDate?: string;
  manager?: string;
  status?: string;
  
  // Phase 1: Engineering Data
  boqItems?: BOQItem[];
  routeNotes?: string;
  commercial?: CommercialData;
}

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'PRJ-2026-001',
    name: 'Backbone Fiber Jakarta - Bandung',
    customer: 'PT Telkomsel Tbk',
    type: 'Backbone Fiber',
    location: 'DKI Jakarta & Jawa Barat',
    contractNo: 'CTR/TEL/2026/089',
    startDate: '2026-01-15',
    targetDate: '2026-06-30',
    manager: 'Budi Santoso',
    status: 'Implementation',
  },
  {
    id: 'PRJ-2026-002',
    name: 'Metro Ring Surabaya East',
    customer: 'PT Indosat Tbk',
    type: 'Metro Fiber',
    location: 'Surabaya, Jawa Timur',
    contractNo: 'CTR/ISAT/2026/042',
    startDate: '2026-02-01',
    targetDate: '2026-05-15',
    manager: 'Siti Rahma',
    status: 'Survey',
  },
  {
    id: 'PRJ-2026-003',
    name: 'FTTx Access Cluster Medan Center',
    customer: 'PT XL Axiata Tbk',
    type: 'FTTx',
    location: 'Medan, Sumatera Utara',
    contractNo: 'CTR/XL/2026/104',
    startDate: '2026-03-10',
    targetDate: '2026-07-20',
    manager: 'Ahmad Hidayat',
    status: 'DRM',
  },
  {
    id: 'PRJ-2026-004',
    name: 'Enterprise Link Bank Mandiri HQ',
    customer: 'Bank Mandiri',
    type: 'Enterprise Fiber',
    location: 'Jakarta Selatan',
    contractNo: 'CTR/BM/2026/012',
    startDate: '2026-02-15',
    targetDate: '2026-04-10',
    manager: 'Dewi Lestari',
    status: 'Commissioning',
  },
];

interface ProjectContextType {
  projects: Project[];
  selectedProjectId: string;
  selectedProject: Project | null;
  setSelectedProjectId: (id: string) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updatedData: Partial<Project>) => void;
  deleteProject: (id: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'nims_active_project_id';
const PROJECTS_STORAGE_KEY = 'nims_projects_data';

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectIdState] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load active project ID
    const savedId = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedId) {
      setSelectedProjectIdState(savedId);
    }
    
    // Fetch real data from Supabase via Prisma
    const fetchRealData = async () => {
      setIsLoading(true);
      const res = await getProjects();
      if (res.success && res.data) {
        setProjects(res.data as Project[]);
        if (!savedId && res.data.length > 0) {
          setSelectedProjectIdState(res.data[0].id);
        }
      }
      setIsLoading(false);
    };

    fetchRealData();
  }, []);

  // Save projects to localStorage whenever it changes (as backup cache)
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    }
  }, [projects]);

  const setSelectedProjectId = (id: string) => {
    setSelectedProjectIdState(id);
    localStorage.setItem(LOCAL_STORAGE_KEY, id);
  };

  const addProject = async (newProj: Project) => {
    // Optimistic UI update
    setProjects((prev) => [newProj, ...prev]);
    setSelectedProjectId(newProj.id);

    // Save to Supabase
    try {
      await addProjectRecord(newProj);
    } catch (err) {
      console.error('Failed to add project to database', err);
    }
  };

  const updateProject = async (id: string, updatedData: Partial<Project>) => {
    // Optimistic UI update
    setProjects((prev) =>
      prev.map((proj) => (proj.id === id ? { ...proj, ...updatedData } : proj))
    );

    // Save to Supabase
    try {
      await updateProjectRecord(id, updatedData);
    } catch (err) {
      console.error('Failed to update project in database', err);
    }
  };

  const deleteProject = async (id: string) => {
    // Optimistic UI update
    setProjects((prev) => prev.filter((proj) => proj.id !== id));
    if (selectedProjectId === id) {
      const remaining = projects.filter((proj) => proj.id !== id);
      setSelectedProjectId(remaining.length > 0 ? remaining[0].id : '');
    }
    
    // Delete from Supabase
    try {
      await deleteProjectRecord(id);
    } catch (err) {
      console.error('Failed to delete project from database', err);
      // Optional: Refresh projects list from server if deletion fails to restore state
    }
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || null;

  return (
    <ProjectContext.Provider
      value={{
        projects,
        selectedProjectId,
        selectedProject,
        setSelectedProjectId,
        addProject,
        updateProject,
        deleteProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
