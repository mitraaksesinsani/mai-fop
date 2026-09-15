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

export interface DRMItem {
  id: string;
  code: string;
  description: string;
  type: string;
  unit: string;
  volumeTarget: number;
  weightPercent: number;
}

export interface DRMData {
  documentNo: string;
  approvalDate?: string;
  status: 'Draft' | 'Approved' | 'Baselined';
  reviewer?: string;
  notes?: string;
  items: DRMItem[];
}

export interface DailyProgressLog {
  id: string;
  date: string;
  designatorCode: string;
  description: string;
  volume: number;
  unit: string;
  workTool?: string;
  manpower?: number;
  foreman?: string;
  span?: string;
  notes?: string;
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

  // Implementation Baseline & Logs
  drmData?: DRMData;
  progressLogs?: DailyProgressLog[];
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
    
    // Fetch real data from Supabase
    const fetchRealData = async () => {
      setIsLoading(true);
      const res = await getProjects();
      const isInitialized = typeof window !== 'undefined' && localStorage.getItem('nims_db_initialized') === 'true';

      if (res.success && res.data) {
        if (res.data.length > 0) {
          setProjects(res.data as Project[]);
          localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(res.data));
          localStorage.setItem('nims_db_initialized', 'true');
          if (!savedId && res.data.length > 0) {
            setSelectedProjectIdState(res.data[0].id);
          }
        } else if (isInitialized) {
          // If database is empty and user already interacted/deleted items, show empty
          setProjects([]);
          localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify([]));
        } else {
          // First time launch: use local storage or default sample projects
          const localSaved = localStorage.getItem(PROJECTS_STORAGE_KEY);
          if (localSaved) {
            try {
              const parsed = JSON.parse(localSaved);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setProjects(parsed);
                setIsLoading(false);
                return;
              }
            } catch (e) {
              // Ignore parse error
            }
          }
          setProjects(DEFAULT_PROJECTS);
          localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(DEFAULT_PROJECTS));
          localStorage.setItem('nims_db_initialized', 'true');
          if (!savedId && DEFAULT_PROJECTS.length > 0) {
            setSelectedProjectIdState(DEFAULT_PROJECTS[0].id);
          }
        }
      } else {
        // Fallback to local storage or initial sample projects
        const localSaved = localStorage.getItem(PROJECTS_STORAGE_KEY);
        if (localSaved) {
          try {
            const parsed = JSON.parse(localSaved);
            if (Array.isArray(parsed)) {
              setProjects(parsed);
              setIsLoading(false);
              return;
            }
          } catch (e) {
            // Ignore parse error
          }
        }
        setProjects(DEFAULT_PROJECTS);
        if (!savedId && DEFAULT_PROJECTS.length > 0) {
          setSelectedProjectIdState(DEFAULT_PROJECTS[0].id);
        }
      }
      setIsLoading(false);
    };

    fetchRealData();
  }, []);

  // Save projects to localStorage whenever it changes (as backup cache)
  useEffect(() => {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  const setSelectedProjectId = (id: string) => {
    setSelectedProjectIdState(id);
    localStorage.setItem(LOCAL_STORAGE_KEY, id);
  };

  const addProject = async (newProj: Project) => {
    // Optimistic UI update & immediate sync to localStorage
    setProjects((prev) => {
      const next = [newProj, ...prev];
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(next));
      localStorage.setItem('nims_db_initialized', 'true');
      return next;
    });
    setSelectedProjectId(newProj.id);

    // Save to Supabase
    try {
      await addProjectRecord(newProj);
    } catch (err) {
      console.error('Failed to add project to database', err);
    }
  };

  const updateProject = async (id: string, updatedData: Partial<Project>) => {
    // Optimistic UI update & immediate sync to localStorage
    setProjects((prev) => {
      const next = prev.map((proj) => (proj.id === id ? { ...proj, ...updatedData } : proj));
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(next));
      return next;
    });

    // Save to Supabase
    try {
      await updateProjectRecord(id, updatedData);
    } catch (err) {
      console.error('Failed to update project in database', err);
    }
  };

  const deleteProject = async (id: string) => {
    // Optimistic UI update & immediate sync to localStorage
    setProjects((prev) => {
      const next = prev.filter((proj) => proj.id !== id);
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(next));
      localStorage.setItem('nims_db_initialized', 'true');
      return next;
    });

    if (selectedProjectId === id) {
      setProjects((currentProjects) => {
        const remaining = currentProjects.filter((proj) => proj.id !== id);
        setSelectedProjectId(remaining.length > 0 ? remaining[0].id : '');
        return currentProjects;
      });
    }
    
    // Delete from Supabase
    try {
      await deleteProjectRecord(id);
    } catch (err) {
      console.error('Failed to delete project from database', err);
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
