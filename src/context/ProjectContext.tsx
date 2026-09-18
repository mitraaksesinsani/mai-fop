'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getProjects, deleteProjectRecord, addProjectRecord, updateProjectRecord } from '@/app/actions/projects';
import { DesignatorItem } from '@/lib/designatorProgress';

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

export interface SurveyRouteData {
  routeNotes?: string;
  startPoint?: string;
  endPoint?: string;
  totalLengthMeters?: number;
  cableType?: string;
  deploymentType?: string;
  feederCapacity?: string;
  updatedAt?: string;
}

export interface SurveyValidationData {
  surveyDate?: string;
  surveyorName?: string;
  feasibility?: 'Feasible' | 'Feasible with Notes' | 'Not Feasible' | string;
  poleCondition?: string;
  rowPermitRisk?: 'Rendah' | 'Sedang' | 'Tinggi' | string;
  findings?: string;
  recommendations?: string;
  verifiedBy?: string;
  updatedAt?: string;
}

export interface SurveyKmlData {
  fileName?: string;
  fileSize?: string;
  uploadDate?: string;
  verifiedBy?: string;
  startCoord?: string;
  endCoord?: string;
  routeStatus?: 'Verified' | 'Need Revision' | 'Pending Verification' | string;
  notes?: string;
  updatedAt?: string;
}

export interface PermitItem {
  id: string;
  siteId: string;
  category?: string;
  status: string;
  progressDetail: string;
  targetDate?: string;
  actualDate?: string;
  picName?: string;
  cost?: number;
  notes?: string;
  checklist?: Record<string, string>;
  createdAt: string;
  updatedAt?: string;
}

export interface DailyReportNote {
  tenagaKerja?: string;
  alatBerat?: string;
  cuaca?: string;
  kendala?: string;
  solusi?: string;
  updatedAt?: string;
}

export interface ProjectEvidence {
  id: string;
  title: string;
  category: 'Galian' | 'Kabel FO' | 'Tiang OSP' | 'Handhole' | 'Jointing' | 'Lainnya';
  date: string;
  location?: string;
  uploader: string;
  imageUrl: string;
  notes?: string;
  createdAt: string;
}

export interface ProjectIssue {
  id: string;
  title: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  category: 'Teknis' | 'Perizinan' | 'Sosial/Warga' | 'Cuaca' | 'Material' | 'Lainnya';
  reportDate: string;
  targetResolutionDate?: string;
  reporter: string;
  pic: string;
  description: string;
  mitigationPlan: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OtdrTestResult {
  id: string;
  testId: string;
  fiberCore: string;
  direction: string;
  distanceKm: number;
  totalLossDb: number;
  eventLossDb: number;
  result: 'PASS' | 'FAIL';
  wavelength?: string;
  testedBy?: string;
  testDate?: string;
  notes?: string;
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
}

export interface CommissioningDefect {
  id: string;
  punchId: string;
  description: string;
  location: string;
  severity: 'Minor' | 'Major' | 'Critical';
  pic: string;
  reportDate?: string;
  dueDate?: string;
  status: 'Open' | 'In Correction' | 'Closed';
  resolutionNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BautAcceptance {
  id: string;
  bautNumber: string;
  title: string;
  clientName: string;
  date: string;
  status: 'Draft' | 'Under Review' | 'Ready for Sign-off' | 'Signed & Approved';
  signatoryVendor?: string;
  signatoryClient?: string;
  scopeCovered?: string;
  notes?: string;
  documentUrl?: string;
  documentName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AsBuiltDocument {
  id: string;
  name: string;
  category: 'Engineering' | 'GIS Spatial' | 'Testing' | 'Acceptance' | 'Lainnya';
  size?: string;
  date: string;
  status: 'Final Verified' | 'Under Review' | 'Customer Signed';
  notes?: string;
  fileUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ProjectAsset {
  id: string;
  assetId: string;
  type: 'Cable Asset' | 'Closure Asset' | 'ODF Asset' | 'Pole Asset' | 'Handhole Asset' | 'Optical Splitter' | 'Lainnya';
  specification: string;
  location: string;
  warranty: string;
  vendor: string;
  status: 'Active / Transferred' | 'In Testing' | 'Under Maintenance';
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ProfitabilityRootCause {
  id: string;
  title: string;
  description: string;
  impactAmount: number;
  impactLevel: 'Low' | 'Moderate' | 'High Cost Impact';
}

export interface ProjectProfitability {
  contractValue: number;
  actualCapex: number;
  actualOpex: number;
  rabBudget: number;
  notes?: string;
  rootCauses: ProfitabilityRootCause[];
  updatedAt: string;
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
  projectCode?: string;
  scope?: string;
  
  // Phase 1: Engineering Data
  boqItems?: BOQItem[];
  routeNotes?: string;
  surveyRoute?: SurveyRouteData;
  surveyValidation?: SurveyValidationData;
  surveyKml?: SurveyKmlData;
  permits?: PermitItem[];
  commercial?: CommercialData;

  // Implementation Baseline & Logs
  drmData?: DRMData;
  progressLogs?: DailyProgressLog[];
  designatorItems?: DesignatorItem[];
  dailyReports?: Record<string, DailyReportNote>;
  evidences?: ProjectEvidence[];
  issues?: ProjectIssue[];

  // Commissioning Data
  otdrTests?: OtdrTestResult[];
  defects?: CommissioningDefect[];
  bauts?: BautAcceptance[];

  // Closing & Handover Data
  asBuiltDocs?: AsBuiltDocument[];
  assets?: ProjectAsset[];
  profitability?: ProjectProfitability;
}

export const DEFAULT_PROJECTS: Project[] = [];

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

  const isDummyProject = (p: any): boolean => {
    if (!p || !p.name) return true;
    const name = (p.name || '').toLowerCase();
    const contract = (p.contractNo || '').toLowerCase();
    const id = (p.id || '').toLowerCase();
    return (
      name.includes('sdsd') ||
      name.includes('qqqq') ||
      name.includes('qwqw') ||
      name.includes('asdasd') ||
      name.includes('dummy') ||
      name.includes('test 123') ||
      contract.includes('sdsd') ||
      id === 'prj-001' ||
      id === 'prj-002' ||
      id === 'prj-003' ||
      id === 'prj-004'
    );
  };

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

      if (res.success && res.data) {
        const cleanData = (res.data as Project[]).filter((p) => !isDummyProject(p));
        if (cleanData.length > 0) {
          setProjects(cleanData);
          localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(cleanData));
          localStorage.setItem('nims_db_initialized', 'true');
          if (!savedId || !cleanData.some((p) => p.id === savedId)) {
            setSelectedProjectIdState(cleanData[0].id);
          }
        } else {
          // Database kosong: biarkan list proyek kosong bersih!
          setProjects([]);
          localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify([]));
          localStorage.setItem('nims_db_initialized', 'true');
          setSelectedProjectIdState('');
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      } else {
        // Fallback jika offline
        const localSaved = localStorage.getItem(PROJECTS_STORAGE_KEY);
        if (localSaved) {
          try {
            const parsed = JSON.parse(localSaved);
            if (Array.isArray(parsed)) {
              const filtered = parsed.filter((p) => !isDummyProject(p));
              setProjects(filtered);
              setIsLoading(false);
              return;
            }
          } catch (e) {
            // Ignore parse error
          }
        }
        setProjects([]);
        setSelectedProjectIdState('');
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
