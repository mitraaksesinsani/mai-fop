'use client';

import { useParams, useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import * as htmlToImage from 'html-to-image';
import { useProject } from '@/context/ProjectContext';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Edit, Plus, Upload, Map, CircleDollarSign, CheckCircle, FileText, Search, Lock, TrendingUp, Camera, AlertTriangle, Zap, Wrench, FileCheck2, Book, Database, PenTool, Trash2, Activity, ClipboardCheck, FileCheck, Hammer, Flag, RefreshCw, Edit3, CloudSun, Calendar, MapPin, User, Image as ImageIcon, CheckCircle2, XCircle, Download, AlertCircle, ShieldCheck, FolderArchive, DollarSign, ArrowDownRight } from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import SCurveChart from '@/components/projects/SCurveChart';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import CumulativeProgressTable from '@/components/projects/CumulativeProgressTable';
import {
  DEFAULT_DESIGNATOR_ITEMS,
  DesignatorItem,
  calculateOverallProjectProgress,
  generateSCurveData,
  generateProgressDates,
  toISODateString,
  formatDisplayDate,
} from '@/lib/designatorProgress';

import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { useBowheer } from '@/context/BowheerContext';
import { getUsersAction, getMaterialsAction } from '@/app/actions/masterData';
import {
  getPermitsAction,
  savePermitAction,
  deletePermitAction,
  saveSurveyValidationAction,
  saveSurveyKmlAction,
  getSurveyDataAction,
  saveDailyReportNoteAction,
  getDailyReportsAction,
  saveDesignatorProgressAction,
  getDesignatorProgressAction,
  getProjectEvidencesAction,
  saveProjectEvidenceAction,
  deleteProjectEvidenceAction,
  getProjectIssuesAction,
  saveProjectIssueAction,
  deleteProjectIssueAction,
  getProjectOtdrTestsAction,
  saveProjectOtdrTestAction,
  deleteProjectOtdrTestAction,
  getProjectDefectsAction,
  saveProjectDefectAction,
  deleteProjectDefectAction,
  getProjectBautsAction,
  saveProjectBautAction,
  deleteProjectBautAction,
  getProjectAsBuiltDocsAction,
  saveProjectAsBuiltDocAction,
  deleteProjectAsBuiltDocAction,
  getProjectAssetsAction,
  saveProjectAssetAction,
  deleteProjectAssetAction,
  getProjectProfitabilityAction,
  saveProjectProfitabilityAction,
} from '@/app/actions/projects';
import { ServerSystemUser, ServerMaterial } from '@/lib/serverDb';

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { projects, updateProject } = useProject();

  const activeTab = searchParams.get('tab') || 'overview';
  const planningTab = searchParams.get('planningTab') || 'boq';
  const surveyTab = searchParams.get('surveyTab') || 'route';
  const implTab = searchParams.get('implTab') || 'daily';
  const commTab = searchParams.get('commTab') || 'tests';
  const closeTab = searchParams.get('closeTab') || 'docs';

  const handleTabChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('tab', value);
    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  const handleSubTabChange = (paramName: string, value: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set(paramName, value);
    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark' || (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));

  // Export State
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const [exportText, setExportText] = useState('Copy Data');

  const handleExportImage = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    setExportText('Menyalin...');
    try {
      const isDarkMode = resolvedTheme === 'dark' || (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));
      const bgColor = isDarkMode ? '#111318' : '#ffffff';

      const blob = await htmlToImage.toBlob(reportRef.current, {
        backgroundColor: bgColor,
        pixelRatio: 2, // 300 DPI 2x se-HD mungkin
        cacheBust: true,
        quality: 0.95,
        style: {
          color: isDarkMode ? '#f8fafc' : '#0f172a',
        },
      });
      
      if (!blob) {
        throw new Error('Blob gambar kosong');
      }

      let copied = false;

      // Cek apakah dokumen sedang fokus dan clipboard API didukung sebelum memanggil write
      const isDocumentFocused = typeof document !== 'undefined' && typeof document.hasFocus === 'function' && document.hasFocus();
      const hasClipboardSupport = typeof navigator !== 'undefined' && Boolean(navigator?.clipboard?.write) && typeof ClipboardItem !== 'undefined';

      if (isDocumentFocused && hasClipboardSupport) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          copied = true;
          setExportText('Tersalin!');
          toast.success('Gambar laporan HD berhasil disalin ke clipboard');
          setTimeout(() => setExportText('Copy Data'), 3000);
        } catch {
          copied = false;
        }
      }

      // Fallback otomatis jika clipboard tidak fokus atau tidak diizinkan
      if (!copied) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const safeName = project?.name ? project.name.replace(/[^a-zA-Z0-9_-]/g, '_') : (project?.id || 'Project');
        a.download = `Laporan_Harian_${safeName}_${selectedReportDate}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setExportText('Diunduh!');
        toast.info('Gambar laporan HD otomatis diunduh sebagai file PNG.');
        setTimeout(() => setExportText('Copy Data'), 3000);
      }
    } catch (err) {
      console.error('Gagal membuat gambar laporan', err);
      setExportText('Gagal Export');
      toast.error('Gagal mengekspor gambar laporan');
      setTimeout(() => setExportText('Copy Data'), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  // Phase 1 States
  const [isEditingBOQ, setIsEditingBOQ] = useState(false);
  const [newBOQItem, setNewBOQItem] = useState({ name: '', quantity: 1, unit: 'm', price: 0 });

  // Commercial States
  const [commercialData, setCommercialData] = useState({ capex: 0, opex: 0, revenue: 0 });
  const [isEditingCommercial, setIsEditingCommercial] = useState(false);

  // Find the project based on the decoded ID from URL
  const decodedId = decodeURIComponent(params?.id || '');
  const project = projects.find((p) => p.id === decodedId);

  // Master Users & Materials from Master Data Server (Real Database)
  const [masterUsers, setMasterUsers] = useState<ServerSystemUser[]>([]);
  const [serverMaterials, setServerMaterials] = useState<ServerMaterial[]>([]);
  const { activeBowheers } = useBowheer();

  useEffect(() => {
    let isMounted = true;
    getUsersAction().then((res) => {
      if (isMounted && res.success && res.data) {
        setMasterUsers(res.data);
      }
    });
    getMaterialsAction().then((res) => {
      if (isMounted && res.success && res.data) {
        setServerMaterials(res.data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Material list real from database (materialMasters / materials)
  const availableMaterials = useMemo(() => {
    return serverMaterials
      .filter((sm) => sm.isActive !== false)
      .map((sm) => ({
        id: sm.id,
        code: sm.materialCode,
        name: sm.materialName,
        unit: sm.unit || 'unit',
        price: Number(sm.unitPrice ?? sm.price ?? 0),
        category: sm.category,
        specification: sm.specification,
      }));
  }, [serverMaterials]);

  // Edit Detail Dialog State
  const [isEditDetailOpen, setIsEditDetailOpen] = useState(false);
  const [isSavingDetail, setIsSavingDetail] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    customer: '',
    type: '',
    location: '',
    contractNo: '',
    startDate: '',
    targetDate: '',
    manager: '',
    scope: '',
  });

  const handleOpenEditDetail = () => {
    if (!project) return;
    setEditFormData({
      name: project.name || '',
      customer: project.customer || '',
      type: project.type || '',
      location: project.location || '',
      contractNo: project.contractNo || project.projectCode || '',
      startDate: project.startDate ? project.startDate.split('T')[0] : '',
      targetDate: project.targetDate ? project.targetDate.split('T')[0] : '',
      manager: project.manager || '',
      scope: project.scope || '',
    });
    setIsEditDetailOpen(true);
  };

  const handleSaveEditDetail = async () => {
    if (!project) return;
    setIsSavingDetail(true);
    try {
      await updateProject(project.id, {
        name: editFormData.name.trim(),
        customer: editFormData.customer.trim(),
        type: editFormData.type.trim(),
        location: editFormData.location.trim(),
        contractNo: editFormData.contractNo.trim(),
        projectCode: editFormData.contractNo.trim(),
        startDate: editFormData.startDate || undefined,
        targetDate: editFormData.targetDate || undefined,
        manager: editFormData.manager.trim(),
        scope: editFormData.scope.trim(),
      });
      toast.success('Detail proyek berhasil diperbarui');
      setIsEditDetailOpen(false);
    } catch (err) {
      console.error('Failed to update project detail', err);
      toast.error('Gagal memperbarui detail proyek');
    } finally {
      setIsSavingDetail(false);
    }
  };

  const picUser = useMemo(() => {
    if (!project?.manager || masterUsers.length === 0) return null;
    return masterUsers.find(
      (u) =>
        u.fullName.toLowerCase() === project.manager?.toLowerCase() ||
        u.username.toLowerCase() === project.manager?.toLowerCase()
    );
  }, [project?.manager, masterUsers]);

  // ==========================================
  // SURVEY STATES & HANDLERS (REAL DATABASE)
  // ==========================================

  // 1. Survey Route State
  const [isEditingRoute, setIsEditingRoute] = useState(false);
  const [isSavingRoute, setIsSavingRoute] = useState(false);
  const [routeFormData, setRouteFormData] = useState({
    startPoint: '',
    endPoint: '',
    totalLengthMeters: '',
    cableType: '',
    deploymentType: 'Aerial (Tiang)',
    feederCapacity: '24 Core',
    routeNotes: '',
  });

  const handleOpenEditRoute = () => {
    setRouteFormData({
      startPoint: project?.surveyRoute?.startPoint || '',
      endPoint: project?.surveyRoute?.endPoint || '',
      totalLengthMeters: project?.surveyRoute?.totalLengthMeters ? String(project.surveyRoute.totalLengthMeters) : '',
      cableType: project?.surveyRoute?.cableType || 'Kabel Fiber Optik ADSS 24 Core',
      deploymentType: project?.surveyRoute?.deploymentType || 'Aerial (Tiang)',
      feederCapacity: project?.surveyRoute?.feederCapacity || '24 Core',
      routeNotes: project?.surveyRoute?.routeNotes || project?.routeNotes || '',
    });
    setIsEditingRoute(true);
  };

  const handleSaveRoute = async () => {
    if (!project) return;
    setIsSavingRoute(true);
    try {
      const payload = {
        startPoint: routeFormData.startPoint.trim(),
        endPoint: routeFormData.endPoint.trim(),
        totalLengthMeters: routeFormData.totalLengthMeters ? Number(routeFormData.totalLengthMeters) : 0,
        cableType: routeFormData.cableType.trim(),
        deploymentType: routeFormData.deploymentType,
        feederCapacity: routeFormData.feederCapacity,
        routeNotes: routeFormData.routeNotes.trim(),
        updatedAt: new Date().toISOString(),
      };
      await updateProject(project.id, {
        surveyRoute: payload,
        routeNotes: payload.routeNotes,
      });
      toast.success('Data Rute & Catuan Fiber berhasil disimpan ke database');
      setIsEditingRoute(false);
    } catch (err) {
      console.error('Failed to save survey route', err);
      toast.error('Gagal menyimpan rute fiber');
    } finally {
      setIsSavingRoute(false);
    }
  };

  // 2. Survey Validation State (Real Database & Server Action)
  const [surveyValidationData, setSurveyValidationData] = useState<any>(project?.surveyValidation || null);
  const [isEditingValidation, setIsEditingValidation] = useState(false);
  const [isSavingValidation, setIsSavingValidation] = useState(false);
  const [validationFormData, setValidationFormData] = useState({
    surveyDate: '',
    surveyorName: '',
    feasibility: 'Layak dengan Catatan',
    poleCondition: '',
    rowPermitRisk: 'Sedang',
    findings: '',
    recommendations: '',
    verifiedBy: '',
  });

  // 3. Survey KML State (Real Database & Real File Upload)
  const [surveyKmlData, setSurveyKmlData] = useState<any>(project?.surveyKml || null);
  const [isEditingKml, setIsEditingKml] = useState(false);
  const [isSavingKml, setIsSavingKml] = useState(false);
  const [isUploadingKmlFile, setIsUploadingKmlFile] = useState(false);
  const kmlFileInputRef = useRef<HTMLInputElement>(null);
  const [kmlFormData, setKmlFormData] = useState({
    fileName: '',
    fileSize: '',
    uploadDate: '',
    verifiedBy: '',
    startCoord: '',
    endCoord: '',
    routeStatus: 'Verified',
    notes: '',
  });

  // Sinkronkan dan muat data survey real dari database
  useEffect(() => {
    const targetId = project?.id || decodedId;
    if (!targetId) return;

    if (project?.surveyValidation) setSurveyValidationData(project.surveyValidation);
    if (project?.surveyKml) setSurveyKmlData(project.surveyKml);

    getSurveyDataAction(targetId).then((res) => {
      if (res.success && res.data) {
        if (res.data.surveyValidation) {
          setSurveyValidationData(res.data.surveyValidation);
        }
        if (res.data.surveyKml) {
          setSurveyKmlData(res.data.surveyKml);
        }
      }
    }).catch((err) => {
      console.warn('Gagal memuat survey data:', err);
    });
  }, [decodedId, project?.id, project?.surveyValidation, project?.surveyKml]);

  const handleOpenEditValidation = () => {
    const current = surveyValidationData || project?.surveyValidation;
    setValidationFormData({
      surveyDate: current?.surveyDate || toISODateString(new Date()),
      surveyorName: current?.surveyorName || project?.manager || '',
      feasibility: current?.feasibility || 'Layak dengan Catatan',
      poleCondition: current?.poleCondition || '',
      rowPermitRisk: current?.rowPermitRisk || 'Sedang',
      findings: current?.findings || '',
      recommendations: current?.recommendations || '',
      verifiedBy: current?.verifiedBy || '',
    });
    setIsEditingValidation(true);
  };

  const handleSaveValidation = async () => {
    const targetId = project?.id || decodedId;
    if (!targetId) return;
    if (!validationFormData.surveyDate) {
      toast.error('Mohon tentukan tanggal survey');
      return;
    }
    setIsSavingValidation(true);
    try {
      const payload = {
        ...validationFormData,
        updatedAt: new Date().toISOString(),
      };

      // 1. Simpan ke database via Server Action
      const res = await saveSurveyValidationAction(targetId, payload);
      if (!res.success) {
        throw new Error(res.error || 'Gagal menyimpan ke database');
      }

      // 2. Update state lokal instan
      setSurveyValidationData(payload);

      // 3. Sinkronkan ke context
      if (project) {
        await updateProject(project.id, { surveyValidation: payload });
      }

      toast.success('Hasil validasi survey berhasil disimpan ke database');
      setIsEditingValidation(false);
    } catch (err: any) {
      console.error('Failed to save survey validation', err);
      toast.error(err?.message || 'Gagal menyimpan validasi survey');
    } finally {
      setIsSavingValidation(false);
    }
  };

  const handleOpenEditKml = () => {
    const current = surveyKmlData || project?.surveyKml;
    setKmlFormData({
      fileName: current?.fileName || `Route_FO_${project?.contractNo || project?.name || 'Sentul'}.kml`,
      fileSize: current?.fileSize || '1.2 MB',
      uploadDate: current?.uploadDate || toISODateString(new Date()),
      verifiedBy: current?.verifiedBy || project?.manager || '',
      startCoord: current?.startCoord || '-6.553210, 106.854120',
      endCoord: current?.endCoord || '-6.578910, 106.883450',
      routeStatus: current?.routeStatus || 'Verified',
      notes: current?.notes || 'Track KML hasil survey rute fiber optik.',
    });
    setIsEditingKml(true);
  };

  // Handler saat user mengunggah file KML/KMZ nyata
  const handleKmlFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    const fileSize = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${(file.size / 1024).toFixed(1)} KB`;

    setIsUploadingKmlFile(true);

    if (fileName.toLowerCase().endsWith('.kml')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = (event.target?.result as string) || '';
          const coordMatch = content.match(/<coordinates>([\s\S]*?)<\/coordinates>/i);
          let extractedStart = '';
          let extractedEnd = '';

          if (coordMatch && coordMatch[1]) {
            const rawCoords = coordMatch[1].trim().split(/\s+/).filter(Boolean);
            if (rawCoords.length > 0) {
              const first = rawCoords[0].split(',');
              if (first.length >= 2) {
                extractedStart = `${Number(first[1]).toFixed(6)}, ${Number(first[0]).toFixed(6)}`;
              }
              const last = rawCoords[rawCoords.length - 1].split(',');
              if (last.length >= 2) {
                extractedEnd = `${Number(last[1]).toFixed(6)}, ${Number(last[0]).toFixed(6)}`;
              }
            }
          }

          setKmlFormData((prev) => ({
            ...prev,
            fileName,
            fileSize,
            uploadDate: toISODateString(new Date()),
            startCoord: extractedStart || prev.startCoord || '-6.553210, 106.854120',
            endCoord: extractedEnd || prev.endCoord || '-6.578910, 106.883450',
          }));
          toast.success(`File ${fileName} (${fileSize}) siap diunggah ke database.`);
        } catch (readErr) {
          setKmlFormData((prev) => ({
            ...prev,
            fileName,
            fileSize,
            uploadDate: toISODateString(new Date()),
          }));
        } finally {
          setIsUploadingKmlFile(false);
        }
      };
      reader.readAsText(file);
    } else {
      setKmlFormData((prev) => ({
        ...prev,
        fileName,
        fileSize,
        uploadDate: toISODateString(new Date()),
      }));
      setIsUploadingKmlFile(false);
      toast.success(`File ${fileName} (${fileSize}) siap disimpan ke database.`);
    }
  };

  const handleSaveKml = async () => {
    const targetId = project?.id || decodedId;
    if (!targetId) return;
    if (!kmlFormData.fileName.trim()) {
      toast.error('Mohon tentukan file KML terlebih dahulu');
      return;
    }
    setIsSavingKml(true);
    try {
      const payload = {
        ...kmlFormData,
        updatedAt: new Date().toISOString(),
      };

      // 1. Simpan ke database via Server Action
      const res = await saveSurveyKmlAction(targetId, payload);
      if (!res.success) {
        throw new Error(res.error || 'Gagal menyimpan ke database');
      }

      // 2. Update state lokal instan
      setSurveyKmlData(payload);

      // 3. Sinkronkan ke context
      if (project) {
        await updateProject(project.id, { surveyKml: payload });
      }

      toast.success('Data verifikasi KML & GIS berhasil disimpan ke database');
      setIsEditingKml(false);
    } catch (err: any) {
      console.error('Failed to save KML data', err);
      toast.error(err?.message || 'Gagal menyimpan data KML');
    } finally {
      setIsSavingKml(false);
    }
  };

  // 4. Survey Permits State (Real Database & Server Action)
  const [permitsList, setPermitsList] = useState<any[]>([]);
  const [isLoadingPermits, setIsLoadingPermits] = useState(false);
  const [isPermitDialogOpen, setIsPermitDialogOpen] = useState(false);
  const [isSavingPermit, setIsSavingPermit] = useState(false);
  const [editingPermitId, setEditingPermitId] = useState<string | null>(null);
  const [permitFormData, setPermitFormData] = useState({
    siteId: '',
    category: 'PU Kota / Kab',
    status: 'Perizinan',
    progressDetail: '2.4 Survey lokasi bersama PU',
    targetDate: '',
    picName: '',
    cost: '',
    notes: '',
    checklistPU: '4',
  });

  // Muat data perizinan dari Server Action (Database Real)
  const refreshPermits = async () => {
    const targetId = project?.id || decodedId;
    if (!targetId) return;
    setIsLoadingPermits(true);
    try {
      const res = await getPermitsAction(targetId);
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setPermitsList(res.data);
        setIsLoadingPermits(false);
        return;
      }
    } catch (err) {
      console.warn('Gagal memuat permits dari database:', err);
    }
    // Fallback ke project?.permits jika ada
    if (Array.isArray(project?.permits) && project.permits.length > 0) {
      setPermitsList(project.permits);
    }
    setIsLoadingPermits(false);
  };

  useEffect(() => {
    refreshPermits();
  }, [decodedId, project?.id, project?.permits]);

  const handleOpenAddPermit = () => {
    setEditingPermitId(null);
    setPermitFormData({
      siteId: '',
      category: 'PU Kota / Kab',
      status: 'Perizinan',
      progressDetail: '2.4 Survey lokasi bersama PU',
      targetDate: '',
      picName: project?.manager || '',
      cost: '',
      notes: '',
      checklistPU: '4',
    });
    setIsPermitDialogOpen(true);
  };

  const handleOpenEditPermit = (permit: any) => {
    setEditingPermitId(permit.id);
    setPermitFormData({
      siteId: permit.siteId || '',
      category: permit.category || 'PU Kota / Kab',
      status: permit.status || 'Perizinan',
      progressDetail: permit.progressDetail || '',
      targetDate: permit.targetDate || '',
      picName: permit.picName || '',
      cost: permit.cost ? String(permit.cost) : '',
      notes: permit.notes || '',
      checklistPU: permit.checklist?.[permit.category || 'PU Kota / Kab'] || '4',
    });
    setIsPermitDialogOpen(true);
  };

  const handleSavePermit = async () => {
    const targetId = project?.id || decodedId;
    if (!targetId) return;
    if (!permitFormData.siteId.trim()) {
      toast.error('Mohon isi Site ID terlebih dahulu');
      return;
    }
    setIsSavingPermit(true);
    try {
      const existingPermit = permitsList.find((p) => p.id === editingPermitId);
      const permitItem = {
        id: editingPermitId || `pmt-${Date.now()}`,
        siteId: permitFormData.siteId.trim(),
        category: permitFormData.category,
        status: permitFormData.status,
        progressDetail: permitFormData.progressDetail,
        targetDate: permitFormData.targetDate || undefined,
        picName: permitFormData.picName.trim(),
        cost: permitFormData.cost ? Number(permitFormData.cost) : 0,
        notes: permitFormData.notes.trim(),
        checklist: { [permitFormData.category]: permitFormData.checklistPU },
        createdAt: existingPermit?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 1. Simpan ke database via Server Action
      const res = await savePermitAction(targetId, permitItem);
      if (!res.success) {
        throw new Error(res.error || 'Gagal menyimpan ke database');
      }

      // 2. Update state lokal secara reaktif & instan
      setPermitsList((prev) => {
        if (editingPermitId) {
          return prev.map((p) => (p.id === editingPermitId ? permitItem : p));
        } else {
          return [permitItem, ...prev];
        }
      });

      // 3. Sinkronkan ke context project
      if (project) {
        const existingList = Array.isArray(project.permits) ? project.permits : [];
        let updatedList;
        if (editingPermitId) {
          updatedList = existingList.map((p) => (p.id === editingPermitId ? permitItem : p));
        } else {
          updatedList = [permitItem, ...existingList];
        }
        await updateProject(project.id, { permits: updatedList });
      }

      toast.success(editingPermitId ? 'Data perizinan berhasil diperbarui di database' : 'Data perizinan berhasil disimpan ke database');
      setIsPermitDialogOpen(false);
    } catch (err: any) {
      console.error('Failed to save permit', err);
      toast.error(err?.message || 'Gagal menyimpan perizinan');
    } finally {
      setIsSavingPermit(false);
    }
  };

  const handleDeletePermit = async (permitId: string) => {
    const targetId = project?.id || decodedId;
    if (!targetId) return;
    try {
      // 1. Hapus via Server Action
      const res = await deletePermitAction(targetId, permitId);
      if (!res.success) {
        throw new Error(res.error || 'Gagal menghapus data dari database');
      }

      // 2. Update state lokal
      setPermitsList((prev) => prev.filter((p) => p.id !== permitId));

      // 3. Update context
      if (project) {
        const existingList = Array.isArray(project.permits) ? project.permits : [];
        const updatedList = existingList.filter((p) => p.id !== permitId);
        await updateProject(project.id, { permits: updatedList });
      }

      toast.success('Data perizinan berhasil dihapus dari database');
    } catch (err: any) {
      console.error('Failed to delete permit', err);
      toast.error(err?.message || 'Gagal menghapus data perizinan');
    }
  };

  // =========================================================================
  // 4B. EVIDENCE VAULT & ISSUE CONTROL STATES (REAL DATABASE)
  // =========================================================================
  const [evidencesList, setEvidencesList] = useState<any[]>([]);
  const [isLoadingEvidences, setIsLoadingEvidences] = useState(false);
  const [isEvidenceDialogOpen, setIsEvidenceDialogOpen] = useState(false);
  const [isSavingEvidence, setIsSavingEvidence] = useState(false);
  const evidenceFileInputRef = useRef<HTMLInputElement>(null);
  const [evidenceFormData, setEvidenceFormData] = useState({
    title: '',
    category: 'Galian',
    date: toISODateString(new Date()),
    location: '',
    uploader: '',
    imageUrl: '',
    notes: '',
  });

  const [issuesList, setIssuesList] = useState<any[]>([]);
  const [isLoadingIssues, setIsLoadingIssues] = useState(false);
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false);
  const [isSavingIssue, setIsSavingIssue] = useState(false);
  const [editingIssueId, setEditingIssueId] = useState<string | null>(null);
  const [issueFormData, setIssueFormData] = useState({
    title: '',
    severity: 'Medium',
    status: 'Open',
    category: 'Teknis',
    reportDate: toISODateString(new Date()),
    targetResolutionDate: '',
    reporter: '',
    pic: '',
    description: '',
    mitigationPlan: '',
  });

  // Muat evidences dan issues dari database server
  useEffect(() => {
    const targetId = project?.id || decodedId;
    if (!targetId) return;

    if (Array.isArray(project?.evidences)) {
      setEvidencesList(project.evidences);
    }
    if (Array.isArray(project?.issues)) {
      setIssuesList(project.issues);
    }

    getProjectEvidencesAction(targetId).then((res) => {
      if (res.success && Array.isArray(res.data)) {
        setEvidencesList(res.data);
      }
    }).catch((err) => console.warn('Gagal memuat evidences:', err));

    getProjectIssuesAction(targetId).then((res) => {
      if (res.success && Array.isArray(res.data)) {
        setIssuesList(res.data);
      }
    }).catch((err) => console.warn('Gagal memuat issues:', err));
  }, [decodedId, project?.id, project?.evidences, project?.issues]);

  const handleOpenAddEvidence = () => {
    setEvidenceFormData({
      title: '',
      category: 'Galian',
      date: toISODateString(new Date()),
      location: project?.location || '',
      uploader: project?.manager || '',
      imageUrl: '',
      notes: '',
    });
    setIsEvidenceDialogOpen(true);
  };

  const handleEvidenceImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = (event.target?.result as string) || '';
      setEvidenceFormData((prev) => ({
        ...prev,
        imageUrl: dataUrl,
        title: prev.title || file.name.replace(/\.[^/.]+$/, ''),
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEvidence = async () => {
    const targetId = project?.id || decodedId;
    if (!targetId) return;

    if (!evidenceFormData.title.trim()) {
      toast.error('Mohon isi judul dokumentasi');
      return;
    }

    setIsSavingEvidence(true);
    try {
      const payload = {
        ...evidenceFormData,
        imageUrl: evidenceFormData.imageUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=800&auto=format&fit=crop&q=60',
      };

      const res = await saveProjectEvidenceAction(targetId, payload);
      if (!res.success) {
        throw new Error(res.error || 'Gagal menyimpan dokumentasi');
      }

      setEvidencesList((prev) => [res.data, ...prev.filter((e) => e.id !== res.data.id)]);

      if (project) {
        const existing = Array.isArray(project.evidences) ? project.evidences : [];
        updateProject(project.id, { evidences: [res.data, ...existing.filter((e) => e.id !== res.data.id)] });
      }

      toast.success('Dokumentasi pekerjaan berhasil disimpan ke database server!');
      setIsEvidenceDialogOpen(false);
    } catch (err: any) {
      console.error('Failed to save evidence', err);
      toast.error(err?.message || 'Gagal menyimpan dokumentasi');
    } finally {
      setIsSavingEvidence(false);
    }
  };

  const handleDeleteEvidence = async (evidenceId: string) => {
    const targetId = project?.id || decodedId;
    if (!targetId) return;

    try {
      const res = await deleteProjectEvidenceAction(targetId, evidenceId);
      if (!res.success) {
        throw new Error(res.error || 'Gagal menghapus dokumentasi');
      }

      setEvidencesList((prev) => prev.filter((e) => e.id !== evidenceId));

      if (project) {
        const existing = Array.isArray(project.evidences) ? project.evidences : [];
        updateProject(project.id, { evidences: existing.filter((e) => e.id !== evidenceId) });
      }

      toast.success('Dokumentasi berhasil dihapus dari database');
    } catch (err: any) {
      console.error('Failed to delete evidence', err);
      toast.error(err?.message || 'Gagal menghapus dokumentasi');
    }
  };

  const handleOpenAddIssue = () => {
    setEditingIssueId(null);
    setIssueFormData({
      title: '',
      severity: 'Medium',
      status: 'Open',
      category: 'Teknis',
      reportDate: toISODateString(new Date()),
      targetResolutionDate: '',
      reporter: project?.manager || '',
      pic: '',
      description: '',
      mitigationPlan: '',
    });
    setIsIssueDialogOpen(true);
  };

  const handleOpenEditIssue = (issue: any) => {
    setEditingIssueId(issue.id);
    setIssueFormData({
      title: issue.title || '',
      severity: issue.severity || 'Medium',
      status: issue.status || 'Open',
      category: issue.category || 'Teknis',
      reportDate: issue.reportDate || toISODateString(new Date()),
      targetResolutionDate: issue.targetResolutionDate || '',
      reporter: issue.reporter || '',
      pic: issue.pic || '',
      description: issue.description || '',
      mitigationPlan: issue.mitigationPlan || '',
    });
    setIsIssueDialogOpen(true);
  };

  const handleSaveIssue = async () => {
    const targetId = project?.id || decodedId;
    if (!targetId) return;

    if (!issueFormData.title.trim()) {
      toast.error('Mohon isi judul kendala');
      return;
    }

    setIsSavingIssue(true);
    try {
      const payload = {
        ...(editingIssueId ? { id: editingIssueId } : {}),
        ...issueFormData,
      };

      const res = await saveProjectIssueAction(targetId, payload);
      if (!res.success) {
        throw new Error(res.error || 'Gagal menyimpan kendala');
      }

      setIssuesList((prev) => {
        if (editingIssueId) {
          return prev.map((i) => (i.id === editingIssueId ? res.data : i));
        } else {
          return [res.data, ...prev];
        }
      });

      if (project) {
        const existing = Array.isArray(project.issues) ? project.issues : [];
        const nextList = editingIssueId
          ? existing.map((i) => (i.id === editingIssueId ? res.data : i))
          : [res.data, ...existing];
        updateProject(project.id, { issues: nextList });
      }

      toast.success(editingIssueId ? 'Kendala berhasil diperbarui di database server!' : 'Kendala baru berhasil disimpan ke database server!');
      setIsIssueDialogOpen(false);
    } catch (err: any) {
      console.error('Failed to save issue', err);
      toast.error(err?.message || 'Gagal menyimpan kendala');
    } finally {
      setIsSavingIssue(false);
    }
  };

  const handleDeleteIssue = async (issueId: string) => {
    const targetId = project?.id || decodedId;
    if (!targetId) return;

    try {
      const res = await deleteProjectIssueAction(targetId, issueId);
      if (!res.success) {
        throw new Error(res.error || 'Gagal menghapus kendala');
      }

      setIssuesList((prev) => prev.filter((i) => i.id !== issueId));

      if (project) {
        const existing = Array.isArray(project.issues) ? project.issues : [];
        updateProject(project.id, { issues: existing.filter((i) => i.id !== issueId) });
      }

      toast.success('Kendala berhasil dihapus dari database');
    } catch (err: any) {
      console.error('Failed to delete issue', err);
      toast.error(err?.message || 'Gagal menghapus kendala');
    }
  };

  // =========================================================================
  // 4C. COMMISSIONING STATES & ACTIONS (OTDR, DEFECTS, BAUT) - REAL DATABASE
  // =========================================================================
  // --- 1. OTDR Tests ---
  const [otdrTestsList, setOtdrTestsList] = useState<any[]>([]);
  const [isLoadingOtdr, setIsLoadingOtdr] = useState(false);
  const [isOtdrDialogOpen, setIsOtdrDialogOpen] = useState(false);
  const [isSavingOtdr, setIsSavingOtdr] = useState(false);
  const [editingOtdrId, setEditingOtdrId] = useState<string | null>(null);
  const otdrFileInputRef = useRef<HTMLInputElement>(null);
  const [otdrFormData, setOtdrFormData] = useState({
    testId: '',
    fiberCore: 'Core 01 (SM)',
    direction: 'A -> B',
    distanceKm: 0,
    totalLossDb: 0,
    eventLossDb: 0,
    result: 'PASS',
    wavelength: '1310 nm',
    testedBy: '',
    testDate: toISODateString(new Date()),
    notes: '',
    fileName: '',
  });

  // --- 2. Defect & Punch List ---
  const [defectsList, setDefectsList] = useState<any[]>([]);
  const [isLoadingDefects, setIsLoadingDefects] = useState(false);
  const [isDefectDialogOpen, setIsDefectDialogOpen] = useState(false);
  const [isSavingDefect, setIsSavingDefect] = useState(false);
  const [editingDefectId, setEditingDefectId] = useState<string | null>(null);
  const [defectFormData, setDefectFormData] = useState({
    punchId: '',
    description: '',
    location: '',
    severity: 'Minor',
    pic: '',
    reportDate: toISODateString(new Date()),
    dueDate: '',
    status: 'Open',
    resolutionNotes: '',
  });

  // --- 3. BA Acceptance (BA UT) ---
  const [bautsList, setBautsList] = useState<any[]>([]);
  const [isLoadingBauts, setIsLoadingBauts] = useState(false);
  const [isBautDialogOpen, setIsBautDialogOpen] = useState(false);
  const [isSavingBaut, setIsSavingBaut] = useState(false);
  const [editingBautId, setEditingBautId] = useState<string | null>(null);
  const bautFileInputRef = useRef<HTMLInputElement>(null);
  const [bautFormData, setBautFormData] = useState({
    bautNumber: '',
    title: 'Berita Acara Uji Terima (BA UT) Fisik & Pengukuran',
    clientName: '',
    date: toISODateString(new Date()),
    status: 'Draft',
    signatoryVendor: '',
    signatoryClient: '',
    scopeCovered: '',
    notes: '',
    documentName: '',
  });

  // Load commissioning data from server database
  useEffect(() => {
    const targetId = project?.id || decodedId;
    if (!targetId) return;

    let isMounted = true;
    setIsLoadingOtdr(true);
    setIsLoadingDefects(true);
    setIsLoadingBauts(true);

    getProjectOtdrTestsAction(targetId).then((res) => {
      if (isMounted) {
        if (res.success && Array.isArray(res.data)) {
          setOtdrTestsList(res.data);
        } else if (Array.isArray(project?.otdrTests)) {
          setOtdrTestsList(project.otdrTests);
        }
        setIsLoadingOtdr(false);
      }
    });

    getProjectDefectsAction(targetId).then((res) => {
      if (isMounted) {
        if (res.success && Array.isArray(res.data)) {
          setDefectsList(res.data);
        } else if (Array.isArray(project?.defects)) {
          setDefectsList(project.defects);
        }
        setIsLoadingDefects(false);
      }
    });

    getProjectBautsAction(targetId).then((res) => {
      if (isMounted) {
        if (res.success && Array.isArray(res.data)) {
          setBautsList(res.data);
        } else if (Array.isArray(project?.bauts)) {
          setBautsList(project.bauts);
        }
        setIsLoadingBauts(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [decodedId, project?.id, project?.otdrTests, project?.defects, project?.bauts]);

  // Handlers for OTDR Tests
  const handleOpenAddOtdr = () => {
    setEditingOtdrId(null);
    setOtdrFormData({
      testId: `OTDR-${String(otdrTestsList.length + 1).padStart(3, '0')}`,
      fiberCore: `Core ${String(otdrTestsList.length + 1).padStart(2, '0')} (SM)`,
      direction: 'A -> B',
      distanceKm: 45.12,
      totalLossDb: 12.4,
      eventLossDb: 0.05,
      result: 'PASS',
      wavelength: '1310 nm',
      testedBy: project?.manager || '',
      testDate: toISODateString(new Date()),
      notes: '',
      fileName: '',
    });
    setIsOtdrDialogOpen(true);
  };

  const handleOpenEditOtdr = (test: any) => {
    setEditingOtdrId(test.id);
    setOtdrFormData({
      testId: test.testId || '',
      fiberCore: test.fiberCore || '',
      direction: test.direction || 'A -> B',
      distanceKm: Number(test.distanceKm) || 0,
      totalLossDb: Number(test.totalLossDb) || 0,
      eventLossDb: Number(test.eventLossDb) || 0,
      result: test.result || 'PASS',
      wavelength: test.wavelength || '1310 nm',
      testedBy: test.testedBy || '',
      testDate: test.testDate || toISODateString(new Date()),
      notes: test.notes || '',
      fileName: test.fileName || '',
    });
    setIsOtdrDialogOpen(true);
  };

  const handleOtdrFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOtdrFormData((prev) => ({ ...prev, fileName: file.name }));
      toast.success(`File ${file.name} dipilih`);
    }
  };

  const handleSaveOtdr = async () => {
    const targetId = project?.id || decodedId;
    if (!targetId) return;

    if (!otdrFormData.fiberCore.trim()) {
      toast.error('Nama Fiber Core harus diisi');
      return;
    }

    setIsSavingOtdr(true);
    try {
      const res = await saveProjectOtdrTestAction(targetId, {
        ...(editingOtdrId ? { id: editingOtdrId } : {}),
        ...otdrFormData,
      });

      if (!res.success || !res.data) {
        throw new Error(res.error || 'Gagal menyimpan hasil test OTDR');
      }

      setOtdrTestsList((prev) => {
        if (editingOtdrId) {
          return prev.map((t) => (t.id === editingOtdrId ? res.data : t));
        } else {
          return [res.data, ...prev];
        }
      });

      if (project) {
        const existing = Array.isArray(project.otdrTests) ? project.otdrTests : [];
        const nextList = editingOtdrId
          ? existing.map((t) => (t.id === editingOtdrId ? res.data : t))
          : [res.data, ...existing];
        updateProject(project.id, { otdrTests: nextList });
      }

      toast.success(editingOtdrId ? 'Hasil test OTDR diperbarui di database!' : 'Hasil test OTDR tersimpan di database!');
      setIsOtdrDialogOpen(false);
    } catch (err: any) {
      console.error('Failed to save OTDR test', err);
      toast.error(err?.message || 'Gagal menyimpan hasil test OTDR');
    } finally {
      setIsSavingOtdr(false);
    }
  };

  const handleDeleteOtdr = async (testId: string) => {
    const targetId = project?.id || decodedId;
    if (!targetId) return;

    try {
      const res = await deleteProjectOtdrTestAction(targetId, testId);
      if (!res.success) {
        throw new Error(res.error || 'Gagal menghapus hasil test OTDR');
      }

      setOtdrTestsList((prev) => prev.filter((t) => t.id !== testId));

      if (project) {
        const existing = Array.isArray(project.otdrTests) ? project.otdrTests : [];
        updateProject(project.id, { otdrTests: existing.filter((t) => t.id !== testId) });
      }

      toast.success('Hasil test OTDR dihapus dari database');
    } catch (err: any) {
      console.error('Failed to delete OTDR test', err);
      toast.error(err?.message || 'Gagal menghapus hasil test OTDR');
    }
  };

  // Handlers for Defects
  const handleOpenAddDefect = () => {
    setEditingDefectId(null);
    setDefectFormData({
      punchId: `PUNCH-${String(defectsList.length + 1).padStart(2, '0')}`,
      description: '',
      location: '',
      severity: 'Minor',
      pic: project?.manager || '',
      reportDate: toISODateString(new Date()),
      dueDate: '',
      status: 'Open',
      resolutionNotes: '',
    });
    setIsDefectDialogOpen(true);
  };

  const handleOpenEditDefect = (defect: any) => {
    setEditingDefectId(defect.id);
    setDefectFormData({
      punchId: defect.punchId || '',
      description: defect.description || '',
      location: defect.location || '',
      severity: defect.severity || 'Minor',
      pic: defect.pic || '',
      reportDate: defect.reportDate || toISODateString(new Date()),
      dueDate: defect.dueDate || '',
      status: defect.status || 'Open',
      resolutionNotes: defect.resolutionNotes || '',
    });
    setIsDefectDialogOpen(true);
  };

  const handleSaveDefect = async () => {
    const targetId = project?.id || decodedId;
    if (!targetId) return;

    if (!defectFormData.description.trim()) {
      toast.error('Deskripsi temuan defect harus diisi');
      return;
    }

    setIsSavingDefect(true);
    try {
      const res = await saveProjectDefectAction(targetId, {
        ...(editingDefectId ? { id: editingDefectId } : {}),
        ...defectFormData,
      });

      if (!res.success || !res.data) {
        throw new Error(res.error || 'Gagal menyimpan defect');
      }

      setDefectsList((prev) => {
        if (editingDefectId) {
          return prev.map((d) => (d.id === editingDefectId ? res.data : d));
        } else {
          return [res.data, ...prev];
        }
      });

      if (project) {
        const existing = Array.isArray(project.defects) ? project.defects : [];
        const nextList = editingDefectId
          ? existing.map((d) => (d.id === editingDefectId ? res.data : d))
          : [res.data, ...existing];
        updateProject(project.id, { defects: nextList });
      }

      toast.success(editingDefectId ? 'Defect diperbarui di database!' : 'Defect baru tersimpan di database!');
      setIsDefectDialogOpen(false);
    } catch (err: any) {
      console.error('Failed to save defect', err);
      toast.error(err?.message || 'Gagal menyimpan defect');
    } finally {
      setIsSavingDefect(false);
    }
  };

  const handleDeleteDefect = async (defectId: string) => {
    const targetId = project?.id || decodedId;
    if (!targetId) return;

    try {
      const res = await deleteProjectDefectAction(targetId, defectId);
      if (!res.success) {
        throw new Error(res.error || 'Gagal menghapus defect');
      }

      setDefectsList((prev) => prev.filter((d) => d.id !== defectId));

      if (project) {
        const existing = Array.isArray(project.defects) ? project.defects : [];
        updateProject(project.id, { defects: existing.filter((d) => d.id !== defectId) });
      }

      toast.success('Defect berhasil dihapus dari database');
    } catch (err: any) {
      console.error('Failed to delete defect', err);
      toast.error(err?.message || 'Gagal menghapus defect');
    }
  };

  // Handlers for BAUT
  const handleOpenAddBaut = () => {
    setEditingBautId(null);
    setBautFormData({
      bautNumber: `BAUT-${new Date().getFullYear()}-${String(bautsList.length + 1).padStart(3, '0')}`,
      title: 'Berita Acara Uji Terima (BA UT) Fisik & Pengukuran',
      clientName: project?.customer || '',
      date: toISODateString(new Date()),
      status: 'Draft',
      signatoryVendor: project?.manager || '',
      signatoryClient: '',
      scopeCovered: project?.scope || 'Penarikan kabel FO, galian, jointing closure, dan pengetesan OTDR',
      notes: '',
      documentName: '',
    });
    setIsBautDialogOpen(true);
  };

  const handleOpenEditBaut = (baut: any) => {
    setEditingBautId(baut.id);
    setBautFormData({
      bautNumber: baut.bautNumber || '',
      title: baut.title || '',
      clientName: baut.clientName || '',
      date: baut.date || toISODateString(new Date()),
      status: baut.status || 'Draft',
      signatoryVendor: baut.signatoryVendor || '',
      signatoryClient: baut.signatoryClient || '',
      scopeCovered: baut.scopeCovered || '',
      notes: baut.notes || '',
      documentName: baut.documentName || '',
    });
    setIsBautDialogOpen(true);
  };

  const handleBautFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBautFormData((prev) => ({ ...prev, documentName: file.name }));
      toast.success(`Dokumen ${file.name} dipilih`);
    }
  };

  const handleSaveBaut = async () => {
    const targetId = project?.id || decodedId;
    if (!targetId) return;

    if (!bautFormData.bautNumber.trim() || !bautFormData.title.trim()) {
      toast.error('Nomor BAUT dan Judul harus diisi');
      return;
    }

    setIsSavingBaut(true);
    try {
      const res = await saveProjectBautAction(targetId, {
        ...(editingBautId ? { id: editingBautId } : {}),
        ...bautFormData,
      });

      if (!res.success || !res.data) {
        throw new Error(res.error || 'Gagal menyimpan draft BAUT');
      }

      setBautsList((prev) => {
        if (editingBautId) {
          return prev.map((b) => (b.id === editingBautId ? res.data : b));
        } else {
          return [res.data, ...prev];
        }
      });

      if (project) {
        const existing = Array.isArray(project.bauts) ? project.bauts : [];
        const nextList = editingBautId
          ? existing.map((b) => (b.id === editingBautId ? res.data : b))
          : [res.data, ...existing];
        updateProject(project.id, { bauts: nextList });
      }

      toast.success(editingBautId ? 'Draft BA UT diperbarui di database!' : 'Draft BA UT berhasil disimpan ke database!');
      setIsBautDialogOpen(false);
    } catch (err: any) {
      console.error('Failed to save BAUT', err);
      toast.error(err?.message || 'Gagal menyimpan draft BA UT');
    } finally {
      setIsSavingBaut(false);
    }
  };

  const handleDeleteBaut = async (bautId: string) => {
    const targetId = project?.id || decodedId;
    if (!targetId) return;

    try {
      const res = await deleteProjectBautAction(targetId, bautId);
      if (!res.success) {
        throw new Error(res.error || 'Gagal menghapus BA UT');
      }

      setBautsList((prev) => prev.filter((b) => b.id !== bautId));

      if (project) {
        const existing = Array.isArray(project.bauts) ? project.bauts : [];
        updateProject(project.id, { bauts: existing.filter((b) => b.id !== bautId) });
      }

      toast.success('BA UT berhasil dihapus dari database');
    } catch (err: any) {
      console.error('Failed to delete BAUT', err);
      toast.error(err?.message || 'Gagal menghapus BA UT');
    }
  };

  // =========================================================================
  // 4D. CLOSING & HANDOVER STATES & ACTIONS (ABD, ASSETS, PROFITABILITY) - REAL DATABASE
  // =========================================================================
  // --- 1. As-Built Documentation (ABD) ---
  const [asBuiltDocsList, setAsBuiltDocsList] = useState<any[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isDocDialogOpen, setIsDocDialogOpen] = useState(false);
  const [isSavingDoc, setIsSavingDoc] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const docFileInputRef = useRef<HTMLInputElement>(null);
  const [docFormData, setDocFormData] = useState({
    name: '',
    category: 'Engineering',
    size: '3.5 MB',
    date: toISODateString(new Date()),
    status: 'Final Verified',
    notes: '',
  });

  // --- 2. Asset Inventory ---
  const [assetsList, setAssetsList] = useState<any[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [isAssetDialogOpen, setIsAssetDialogOpen] = useState(false);
  const [isSavingAsset, setIsSavingAsset] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [assetFormData, setAssetFormData] = useState({
    assetId: '',
    type: 'Cable Asset',
    specification: '',
    location: '',
    warranty: '24 Bulan Garansi',
    vendor: '',
    status: 'Active / Transferred',
    notes: '',
  });

  // --- 3. Final Profitability Report ---
  const [profitabilityData, setProfitabilityData] = useState<any>({
    contractValue: 1500000000,
    actualCapex: 1050000000,
    actualOpex: 120000000,
    rabBudget: 1200000000,
    notes: '',
    rootCauses: [],
  });
  const [isLoadingProfitability, setIsLoadingProfitability] = useState(false);
  const [isProfitabilityDialogOpen, setIsProfitabilityDialogOpen] = useState(false);
  const [isSavingProfitability, setIsSavingProfitability] = useState(false);
  const [profFormData, setProfFormData] = useState({
    contractValue: 1500000000,
    actualCapex: 1050000000,
    actualOpex: 120000000,
    rabBudget: 1200000000,
    notes: '',
    newCauseTitle: '',
    newCauseDesc: '',
    newCauseAmount: 0,
    newCauseImpact: 'Moderate',
    rootCauses: [] as any[],
  });

  // Load closing data from server database
  useEffect(() => {
    const targetId = project?.id || decodedId;
    if (!targetId) return;

    let isMounted = true;
    setIsLoadingDocs(true);
    setIsLoadingAssets(true);
    setIsLoadingProfitability(true);

    getProjectAsBuiltDocsAction(targetId).then((res) => {
      if (isMounted) {
        if (res.success && Array.isArray(res.data)) {
          setAsBuiltDocsList(res.data);
        } else if (Array.isArray(project?.asBuiltDocs)) {
          setAsBuiltDocsList(project.asBuiltDocs);
        }
        setIsLoadingDocs(false);
      }
    });

    getProjectAssetsAction(targetId).then((res) => {
      if (isMounted) {
        if (res.success && Array.isArray(res.data)) {
          setAssetsList(res.data);
        } else if (Array.isArray(project?.assets)) {
          setAssetsList(project.assets);
        }
        setIsLoadingAssets(false);
      }
    });

    getProjectProfitabilityAction(targetId).then((res) => {
      if (isMounted) {
        if (res.success && res.data) {
          setProfitabilityData(res.data);
        } else if (project?.profitability) {
          setProfitabilityData(project.profitability);
        } else {
          const rev = project?.commercial?.revenue || 0;
          const capex = project?.commercial?.capex || 0;
          const opex = project?.commercial?.opex || 0;
          setProfitabilityData({
            contractValue: rev,
            actualCapex: capex,
            actualOpex: opex,
            rabBudget: capex + opex,
            notes: '',
            rootCauses: [],
          });
        }
        setIsLoadingProfitability(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [decodedId, project?.id, project?.asBuiltDocs, project?.assets, project?.profitability]);

  // Handlers for As-Built Docs
  const handleOpenAddDoc = () => {
    setEditingDocId(null);
    setDocFormData({
      name: '',
      category: 'Engineering',
      size: '5.2 MB',
      date: toISODateString(new Date()),
      status: 'Final Verified',
      notes: '',
    });
    setIsDocDialogOpen(true);
  };

  const handleOpenEditDoc = (doc: any) => {
    setEditingDocId(doc.id);
    setDocFormData({
      name: doc.name || '',
      category: doc.category || 'Engineering',
      size: doc.size || '3.5 MB',
      date: doc.date || toISODateString(new Date()),
      status: doc.status || 'Final Verified',
      notes: doc.notes || '',
    });
    setIsDocDialogOpen(true);
  };

  const handleDocFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      setDocFormData((prev) => ({
        ...prev,
        name: file.name,
        size: sizeStr,
      }));
      toast.success(`File ${file.name} (${sizeStr}) dipilih`);
    }
  };

  const handleSaveDoc = async () => {
    const targetId = project?.id || decodedId;
    if (!targetId) return;

    if (!docFormData.name.trim()) {
      toast.error('Nama file dokumen harus diisi');
      return;
    }

    setIsSavingDoc(true);
    try {
      const res = await saveProjectAsBuiltDocAction(targetId, {
        ...(editingDocId ? { id: editingDocId } : {}),
        ...docFormData,
      });

      if (!res.success || !res.data) {
        throw new Error(res.error || 'Gagal menyimpan dokumen as-built');
      }

      setAsBuiltDocsList((prev) => {
        if (editingDocId) {
          return prev.map((d) => (d.id === editingDocId ? res.data : d));
        } else {
          return [res.data, ...prev];
        }
      });

      if (project) {
        const existing = Array.isArray(project.asBuiltDocs) ? project.asBuiltDocs : [];
        const nextList = editingDocId
          ? existing.map((d) => (d.id === editingDocId ? res.data : d))
          : [res.data, ...existing];
        updateProject(project.id, { asBuiltDocs: nextList });
      }

      toast.success(editingDocId ? 'Dokumen as-built diperbarui di database!' : 'Dokumen as-built berhasil disimpan ke database!');
      setIsDocDialogOpen(false);
    } catch (err: any) {
      console.error('Failed to save as-built doc', err);
      toast.error(err?.message || 'Gagal menyimpan dokumen as-built');
    } finally {
      setIsSavingDoc(false);
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    const targetId = project?.id || decodedId;
    if (!targetId) return;

    try {
      const res = await deleteProjectAsBuiltDocAction(targetId, docId);
      if (!res.success) {
        throw new Error(res.error || 'Gagal menghapus dokumen as-built');
      }

      setAsBuiltDocsList((prev) => prev.filter((d) => d.id !== docId));

      if (project) {
        const existing = Array.isArray(project.asBuiltDocs) ? project.asBuiltDocs : [];
        updateProject(project.id, { asBuiltDocs: existing.filter((d) => d.id !== docId) });
      }

      toast.success('Dokumen as-built berhasil dihapus dari database');
    } catch (err: any) {
      console.error('Failed to delete doc', err);
      toast.error(err?.message || 'Gagal menghapus dokumen as-built');
    }
  };

  // Handlers for Assets
  const handleOpenAddAsset = () => {
    setEditingAssetId(null);
    setAssetFormData({
      assetId: `AST-FIB-${String(assetsList.length + 1).padStart(3, '0')}`,
      type: 'Cable Asset',
      specification: 'Kabel FO Single Mode G.652D',
      location: project?.location || 'Ruas Proyek Sentul',
      warranty: '24 Bulan Garansi',
      vendor: 'PT Vendor Mitra',
      status: 'Active / Transferred',
      notes: '',
    });
    setIsAssetDialogOpen(true);
  };

  const handleOpenEditAsset = (asset: any) => {
    setEditingAssetId(asset.id);
    setAssetFormData({
      assetId: asset.assetId || '',
      type: asset.type || 'Cable Asset',
      specification: asset.specification || '',
      location: asset.location || '',
      warranty: asset.warranty || '24 Bulan Garansi',
      vendor: asset.vendor || '',
      status: asset.status || 'Active / Transferred',
      notes: asset.notes || '',
    });
    setIsAssetDialogOpen(true);
  };

  const handleSaveAsset = async () => {
    const targetId = project?.id || decodedId;
    if (!targetId) return;

    if (!assetFormData.assetId.trim() || !assetFormData.specification.trim()) {
      toast.error('Asset ID dan Spesifikasi harus diisi');
      return;
    }

    setIsSavingAsset(true);
    try {
      const res = await saveProjectAssetAction(targetId, {
        ...(editingAssetId ? { id: editingAssetId } : {}),
        ...assetFormData,
      });

      if (!res.success || !res.data) {
        throw new Error(res.error || 'Gagal menyimpan data aset');
      }

      setAssetsList((prev) => {
        if (editingAssetId) {
          return prev.map((a) => (a.id === editingAssetId ? res.data : a));
        } else {
          return [res.data, ...prev];
        }
      });

      if (project) {
        const existing = Array.isArray(project.assets) ? project.assets : [];
        const nextList = editingAssetId
          ? existing.map((a) => (a.id === editingAssetId ? res.data : a))
          : [res.data, ...existing];
        updateProject(project.id, { assets: nextList });
      }

      toast.success(editingAssetId ? 'Data aset diperbarui di database!' : 'Data aset berhasil dicatat di database!');
      setIsAssetDialogOpen(false);
    } catch (err: any) {
      console.error('Failed to save asset', err);
      toast.error(err?.message || 'Gagal menyimpan data aset');
    } finally {
      setIsSavingAsset(false);
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    const targetId = project?.id || decodedId;
    if (!targetId) return;

    try {
      const res = await deleteProjectAssetAction(targetId, assetId);
      if (!res.success) {
        throw new Error(res.error || 'Gagal menghapus aset');
      }

      setAssetsList((prev) => prev.filter((a) => a.id !== assetId));

      if (project) {
        const existing = Array.isArray(project.assets) ? project.assets : [];
        updateProject(project.id, { assets: existing.filter((a) => a.id !== assetId) });
      }

      toast.success('Data aset berhasil dihapus dari database');
    } catch (err: any) {
      console.error('Failed to delete asset', err);
      toast.error(err?.message || 'Gagal menghapus data aset');
    }
  };

  // Handlers for Profitability
  const handleOpenEditProfitability = () => {
    setProfFormData({
      contractValue: profitabilityData?.contractValue || 1500000000,
      actualCapex: profitabilityData?.actualCapex || 1050000000,
      actualOpex: profitabilityData?.actualOpex || 120000000,
      rabBudget: profitabilityData?.rabBudget || 1200000000,
      notes: profitabilityData?.notes || '',
      newCauseTitle: '',
      newCauseDesc: '',
      newCauseAmount: 0,
      newCauseImpact: 'Moderate',
      rootCauses: Array.isArray(profitabilityData?.rootCauses) ? [...profitabilityData.rootCauses] : [],
    });
    setIsProfitabilityDialogOpen(true);
  };

  const handleAddRootCauseItem = () => {
    if (!profFormData.newCauseTitle.trim()) {
      toast.error('Judul faktor varian biaya harus diisi');
      return;
    }

    const newItem = {
      id: `rc-${Date.now()}`,
      title: profFormData.newCauseTitle.trim(),
      description: profFormData.newCauseDesc.trim(),
      impactAmount: Number(profFormData.newCauseAmount) || 0,
      impactLevel: profFormData.newCauseImpact,
    };

    setProfFormData((prev) => ({
      ...prev,
      rootCauses: [...prev.rootCauses, newItem],
      newCauseTitle: '',
      newCauseDesc: '',
      newCauseAmount: 0,
      newCauseImpact: 'Moderate',
    }));
    toast.success('Faktor varian biaya ditambahkan ke daftar');
  };

  const handleRemoveRootCauseItem = (id: string) => {
    setProfFormData((prev) => ({
      ...prev,
      rootCauses: prev.rootCauses.filter((rc) => rc.id !== id),
    }));
  };

  const handleSaveProfitability = async () => {
    const targetId = project?.id || decodedId;
    if (!targetId) return;

    setIsSavingProfitability(true);
    try {
      const payload = {
        contractValue: Number(profFormData.contractValue) || 0,
        actualCapex: Number(profFormData.actualCapex) || 0,
        actualOpex: Number(profFormData.actualOpex) || 0,
        rabBudget: Number(profFormData.rabBudget) || 0,
        notes: profFormData.notes,
        rootCauses: profFormData.rootCauses,
      };

      const res = await saveProjectProfitabilityAction(targetId, payload);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Gagal menyimpan laporan profitabilitas');
      }

      setProfitabilityData(res.data);

      if (project) {
        updateProject(project.id, {
          profitability: res.data,
          commercial: {
            revenue: payload.contractValue,
            capex: payload.actualCapex,
            opex: payload.actualOpex,
          },
        });
      }

      toast.success('Laporan profitabilitas & analisis varian berhasil diperbarui di database!');
      setIsProfitabilityDialogOpen(false);
    } catch (err: any) {
      console.error('Failed to save profitability', err);
      toast.error(err?.message || 'Gagal menyimpan laporan profitabilitas');
    } finally {
      setIsSavingProfitability(false);
    }
  };

  // =========================================================================
  // 5. DRM PLAN & DESIGNATOR ITEMS (REAL DATABASE)
  // =========================================================================
  const currentProjectIdRef = useRef<string | null>(null);
  const [designatorItems, setDesignatorItems] = useState<DesignatorItem[]>(
    Array.isArray(project?.designatorItems) && project.designatorItems.length > 0
      ? project.designatorItems
      : []
  );

  // Muat data DRM dan riwayat progres per designator dari database server (Real Database)
  useEffect(() => {
    const targetId = project?.id || decodedId;
    if (!targetId) return;

    let isMounted = true;

    // 1. Ambil data ter-update langsung dari Server Action database server
    getDesignatorProgressAction(targetId)
      .then((res) => {
        if (!isMounted) return;
        if (res.success && Array.isArray(res.data)) {
          setDesignatorItems(res.data);
          try {
            localStorage.setItem(`proper_project_designators_${targetId}`, JSON.stringify(res.data));
          } catch {}
          return;
        }

        // 2. Jika Server Action tidak mengembalikan array, cek project context
        if (Array.isArray(project?.designatorItems)) {
          setDesignatorItems(project.designatorItems);
          return;
        }
      })
      .catch((err) => {
        console.warn('Gagal memuat progress DRM dari server:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [decodedId, project?.id]);

  const handleUpdateDesignatorItems = async (items: DesignatorItem[]) => {
    const targetId = project?.id || decodedId;
    setDesignatorItems(items);

    // 1. Simpan ke localStorage sebagai cache offline
    try {
      localStorage.setItem(`proper_project_designators_${targetId}`, JSON.stringify(items));
    } catch (err) {
      console.error("Failed to save designator items to localStorage", err);
    }

    // 2. SIMPAN LANGSUNG KE DATABASE REAL (data/db.json & Supabase)
    try {
      const res = await saveDesignatorProgressAction(targetId, items);
      if (!res.success) {
        throw new Error(res.error || 'Gagal menyimpan ke database');
      }

      if (project) {
        await updateProject(project.id, { designatorItems: items });
      }

      toast.success("Progress DRM & Kurva S berhasil disimpan ke database server!");
    } catch (err: any) {
      console.error("Failed to save designator items to database", err);
      toast.error(err?.message || "Gagal menyimpan progress DRM ke database");
    }
  };

  const progressMetrics = calculateOverallProjectProgress(designatorItems, project?.startDate, project?.targetDate);
  const progressDates = useMemo(() => {
    return generateProgressDates(project?.startDate, project?.targetDate);
  }, [project?.startDate, project?.targetDate]);

  const sCurveData = generateSCurveData(designatorItems, progressDates);

  // Tanggal Terpilih Laporan Harian (Daily Progress)
  const [selectedReportDate, setSelectedReportDate] = useState<string>(() => {
    return toISODateString(new Date());
  });

  // State Manajemen Info Lapangan Harian (Real Database)
  const [dailyReportsMap, setDailyReportsMap] = useState<Record<string, any>>(project?.dailyReports || {});

  // Muat data Laporan Harian (Daily Reports) dari database server
  useEffect(() => {
    const targetId = project?.id || decodedId;
    if (!targetId) return;

    if (project?.dailyReports) {
      setDailyReportsMap(project.dailyReports);
    }

    getDailyReportsAction(targetId).then((res) => {
      if (res.success && res.data) {
        setDailyReportsMap(res.data);
      }
    }).catch((err) => {
      console.warn('Gagal memuat daily reports:', err);
    });
  }, [decodedId, project?.id, project?.dailyReports]);

  // Minggu Ke dihitung dari project.startDate sampai selectedReportDate
  const weekNumber = useMemo(() => {
    if (!project?.startDate) return 1;
    const start = new Date(project.startDate.split('T')[0]);
    const current = new Date(selectedReportDate);
    if (isNaN(start.getTime()) || isNaN(current.getTime())) return 1;
    const diffTime = current.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 1;
    return Math.floor(diffDays / 7) + 1;
  }, [project?.startDate, selectedReportDate]);

  // Tanggal Mulai dan Target TOC terformat
  const startDateFormatted = useMemo(() => {
    if (!project?.startDate) return '22-Okt-2025';
    return formatDisplayDate(project.startDate).fullDate;
  }, [project?.startDate]);

  const targetDateFormatted = useMemo(() => {
    if (!project?.targetDate) return '-';
    return formatDisplayDate(project.targetDate).fullDate;
  }, [project?.targetDate]);

  // Sisa Hari Kalender dihitung dari selectedReportDate sampai project.targetDate
  const remainingCalendarDays = useMemo(() => {
    if (!project?.targetDate) return '-';
    const target = new Date(project.targetDate.split('T')[0]);
    const current = new Date(selectedReportDate);
    if (isNaN(target.getTime()) || isNaN(current.getTime())) return '-';
    const diffTime = target.getTime() - current.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? `${diffDays} Hari` : `${Math.abs(diffDays)} Hari (Terlewat)`;
  }, [project?.targetDate, selectedReportDate]);

  // Rekapitulasi Data Tabel Berdasarkan Tanggal yang Dipilih (Sinkron dengan GET Designator seperti di project-list/[id])
  const dailySummaryRows = useMemo(() => {
    const jobCategories: {
      name: string;
      matcher: (item: DesignatorItem) => boolean;
      defaultUnit: string;
    }[] = [
      {
        name: 'Pemasangan Tiang/Tiang OSP',
        matcher: (item) => {
          const j = (item.jenis || item.type || '').toLowerCase();
          return j.includes('tiang');
        },
        defaultUnit: 'Batang',
      },
      {
        name: 'Pekerjaan Galian & Boring',
        matcher: (item) => {
          const j = (item.jenis || item.type || '').toLowerCase();
          return j.includes('galian') || j.includes('boring');
        },
        defaultUnit: 'Meter',
      },
      {
        name: 'Pemasangan Handhole/Manhole',
        matcher: (item) => {
          const j = (item.jenis || item.type || '').toLowerCase();
          return j.includes('handhole') || j.includes('manhole');
        },
        defaultUnit: 'Unit',
      },
      {
        name: 'Penarikan Kabel Fiber Optik',
        matcher: (item) => {
          const j = (item.jenis || item.type || '').toLowerCase();
          return j.includes('kabel');
        },
        defaultUnit: 'Meter',
      },
      {
        name: 'Jembatan & Trays FO',
        matcher: (item) => {
          const j = (item.jenis || item.type || '').toLowerCase();
          return j.includes('jembatan') || j.includes('tray');
        },
        defaultUnit: 'Meter',
      },
      {
        name: 'Penyambungan/Jointing',
        matcher: (item) => {
          const j = (item.jenis || item.type || '').toLowerCase();
          return j.includes('terminasi') || j.includes('jointing') || j.includes('splicing');
        },
        defaultUnit: 'Titik',
      },
    ];

    // Deteksi jika ada jenis pekerjaan lain di luar 6 grup standar di atas
    const standardMatchedIds = new Set<string>();
    jobCategories.forEach((cat) => {
      designatorItems.filter(cat.matcher).forEach((it) => standardMatchedIds.add(it.idVolume));
    });

    const otherItems = designatorItems.filter((it) => !standardMatchedIds.has(it.idVolume));
    const extraGroupsMap: Record<string, DesignatorItem[]> = {};
    otherItems.forEach((it) => {
      const g = (it.jenis || (it as any).type || 'Lainnya').trim();
      if (!extraGroupsMap[g]) extraGroupsMap[g] = [];
      extraGroupsMap[g].push(it);
    });

    Object.entries(extraGroupsMap).forEach(([gName, items]) => {
      jobCategories.push({
        name: gName,
        matcher: (it) => (it.jenis || (it as any).type || '').trim().toLowerCase() === gName.toLowerCase(),
        defaultUnit: items[0]?.satuan || (items[0] as any)?.unit || 'Item',
      });
    });

    return jobCategories.map((cat) => {
      const matchedItems = designatorItems.filter(cat.matcher);
      const unit = matchedItems[0]?.satuan || (matchedItems[0] as any)?.unit || cat.defaultUnit;
      const volumeBOQ = matchedItems.reduce(
        (acc, it) => acc + (Number(it.volumeTarget) || Number((it as any).boqVolume) || 0),
        0
      );

      let volumeKemarin = 0;
      let volumeHariIni = 0;

      matchedItems.forEach((it) => {
        if (it.dailyVolumes) {
          Object.entries(it.dailyVolumes).forEach(([dKey, vol]) => {
            const num = Number(vol) || 0;
            if (dKey < selectedReportDate) {
              volumeKemarin += num;
            } else if (dKey === selectedReportDate) {
              volumeHariIni += num;
            }
          });
        }
      });

      const volumeSekarang = volumeKemarin + volumeHariIni;
      const volumeSisa = Math.max(0, volumeBOQ - volumeSekarang);
      const projectDurationDays = progressDates.length || 30;
      const rencanaHariIni = volumeBOQ > 0 ? Math.round(volumeBOQ / projectDurationDays) : 0;

      return {
        job: cat.name,
        unit,
        volumeKemarin,
        volumeHariIni,
        rencanaHariIni,
        volumeSekarang,
        volumeBOQ,
        volumeSisa,
      };
    });
  }, [designatorItems, selectedReportDate, progressDates]);

  // Catatan Kendala & Solusi pada Tanggal yang Dipilih
  const currentDailyNotes = useMemo(() => {
    const dbReport = dailyReportsMap[selectedReportDate];
    if (dbReport && (dbReport.kendala || dbReport.solusi)) {
      return {
        kendala: dbReport.kendala || '-',
        solusi: dbReport.solusi || '-',
      };
    }

    const storageKey = `project_daily_notes_${decodedId}_${selectedReportDate}`;
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.kendala || parsed.solusi) {
          return {
            kendala: parsed.kendala || '-',
            solusi: parsed.solusi || '-',
          };
        }
      }
    } catch {
      // ignore
    }

    let kList: string[] = [];
    let sList: string[] = [];
    designatorItems.forEach((it) => {
      const recs = it.dailyRecords?.[selectedReportDate];
      if (recs && recs.length > 0) {
        recs.forEach((r) => {
          if (r.kendala && !kList.includes(r.kendala)) kList.push(r.kendala);
          if (r.solusi && !sList.includes(r.solusi)) sList.push(r.solusi);
        });
      }
    });

    return {
      kendala: kList.length > 0 ? kList.join('; ') : '-',
      solusi: sList.length > 0 ? sList.join('; ') : '-',
    };
  }, [dailyReportsMap, decodedId, selectedReportDate, designatorItems]);

  // Info Lapangan (Mandor & Alat Berat & Cuaca) pada Tanggal yang Dipilih
  // Data otomatis didapat dari submit (implementasi-progress) pada tanggal terkait
  const currentDayFieldInfo = useMemo(() => {
    const dbReport = dailyReportsMap[selectedReportDate];

    let mandors: string[] = [];
    let alatKerjaList: string[] = [];
    let cuacaFromRecords: string = '';

    designatorItems.forEach((it) => {
      const recs = it.dailyRecords?.[selectedReportDate];
      if (recs && recs.length > 0) {
        recs.forEach((r) => {
          if (r.mandor && !mandors.includes(r.mandor)) mandors.push(r.mandor);
          if (r.alatKerja && !alatKerjaList.includes(r.alatKerja)) alatKerjaList.push(r.alatKerja);
          if (r.cuaca && !cuacaFromRecords) cuacaFromRecords = r.cuaca;
        });
      }
    });

    const tenagaKerja = dbReport?.tenagaKerja || (mandors.length > 0 ? `${mandors.join(', ')} (${mandors.length * 8} Orang)` : '-');
    const alatBerat = dbReport?.alatBerat || (alatKerjaList.length > 0 ? alatKerjaList.join(', ') : '-');
    const cuaca = dbReport?.cuaca || cuacaFromRecords || (mandors.length > 0 || alatKerjaList.length > 0 ? 'CERAH' : '-');

    return {
      tenagaKerja,
      alatBerat,
      cuaca,
    };
  }, [dailyReportsMap, designatorItems, selectedReportDate]);

  // Derived values
  const totalBOQ = project?.boqItems?.reduce((acc, curr) => acc + (curr.quantity * curr.price), 0) || 0;

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Proyek Tidak Ditemukan</h2>
        <p className="text-muted-foreground">Proyek dengan ID {decodedId} tidak ada di sistem.</p>
        <Button variant="outline" onClick={() => router.push('/projects')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Daftar Proyek
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push('/projects')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-foreground flex items-center gap-3">
            {project.name}
            <StatusBadge status={project.status || 'Planning'} />
          </h1>
          <p className="text-muted-foreground text-[10pt] mt-1">
            Project ID: {project.projectCode || (project.contractNo ? project.contractNo.split(' | ')[0] : project.id)}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList variant="line" className="inline-flex w-fit max-w-full flex-wrap justify-start border-b rounded-none px-0 h-auto gap-x-6 gap-y-2 mb-6">
          <TabsTrigger value="overview" className="pb-3 pt-2 px-1 rounded-none text-[10pt] flex-none">Overview</TabsTrigger>
          <TabsTrigger value="planning" className="pb-3 pt-2 px-1 rounded-none text-[10pt] flex-none">Planning</TabsTrigger>
          <TabsTrigger value="implementation" className="pb-3 pt-2 px-1 rounded-none text-[10pt] flex-none">Implementation</TabsTrigger>
          <TabsTrigger value="commissioning" className="pb-3 pt-2 px-1 rounded-none text-[10pt] flex-none">Commissioning</TabsTrigger>
          <TabsTrigger value="closing" className="pb-3 pt-2 px-1 rounded-none text-[10pt] flex-none">Closing & Handover</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Kolom Informasi Utama */}
              <div className="md:col-span-2 space-y-6">
                <Card className="border-0 shadow-none ring-1 ring-border/50 p-0 gap-0">
                  <CardHeader className="bg-muted/30 p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Informasi Umum</CardTitle>
                        <CardDescription className="text-[13px] text-muted-foreground">Informasi detil terkait proyek/site ini.</CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleOpenEditDetail}
                        className="my-[6px] mx-[8px] text-[13px] h-8 gap-1.5"
                      >
                        <Edit className="w-3.5 h-3.5 mr-1" />
                        Edit Detail
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <div className="text-[13px] text-muted-foreground mb-1">Customer / Client</div>
                        <div className="text-[13px] font-medium text-foreground">{project.customer || '-'}</div>
                      </div>
                      <div>
                        <div className="text-[13px] text-muted-foreground mb-1">Tipe Proyek</div>
                        <div className="text-[13px] font-medium text-foreground">{project.type || '-'}</div>
                      </div>
                      <div>
                        <div className="text-[13px] text-muted-foreground mb-1">Lokasi Pekerjaan</div>
                        <div className="text-[13px] font-medium text-foreground">{project.location || '-'}</div>
                      </div>
                      <div>
                        <div className="text-[13px] text-muted-foreground mb-1">Nomor Kontrak</div>
                        <div className="text-[13px] font-medium text-foreground">{project.contractNo || '-'}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-none ring-1 ring-border/50 p-0 gap-0">
                  <CardHeader className="bg-muted/30 p-4 border-b">
                    <CardTitle className="text-lg">Cakupan Pekerjaan</CardTitle>
                    <CardDescription className="text-[13px] text-muted-foreground">Detil cakupan pekerjaan pada proyek/site ini</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    {project.scope ? (
                      <div className="p-4 bg-muted/20 rounded-lg border border-border/60">
                        <p className="text-[13px] text-foreground leading-relaxed whitespace-pre-line">
                          {project.scope}
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 text-center bg-muted/20 rounded-lg border border-dashed">
                        <p className="text-muted-foreground text-[13px]">
                          Belum ada detil cakupan pekerjaan pada proyek ini. Silakan klik &quot;Edit Detail&quot; di atas untuk menambahkan cakupan pekerjaan.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Kolom Sidebar (Timeline & Tim) */}
              <div className="space-y-6">
                <Card className="border-0 shadow-none ring-1 ring-border/50 p-0 gap-0">
                  <CardHeader className="bg-muted/30 p-4 border-b">
                    <CardTitle className="text-lg">Timeline Proyek</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <div className="text-[13px] text-muted-foreground mb-1">Mulai (Start Date)</div>
                      <div className="text-[13px] font-medium text-foreground">{project.startDate || '-'}</div>
                    </div>
                    <div>
                      <div className="text-[13px] text-muted-foreground mb-1">Target Selesai</div>
                      <div className="text-[13px] font-medium text-foreground">{project.targetDate || '-'}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-none ring-1 ring-border/50 p-0 gap-0">
                  <CardHeader className="bg-muted/30 p-4 border-b">
                    <CardTitle className="text-lg">Manajemen</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <div className="text-[13px] text-muted-foreground mb-1">Project Manager (PIC)</div>
                      <div className="text-[13px] font-medium text-foreground flex items-center gap-2">
                        <span>{project.manager || '-'}</span>
                        {picUser && (
                          <Badge variant="outline" className="text-[11px] font-normal py-0 h-5 px-1.5 bg-muted/50 text-muted-foreground">
                            {picUser.role}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Modal Edit Detail Proyek */}
            <Dialog open={isEditDetailOpen} onOpenChange={setIsEditDetailOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Detail Proyek</DialogTitle>
                  <DialogDescription className="text-[13px]">
                    Perbarui informasi proyek, jadwal, penanggung jawab (PIC), dan cakupan pekerjaan.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-[13px]">Nama Proyek / Site</Label>
                    <Input
                      value={editFormData.name}
                      onChange={(e) => setEditFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Contoh: 0001-YOI"
                      className="text-[13px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[13px]">Customer / Client</Label>
                    <Select
                      value={editFormData.customer}
                      onValueChange={(val) => setEditFormData((prev) => ({ ...prev, customer: val }))}
                    >
                      <SelectTrigger className="text-[13px] w-full">
                        <SelectValue placeholder="Pilih Customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeBowheers.map((b) => (
                          <SelectItem key={b.id} value={b.name} className="text-[13px]">
                            {b.name} {b.alias ? `(${b.alias})` : ''}
                          </SelectItem>
                        ))}
                        {editFormData.customer &&
                          !activeBowheers.some((b) => b.name === editFormData.customer) && (
                            <SelectItem value={editFormData.customer} className="text-[13px]">
                              {editFormData.customer}
                            </SelectItem>
                          )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[13px]">Tipe Proyek</Label>
                    <Select
                      value={editFormData.type}
                      onValueChange={(val) => setEditFormData((prev) => ({ ...prev, type: val }))}
                    >
                      <SelectTrigger className="text-[13px] w-full">
                        <SelectValue placeholder="Pilih Tipe Proyek" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Backbone Fiber" className="text-[13px]">Backbone Fiber</SelectItem>
                        <SelectItem value="FTTH" className="text-[13px]">FTTH (Fiber To The Home)</SelectItem>
                        <SelectItem value="FTTX" className="text-[13px]">FTTX</SelectItem>
                        <SelectItem value="OSP" className="text-[13px]">OSP (Outside Plant)</SelectItem>
                        <SelectItem value="Maintenance & Operation" className="text-[13px]">Maintenance & Operation</SelectItem>
                        <SelectItem value="Fiber To The Tower (FTTT)" className="text-[13px]">Fiber To The Tower (FTTT)</SelectItem>
                        <SelectItem value="Data Center Interconnect" className="text-[13px]">Data Center Interconnect</SelectItem>
                        {editFormData.type &&
                          !['Backbone Fiber', 'FTTH', 'FTTX', 'OSP', 'Maintenance & Operation', 'Fiber To The Tower (FTTT)', 'Data Center Interconnect'].includes(editFormData.type) && (
                            <SelectItem value={editFormData.type} className="text-[13px]">
                              {editFormData.type}
                            </SelectItem>
                          )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[13px]">Lokasi Pekerjaan / Region</Label>
                    <Input
                      value={editFormData.location}
                      onChange={(e) => setEditFormData((prev) => ({ ...prev, location: e.target.value }))}
                      placeholder="Contoh: DKI Jakarta"
                      className="text-[13px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[13px]">Nomor Kontrak / Project Code</Label>
                    <Input
                      value={editFormData.contractNo}
                      onChange={(e) => setEditFormData((prev) => ({ ...prev, contractNo: e.target.value }))}
                      placeholder="Contoh: 0001"
                      className="text-[13px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[13px]">Mulai (Start Date)</Label>
                    <Input
                      type="date"
                      value={editFormData.startDate}
                      onChange={(e) => setEditFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                      className="text-[13px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[13px]">Target Selesai (TOC)</Label>
                    <Input
                      type="date"
                      value={editFormData.targetDate}
                      onChange={(e) => setEditFormData((prev) => ({ ...prev, targetDate: e.target.value }))}
                      className="text-[13px]"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-[13px]">Project Manager / PIC (Master User)</Label>
                    <Select
                      value={editFormData.manager}
                      onValueChange={(val) => setEditFormData((prev) => ({ ...prev, manager: val }))}
                    >
                      <SelectTrigger className="text-[13px] w-full">
                        <SelectValue placeholder="Pilih PIC dari Master Data" />
                      </SelectTrigger>
                      <SelectContent>
                        {masterUsers
                          .filter((u) => u.status === 'ACTIVE' || !u.status)
                          .map((u) => (
                            <SelectItem key={u.id} value={u.fullName} className="text-[13px]">
                              {u.fullName} - {u.role}
                            </SelectItem>
                          ))}
                        {editFormData.manager &&
                          !masterUsers.some((u) => u.fullName === editFormData.manager) && (
                            <SelectItem value={editFormData.manager} className="text-[13px]">
                              {editFormData.manager}
                            </SelectItem>
                          )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-[13px]">Cakupan Pekerjaan</Label>
                    <Textarea
                      rows={4}
                      value={editFormData.scope}
                      onChange={(e) => setEditFormData((prev) => ({ ...prev, scope: e.target.value }))}
                      placeholder="Detil cakupan pekerjaan pada proyek/site ini..."
                      className="text-[13px] resize-y"
                    />
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setIsEditDetailOpen(false)}
                    disabled={isSavingDetail}
                    className="text-[13px]"
                  >
                    Batal
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveEditDetail}
                    disabled={isSavingDetail}
                    className="text-[13px]"
                  >
                    {isSavingDetail ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

          </div>
        </TabsContent>

        <TabsContent value="planning" className="mt-0">
          <Tabs value={planningTab} onValueChange={(v) => handleSubTabChange('planningTab', v)} className="w-full">
            <TabsList className="mb-4 flex-wrap justify-start h-auto gap-2">
              <TabsTrigger value="boq" className="flex-none">BOQ Management</TabsTrigger>
              <TabsTrigger value="commercial" className="flex-none">Commercial & Margin</TabsTrigger>
              <TabsTrigger value="survey" className="flex-none">Survey</TabsTrigger>
              <TabsTrigger value="review" className="flex-none">DRM Plan</TabsTrigger>
              <TabsTrigger value="baselines" className="flex-none">Baseline Lock</TabsTrigger>
            </TabsList>
            <TabsContent value="boq">
              <Card className="border-0 shadow-none ring-1 ring-border/50 p-0 gap-0">
                <CardHeader className="bg-muted/10 p-4 border-b flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">BOQ Management</CardTitle>
                    <CardDescription>Kelola Bill of Quantities material yang dibutuhkan.</CardDescription>
                  </div>
                  {!isEditingBOQ && !(project.boqItems && project.boqItems.length > 0) ? (
                    <Button size="sm" onClick={() => setIsEditingBOQ(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Buat BOQ Baru
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setIsEditingBOQ(!isEditingBOQ)}>
                      {isEditingBOQ ? 'Selesai Edit' : 'Edit BOQ'}
                    </Button>
                  )}
                </CardHeader>
                <CardContent className={`p-4 ${(!project.boqItems || project.boqItems.length === 0) && !isEditingBOQ ? 'flex justify-center py-12' : ''}`}>
                  {(!project.boqItems || project.boqItems.length === 0) && !isEditingBOQ ? (
                    <div className="text-center max-w-sm">
                      <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                        <FileText className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">Belum ada data BOQ</h3>
                      <p className="text-muted-foreground text-[10pt] mb-6">Proyek ini belum memiliki daftar material dan Bill of Quantities. Silakan buat baru atau import dari Excel.</p>
                      <div className="flex gap-3 justify-center">
                        <Button variant="outline"><Upload className="w-4 h-4 mr-2" />Import Excel</Button>
                        <Button onClick={() => setIsEditingBOQ(true)}><Plus className="w-4 h-4 mr-2" />Mulai Buat BOQ</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="border-0 shadow-none overflow-x-auto">
                        <Table className="border-0 w-full table-fixed min-w-[760px]">
                          <TableHeader className="bg-transparent">
                            <TableRow className="border-b border-border hover:bg-transparent">
                              <TableHead className="w-[340px] min-w-[340px] font-normal text-[10pt] text-muted-foreground">Nama Material</TableHead>
                              <TableHead className="w-[100px] min-w-[100px] font-normal text-[10pt] text-muted-foreground">Qty</TableHead>
                              <TableHead className="w-[90px] min-w-[90px] font-normal text-[10pt] text-muted-foreground">Satuan</TableHead>
                              <TableHead className="w-[150px] min-w-[150px] font-normal text-[10pt] text-muted-foreground">Harga Satuan</TableHead>
                              <TableHead className="w-[160px] min-w-[160px] font-normal text-[10pt] text-muted-foreground">Total Harga</TableHead>
                              <TableHead className="w-[80px] min-w-[80px] font-normal text-[10pt] text-muted-foreground text-right">{isEditingBOQ ? '' : 'Action'}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {project.boqItems?.map((item) => (
                              <TableRow key={item.id} className="border-b border-border hover:bg-transparent transition-none">
                                <TableCell className="w-[340px] min-w-[340px] font-medium py-2 text-foreground/90 truncate" title={item.name}>
                                  {item.name}
                                </TableCell>
                                <TableCell className="w-[100px] min-w-[100px] py-2 text-foreground/80">
                                  {isEditingBOQ ? (
                                    <Input
                                      type="number"
                                      min={1}
                                      value={item.quantity}
                                      onChange={(e) => {
                                        const val = parseInt(e.target.value) || 0;
                                        const newItems = project.boqItems?.map((i) =>
                                          i.id === item.id ? { ...i, quantity: val } : i
                                        );
                                        updateProject(project.id, { boqItems: newItems });
                                      }}
                                      className="h-8 text-[10pt] w-full border-dashed"
                                    />
                                  ) : (
                                    item.quantity
                                  )}
                                </TableCell>
                                <TableCell className="w-[90px] min-w-[90px] py-2 text-foreground/80 truncate">
                                  {item.unit}
                                </TableCell>
                                <TableCell className="w-[150px] min-w-[150px] py-2 text-foreground/80 truncate">
                                  Rp {item.price.toLocaleString()}
                                </TableCell>
                                <TableCell className="w-[160px] min-w-[160px] py-2 text-foreground/80 font-medium truncate">
                                  Rp {(item.quantity * item.price).toLocaleString()}
                                </TableCell>
                                <TableCell className="w-[80px] min-w-[80px] py-2 text-right">
                                  {isEditingBOQ ? (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                                      onClick={async () => {
                                        const newItems = project.boqItems?.filter((i) => i.id !== item.id);
                                        await updateProject(project.id, { boqItems: newItems });
                                        toast.success(`Material ${item.name} berhasil dihapus dari database`);
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  ) : (
                                    <Button variant="outline" size="sm" className="rounded-full h-8 px-4 text-[10pt] font-medium">
                                      Details
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                            {isEditingBOQ && (
                              <TableRow className="border-b border-border hover:bg-transparent transition-none bg-muted/10">
                                <TableCell className="w-[340px] min-w-[340px] py-2">
                                  <Select
                                    value={newBOQItem.name}
                                    onValueChange={(val) => {
                                      const material = availableMaterials.find((m) => m.name === val || m.id === val);
                                      if (material) {
                                        setNewBOQItem({
                                          ...newBOQItem,
                                          name: material.name,
                                          unit: material.unit,
                                          price: material.price,
                                        });
                                      }
                                    }}
                                  >
                                    <SelectTrigger className="h-8 text-[10pt] border-dashed w-full">
                                      <SelectValue placeholder="Pilih dari Master Data Material..." />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[300px]">
                                      {availableMaterials.length === 0 ? (
                                        <div className="p-2 text-center text-[12px] text-muted-foreground">
                                          Memuat master material...
                                        </div>
                                      ) : (
                                        availableMaterials.map((mat) => (
                                          <SelectItem key={mat.id || mat.name} value={mat.name} className="text-[10pt] py-2">
                                            <div className="flex items-center justify-between w-full gap-3">
                                              <span className="font-medium text-foreground">{mat.name}</span>
                                              <span className="text-[11px] text-primary/80 font-mono shrink-0">
                                                Rp {mat.price.toLocaleString()} / {mat.unit}
                                              </span>
                                            </div>
                                          </SelectItem>
                                        ))
                                      )}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell className="w-[100px] min-w-[100px] py-2">
                                  <Input
                                    type="number"
                                    min={1}
                                    value={newBOQItem.quantity || ''}
                                    onChange={(e) =>
                                      setNewBOQItem({ ...newBOQItem, quantity: parseInt(e.target.value) || 0 })
                                    }
                                    placeholder="Qty"
                                    className="h-8 text-[10pt] w-full border-dashed"
                                  />
                                </TableCell>
                                <TableCell className="w-[90px] min-w-[90px] py-2 text-foreground/80">
                                  <div className="flex h-8 items-center text-[10pt] px-2 bg-muted/30 border border-dashed rounded-md w-full truncate">
                                    {newBOQItem.unit || '-'}
                                  </div>
                                </TableCell>
                                <TableCell className="w-[150px] min-w-[150px] py-2 text-foreground/80">
                                  <div className="flex h-8 items-center text-[10pt] px-2.5 bg-muted/30 border border-dashed rounded-md w-full truncate">
                                    Rp {(newBOQItem.price || 0).toLocaleString()}
                                  </div>
                                </TableCell>
                                <TableCell className="w-[160px] min-w-[160px] py-2 text-foreground/80 font-medium">
                                  <div className="flex h-8 items-center text-[10pt] px-1 truncate">
                                    Rp {(newBOQItem.quantity * newBOQItem.price).toLocaleString()}
                                  </div>
                                </TableCell>
                                <TableCell className="w-[80px] min-w-[80px] py-2 text-right">
                                  <Button
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                    onClick={async () => {
                                      if (!newBOQItem.name) {
                                        toast.error('Pilih material terlebih dahulu');
                                        return;
                                      }
                                      if (!newBOQItem.quantity || newBOQItem.quantity <= 0) {
                                        toast.error('Jumlah quantity harus lebih dari 0');
                                        return;
                                      }
                                      const updated = [
                                        ...(project.boqItems || []),
                                        { id: `boq-${Date.now()}`, ...newBOQItem },
                                      ];
                                      await updateProject(project.id, { boqItems: updated });
                                      toast.success(`Material ${newBOQItem.name} berhasil ditambahkan ke database`);
                                      setNewBOQItem({ name: '', quantity: 1, unit: 'm', price: 0 });
                                    }}
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>

                      {project.boqItems && project.boqItems.length > 0 && (
                        <div className="flex justify-end pt-4">
                          <div className="bg-muted px-4 py-2 rounded-md">
                            <span className="text-[10pt] text-muted-foreground mr-4">Total Estimasi BOQ:</span>
                            <span className="text-lg font-bold">
                              Rp {project.boqItems.reduce((acc, curr) => acc + (curr.quantity * curr.price), 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="commercial">
              <Card className="border-0 shadow-none ring-1 ring-border/50 p-0 gap-0">
                <CardHeader className="bg-muted/10 p-4 border-b flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Commercial & Margin</CardTitle>
                    <CardDescription>Analisa profitabilitas dan margin awal (pra-implementasi).</CardDescription>
                  </div>
                  {!isEditingCommercial && (!project.commercial || (project.commercial.capex === 0 && project.commercial.opex === 0 && project.commercial.revenue === 0)) ? (
                    <Button size="sm" onClick={() => {
                      setCommercialData(project.commercial || { capex: 0, opex: 0, revenue: 0 });
                      setIsEditingCommercial(true);
                    }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Buat Analisa Margin
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => {
                      if (isEditingCommercial) updateProject(project.id, { commercial: commercialData });
                      else setCommercialData(project.commercial || { capex: 0, opex: 0, revenue: 0 });
                      setIsEditingCommercial(!isEditingCommercial);
                    }}>
                      {isEditingCommercial ? 'Simpan Analisa' : 'Edit Analisa'}
                    </Button>
                  )}
                </CardHeader>
                <CardContent className={`p-4 ${(!project.commercial || (project.commercial.capex === 0 && project.commercial.opex === 0 && project.commercial.revenue === 0)) && !isEditingCommercial ? 'flex justify-center py-12' : ''}`}>
                  {(!project.commercial || (project.commercial.capex === 0 && project.commercial.opex === 0 && project.commercial.revenue === 0)) && !isEditingCommercial ? (
                    <div className="text-center max-w-sm">
                      <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                        <CircleDollarSign className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">Analisa Belum Tersedia</h3>
                      <p className="text-muted-foreground text-[10pt] mb-6">Buat analisa margin awal untuk memproyeksikan biaya, pendapatan, dan profitabilitas proyek.</p>
                      <Button onClick={() => {
                        setCommercialData(project.commercial || { capex: 0, opex: 0, revenue: 0 });
                        setIsEditingCommercial(true);
                      }}><Plus className="w-4 h-4 mr-2" />Buat Analisa Margin</Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {isEditingCommercial ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-4 col-span-1 md:col-span-3">
                            <h4 className="font-medium text-sm border-b pb-2">Capital Expenditure (CAPEX)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Biaya Material (Otomatis dari BOQ)</Label>
                                <Input disabled value={`Rp ${totalBOQ.toLocaleString()}`} className="bg-muted font-semibold" />
                              </div>
                              <div className="space-y-2">
                                <Label>Biaya Tambahan (Jasa, Perizinan, dll)</Label>
                                <Input type="number" value={commercialData.capex || ''} onChange={e => setCommercialData({ ...commercialData, capex: parseInt(e.target.value) || 0 })} />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4 col-span-1 md:col-span-3 mt-2">
                            <h4 className="font-medium text-sm border-b pb-2">Operational & Revenue (OPEX & Rev)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Estimasi OPEX (Rp/bulan)</Label>
                                <Input type="number" value={commercialData.opex || ''} onChange={e => setCommercialData({ ...commercialData, opex: parseInt(e.target.value) || 0 })} />
                              </div>
                              <div className="space-y-2">
                                <Label>Proyeksi Pendapatan (Rp/bulan)</Label>
                                <Input type="number" value={commercialData.revenue || ''} onChange={e => setCommercialData({ ...commercialData, revenue: parseInt(e.target.value) || 0 })} />
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="bg-muted/20 p-4 rounded-md border">
                            <p className="text-[10pt] text-muted-foreground mb-1">Total CAPEX</p>
                            <p className="text-xl font-semibold">Rp {(totalBOQ + (project.commercial?.capex || 0)).toLocaleString()}</p>
                            <div className="mt-3 space-y-1">
                              <p className="text-[10pt] text-muted-foreground flex justify-between"><span>BOQ Material:</span> <span>Rp {totalBOQ.toLocaleString()}</span></p>
                              <p className="text-[10pt] text-muted-foreground flex justify-between"><span>Biaya Tambahan:</span> <span>Rp {(project.commercial?.capex || 0).toLocaleString()}</span></p>
                            </div>
                          </div>
                          <div className="bg-muted/20 p-4 rounded-md border">
                            <p className="text-[10pt] text-muted-foreground mb-1">Estimasi OPEX</p>
                            <p className="text-xl font-semibold">Rp {(project.commercial?.opex || 0).toLocaleString()}/bln</p>
                          </div>
                          <div className="bg-muted/20 p-4 rounded-md border">
                            <p className="text-[10pt] text-muted-foreground mb-1">Proyeksi Pendapatan</p>
                            <p className="text-xl font-semibold">Rp {(project.commercial?.revenue || 0).toLocaleString()}/bln</p>
                          </div>
                        </div>
                      )}

                      <div className="bg-primary/5 border border-primary/20 p-4 rounded-md mt-6">
                        <div className="flex justify-between items-center">
                          <p className="font-medium">Proyeksi Gross Margin Bulanan</p>
                          <p className={`text-xl font-bold ${isEditingCommercial
                              ? (commercialData.revenue - commercialData.opex > 0 ? 'text-green-600' : 'text-red-500')
                              : ((project.commercial?.revenue || 0) - (project.commercial?.opex || 0) > 0 ? 'text-green-600' : 'text-red-500')
                            }`}>
                            Rp {isEditingCommercial
                              ? (commercialData.revenue - commercialData.opex).toLocaleString()
                              : ((project.commercial?.revenue || 0) - (project.commercial?.opex || 0)).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="survey" className="mt-0">
              <Tabs value={surveyTab} onValueChange={(v) => handleSubTabChange('surveyTab', v)} orientation="vertical" className="flex flex-col md:flex-row gap-6 w-full">
                <TabsList className="flex-col justify-start h-auto w-full md:w-64 bg-transparent border-r rounded-none p-0 gap-0 items-start shrink-0">
                  <TabsTrigger
                    value="route"
                    className="w-[calc(100%-16px)] justify-start text-left data-[state=active]:bg-muted/60 data-[state=active]:border-r-2 data-[state=active]:border-primary data-[state=active]:font-semibold text-[13px] px-3.5 py-2 my-[6px] mx-[8px] rounded-md shadow-none transition-all"
                  >
                    Route & Catuan Fiber
                  </TabsTrigger>
                  <TabsTrigger
                    value="validation"
                    className="w-[calc(100%-16px)] justify-start text-left data-[state=active]:bg-muted/60 data-[state=active]:border-r-2 data-[state=active]:border-primary data-[state=active]:font-semibold text-[13px] px-3.5 py-2 my-[6px] mx-[8px] rounded-md shadow-none transition-all"
                  >
                    Survey Validation
                  </TabsTrigger>
                  <TabsTrigger
                    value="kml"
                    className="w-[calc(100%-16px)] justify-start text-left data-[state=active]:bg-muted/60 data-[state=active]:border-r-2 data-[state=active]:border-primary data-[state=active]:font-semibold text-[13px] px-3.5 py-2 my-[6px] mx-[8px] rounded-md shadow-none transition-all"
                  >
                    KML & Route Verification
                  </TabsTrigger>
                  <TabsTrigger
                    value="permits"
                    className="w-[calc(100%-16px)] justify-start text-left data-[state=active]:bg-muted/60 data-[state=active]:border-r-2 data-[state=active]:border-primary data-[state=active]:font-semibold text-[13px] px-3.5 py-2 my-[6px] mx-[8px] rounded-md shadow-none transition-all"
                  >
                    Permit Management
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 w-full min-w-0">
                  {/* 1. ROUTE & CATUAN FIBER */}
                  <TabsContent value="route" className="mt-0">
                    <Card className="border-0 shadow-none ring-1 ring-border/50 p-0 gap-0">
                      <CardHeader className="bg-muted/10 p-4 border-b flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">Route & Catuan Fiber</CardTitle>
                          <CardDescription className="text-[13px] text-muted-foreground">
                            Topologi tarikan kabel dan titik catuan fiber optik proyek ini.
                          </CardDescription>
                        </div>
                        <Button size="sm" variant="outline" onClick={handleOpenEditRoute} className="text-[13px] h-8 gap-1.5">
                          <Edit className="w-3.5 h-3.5 mr-1" />
                          {project.surveyRoute?.startPoint || project.routeNotes ? 'Edit Rute' : 'Input Data Rute'}
                        </Button>
                      </CardHeader>
                      <CardContent className="p-4">
                        {project.surveyRoute?.startPoint || project.surveyRoute?.routeNotes || project.routeNotes ? (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                              <div className="p-3 bg-muted/20 rounded-md border">
                                <div className="text-[12px] text-muted-foreground mb-1">Titik Awal / Catuan</div>
                                <div className="text-[13px] font-semibold text-foreground">{project.surveyRoute?.startPoint || '-'}</div>
                              </div>
                              <div className="p-3 bg-muted/20 rounded-md border">
                                <div className="text-[12px] text-muted-foreground mb-1">Titik Akhir / Terminasi</div>
                                <div className="text-[13px] font-semibold text-foreground">{project.surveyRoute?.endPoint || '-'}</div>
                              </div>
                              <div className="p-3 bg-muted/20 rounded-md border">
                                <div className="text-[12px] text-muted-foreground mb-1">Estimasi Panjang Tarikan</div>
                                <div className="text-[13px] font-semibold text-foreground">
                                  {project.surveyRoute?.totalLengthMeters ? `${project.surveyRoute.totalLengthMeters.toLocaleString()} Meter` : '-'}
                                </div>
                              </div>
                              <div className="p-3 bg-muted/20 rounded-md border">
                                <div className="text-[12px] text-muted-foreground mb-1">Tipe Kabel FO</div>
                                <div className="text-[13px] font-semibold text-foreground">{project.surveyRoute?.cableType || '-'}</div>
                              </div>
                              <div className="p-3 bg-muted/20 rounded-md border">
                                <div className="text-[12px] text-muted-foreground mb-1">Metode Instalasi</div>
                                <div className="text-[13px] font-semibold text-foreground">{project.surveyRoute?.deploymentType || 'Aerial (Tiang)'}</div>
                              </div>
                              <div className="p-3 bg-muted/20 rounded-md border">
                                <div className="text-[12px] text-muted-foreground mb-1">Kapasitas Feeder</div>
                                <div className="text-[13px] font-semibold text-foreground">{project.surveyRoute?.feederCapacity || '24 Core'}</div>
                              </div>
                            </div>

                            <div className="bg-muted/20 p-4 rounded-md border">
                              <div className="text-[13px] font-semibold text-foreground mb-1.5">Deskripsi Rute Geografis & Catuan</div>
                              <p className="text-[13px] text-foreground/90 leading-relaxed whitespace-pre-line">
                                {project.surveyRoute?.routeNotes || project.routeNotes || 'Belum ada catatan deskripsi rute.'}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center max-w-sm mx-auto py-12">
                            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                              <Map className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground mb-2">Rute Belum Dipetakan</h3>
                            <p className="text-muted-foreground text-[13px] mb-6">
                              Data koordinat dan catuan fiber belum tersedia. Silakan masukkan data rute untuk menyimpan ke database.
                            </p>
                            <Button onClick={handleOpenEditRoute} className="text-[13px]">
                              <Plus className="w-4 h-4 mr-2" />
                              Input Data Rute
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Modal Edit Route */}
                    <Dialog open={isEditingRoute} onOpenChange={setIsEditingRoute}>
                      <DialogContent className="max-w-xl">
                        <DialogHeader>
                          <DialogTitle>Edit Rute & Catuan Fiber</DialogTitle>
                          <DialogDescription className="text-[13px]">
                            Masukkan data rute dan topologi fiber optik yang tersimpan ke database proyek.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3">
                          <div className="space-y-1.5">
                            <Label className="text-[13px]">Titik Awal / Catuan</Label>
                            <Input
                              value={routeFormData.startPoint}
                              onChange={(e) => setRouteFormData({ ...routeFormData, startPoint: e.target.value })}
                              placeholder="Contoh: ODC-01 Sentul City"
                              className="text-[13px]"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[13px]">Titik Akhir / Terminasi</Label>
                            <Input
                              value={routeFormData.endPoint}
                              onChange={(e) => setRouteFormData({ ...routeFormData, endPoint: e.target.value })}
                              placeholder="Contoh: Site BTS Tower Sukaresmi"
                              className="text-[13px]"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-[13px]">Estimasi Panjang (Meter)</Label>
                            <Input
                              type="number"
                              value={routeFormData.totalLengthMeters}
                              onChange={(e) => setRouteFormData({ ...routeFormData, totalLengthMeters: e.target.value })}
                              placeholder="Contoh: 4850"
                              className="text-[13px]"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[13px]">Tipe Kabel FO</Label>
                            <Input
                              value={routeFormData.cableType}
                              onChange={(e) => setRouteFormData({ ...routeFormData, cableType: e.target.value })}
                              placeholder="Contoh: Kabel Fiber Optik ADSS 24 Core"
                              className="text-[13px]"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-[13px]">Metode Instalasi</Label>
                            <Select
                              value={routeFormData.deploymentType}
                              onValueChange={(val) => setRouteFormData({ ...routeFormData, deploymentType: val })}
                            >
                              <SelectTrigger className="text-[13px] w-full">
                                <SelectValue placeholder="Pilih Metode" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Aerial (Tiang)" className="text-[13px]">Aerial (Tiang OSP)</SelectItem>
                                <SelectItem value="Duct (Bawah Tanah)" className="text-[13px]">Duct (Bawah Tanah / Manhole)</SelectItem>
                                <SelectItem value="Direct Buried" className="text-[13px]">Direct Buried (Tanam Langsung)</SelectItem>
                                <SelectItem value="Kombinasi" className="text-[13px]">Kombinasi (Aerial & Duct)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-[13px]">Kapasitas Feeder</Label>
                            <Select
                              value={routeFormData.feederCapacity}
                              onValueChange={(val) => setRouteFormData({ ...routeFormData, feederCapacity: val })}
                            >
                              <SelectTrigger className="text-[13px] w-full">
                                <SelectValue placeholder="Pilih Kapasitas" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="12 Core" className="text-[13px]">12 Core</SelectItem>
                                <SelectItem value="24 Core" className="text-[13px]">24 Core</SelectItem>
                                <SelectItem value="48 Core" className="text-[13px]">48 Core</SelectItem>
                                <SelectItem value="96 Core" className="text-[13px]">96 Core</SelectItem>
                                <SelectItem value="144 Core" className="text-[13px]">144 Core</SelectItem>
                                <SelectItem value="288 Core" className="text-[13px]">288 Core</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1.5 sm:col-span-2">
                            <Label className="text-[13px]">Deskripsi Rute Geografis</Label>
                            <Textarea
                              rows={3}
                              value={routeFormData.routeNotes}
                              onChange={(e) => setRouteFormData({ ...routeFormData, routeNotes: e.target.value })}
                              placeholder="Deskripsikan rute tarikan, titik crossing, dan kondisi lapangan..."
                              className="text-[13px]"
                            />
                          </div>
                        </div>

                        <DialogFooter className="gap-2">
                          <Button variant="outline" type="button" onClick={() => setIsEditingRoute(false)} disabled={isSavingRoute} className="text-[13px]">
                            Batal
                          </Button>
                          <Button type="button" onClick={handleSaveRoute} disabled={isSavingRoute} className="text-[13px]">
                            {isSavingRoute ? 'Menyimpan...' : 'Simpan ke Database'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TabsContent>

                  {/* 2. SURVEY VALIDATION */}
                  <TabsContent value="validation" className="mt-0">
                    <Card className="border-0 shadow-none ring-1 ring-border/50 p-0 gap-0">
                      <CardHeader className="bg-muted/10 p-4 border-b flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">Survey Validation</CardTitle>
                          <CardDescription className="text-[13px] text-muted-foreground">
                            Hasil evaluasi kelayakan rute dan survey fisik lapangan.
                          </CardDescription>
                        </div>
                        <Button size="sm" variant="outline" type="button" onClick={handleOpenEditValidation} className="text-[13px] h-8 gap-1.5">
                          <Edit className="w-3.5 h-3.5 mr-1" />
                          {(surveyValidationData?.surveyDate || project?.surveyValidation?.surveyDate) ? 'Edit Validasi Survey' : 'Mulai Validasi Survey'}
                        </Button>
                      </CardHeader>
                      <CardContent className="p-4">
                        {(surveyValidationData?.surveyDate || project?.surveyValidation?.surveyDate) ? (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="p-3 bg-muted/20 rounded-md border">
                                <div className="text-[12px] text-muted-foreground mb-1">Status Kelayakan</div>
                                <div>
                                  <Badge
                                    className={`text-[12px] font-medium px-2 py-0.5 ${
                                      (surveyValidationData?.feasibility || project?.surveyValidation?.feasibility) === 'Layak'
                                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                                        : (surveyValidationData?.feasibility || project?.surveyValidation?.feasibility) === 'Tidak Layak'
                                        ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30'
                                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
                                    }`}
                                    variant="outline"
                                  >
                                    {(surveyValidationData?.feasibility || project?.surveyValidation?.feasibility) || 'Layak dengan Catatan'}
                                  </Badge>
                                </div>
                              </div>
                              <div className="p-3 bg-muted/20 rounded-md border">
                                <div className="text-[12px] text-muted-foreground mb-1">Tanggal Survey</div>
                                <div className="text-[13px] font-semibold text-foreground">{(surveyValidationData?.surveyDate || project?.surveyValidation?.surveyDate) || '-'}</div>
                              </div>
                              <div className="p-3 bg-muted/20 rounded-md border">
                                <div className="text-[12px] text-muted-foreground mb-1">Surveyor / PIC</div>
                                <div className="text-[13px] font-semibold text-foreground">{(surveyValidationData?.surveyorName || project?.surveyValidation?.surveyorName) || '-'}</div>
                              </div>
                              <div className="p-3 bg-muted/20 rounded-md border">
                                <div className="text-[12px] text-muted-foreground mb-1">Risiko RoW / Perizinan</div>
                                <div className="text-[13px] font-semibold text-foreground">{(surveyValidationData?.rowPermitRisk || project?.surveyValidation?.rowPermitRisk) || 'Sedang'}</div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-4 bg-muted/20 rounded-md border space-y-1.5">
                                <div className="text-[13px] font-semibold text-foreground">Kondisi Tiang & Jalur OSP</div>
                                <p className="text-[13px] text-foreground/90 leading-relaxed">
                                  {(surveyValidationData?.poleCondition || project?.surveyValidation?.poleCondition) || '-'}
                                </p>
                              </div>
                              <div className="p-4 bg-muted/20 rounded-md border space-y-1.5">
                                <div className="text-[13px] font-semibold text-foreground">Temuan & Kendala Lapangan</div>
                                <p className="text-[13px] text-foreground/90 leading-relaxed">
                                  {(surveyValidationData?.findings || project?.surveyValidation?.findings) || '-'}
                                </p>
                              </div>
                            </div>

                            <div className="p-4 bg-primary/5 border border-primary/20 rounded-md space-y-1.5">
                              <div className="text-[13px] font-semibold text-primary">Rekomendasi Teknis untuk DRM</div>
                              <p className="text-[13px] text-foreground/90 leading-relaxed">
                                {(surveyValidationData?.recommendations || project?.surveyValidation?.recommendations) || '-'}
                              </p>
                              {(surveyValidationData?.verifiedBy || project?.surveyValidation?.verifiedBy) && (
                                <div className="text-[12px] text-muted-foreground pt-2 border-t border-primary/10">
                                  Diverifikasi oleh: <span className="font-semibold text-foreground">{(surveyValidationData?.verifiedBy || project?.surveyValidation?.verifiedBy)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center max-w-sm mx-auto py-12">
                            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                              <CheckCircle className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground mb-2">Belum Ada Hasil Survey</h3>
                            <p className="text-muted-foreground text-[13px] mb-6">
                              Form validasi hasil survey lapangan oleh tim belum diisi. Silakan isi form validasi untuk menyimpan ke database.
                            </p>
                            <Button type="button" onClick={handleOpenEditValidation} className="text-[13px]">
                              <Plus className="w-4 h-4 mr-2" />
                              Mulai Form Survey
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Modal Edit Validation */}
                    <Dialog open={isEditingValidation} onOpenChange={setIsEditingValidation}>
                      <DialogContent className="max-w-xl">
                        <DialogHeader>
                          <DialogTitle>Validasi Hasil Survey Lapangan</DialogTitle>
                          <DialogDescription className="text-[13px]">
                            Masukkan data hasil evaluasi survey fisik rute fiber optik ke dalam database.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3">
                          <div className="space-y-1.5">
                            <Label className="text-[13px]">Tanggal Survey</Label>
                            <Input
                              type="date"
                              value={validationFormData.surveyDate}
                              onChange={(e) => setValidationFormData({ ...validationFormData, surveyDate: e.target.value })}
                              className="text-[13px]"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-[13px]">Surveyor / PIC (Master User)</Label>
                            <Select
                              value={validationFormData.surveyorName}
                              onValueChange={(val) => setValidationFormData({ ...validationFormData, surveyorName: val })}
                            >
                              <SelectTrigger className="text-[13px] w-full">
                                <SelectValue placeholder="Pilih Surveyor" />
                              </SelectTrigger>
                              <SelectContent>
                                {masterUsers.map((u) => (
                                  <SelectItem key={u.id} value={u.fullName} className="text-[13px]">
                                    {u.fullName} - {u.role}
                                  </SelectItem>
                                ))}
                                {validationFormData.surveyorName && !masterUsers.some(u => u.fullName === validationFormData.surveyorName) && (
                                  <SelectItem value={validationFormData.surveyorName} className="text-[13px]">
                                    {validationFormData.surveyorName}
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-[13px]">Status Kelayakan</Label>
                            <Select
                              value={validationFormData.feasibility}
                              onValueChange={(val) => setValidationFormData({ ...validationFormData, feasibility: val })}
                            >
                              <SelectTrigger className="text-[13px] w-full">
                                <SelectValue placeholder="Pilih Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Layak" className="text-[13px]">Layak</SelectItem>
                                <SelectItem value="Layak dengan Catatan" className="text-[13px]">Layak dengan Catatan</SelectItem>
                                <SelectItem value="Tidak Layak" className="text-[13px]">Tidak Layak</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-[13px]">Risiko RoW / Perizinan</Label>
                            <Select
                              value={validationFormData.rowPermitRisk}
                              onValueChange={(val) => setValidationFormData({ ...validationFormData, rowPermitRisk: val })}
                            >
                              <SelectTrigger className="text-[13px] w-full">
                                <SelectValue placeholder="Pilih Risiko" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Rendah" className="text-[13px]">Rendah</SelectItem>
                                <SelectItem value="Sedang" className="text-[13px]">Sedang</SelectItem>
                                <SelectItem value="Tinggi" className="text-[13px]">Tinggi</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1.5 sm:col-span-2">
                            <Label className="text-[13px]">Kondisi Tiang & Jalur Eksisting</Label>
                            <Input
                              value={validationFormData.poleCondition}
                              onChange={(e) => setValidationFormData({ ...validationFormData, poleCondition: e.target.value })}
                              placeholder="Contoh: Tiang Telkom mencukupi, dibutuhkan 6 tiang baru untuk crossing..."
                              className="text-[13px]"
                            />
                          </div>

                          <div className="space-y-1.5 sm:col-span-2">
                            <Label className="text-[13px]">Temuan & Kendala Lapangan</Label>
                            <Textarea
                              rows={2}
                              value={validationFormData.findings}
                              onChange={(e) => setValidationFormData({ ...validationFormData, findings: e.target.value })}
                              placeholder="Temuan utilitas bawah tanah, crossing jembatan, perizinan warga..."
                              className="text-[13px]"
                            />
                          </div>

                          <div className="space-y-1.5 sm:col-span-2">
                            <Label className="text-[13px]">Rekomendasi Teknis</Label>
                            <Textarea
                              rows={2}
                              value={validationFormData.recommendations}
                              onChange={(e) => setValidationFormData({ ...validationFormData, recommendations: e.target.value })}
                              placeholder="Rekomendasi spesifikasi kabel, tinggi tiang, atau alternatif jalur..."
                              className="text-[13px]"
                            />
                          </div>

                          <div className="space-y-1.5 sm:col-span-2">
                            <Label className="text-[13px]">Verifikator / Lead Eng (Master User)</Label>
                            <Select
                              value={validationFormData.verifiedBy}
                              onValueChange={(val) => setValidationFormData({ ...validationFormData, verifiedBy: val })}
                            >
                              <SelectTrigger className="text-[13px] w-full">
                                <SelectValue placeholder="Pilih Verifikator" />
                              </SelectTrigger>
                              <SelectContent>
                                {masterUsers.map((u) => (
                                  <SelectItem key={u.id} value={u.fullName} className="text-[13px]">
                                    {u.fullName} - {u.role}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <DialogFooter className="gap-2">
                          <Button variant="outline" type="button" onClick={() => setIsEditingValidation(false)} disabled={isSavingValidation} className="text-[13px]">
                            Batal
                          </Button>
                          <Button type="button" onClick={handleSaveValidation} disabled={isSavingValidation} className="text-[13px]">
                            {isSavingValidation ? 'Menyimpan...' : 'Simpan ke Database'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TabsContent>

                  {/* 3. KML & ROUTE VERIFICATION */}
                  <TabsContent value="kml" className="mt-0">
                    <Card className="border-0 shadow-none ring-1 ring-border/50 p-0 gap-0">
                      <CardHeader className="bg-muted/10 p-4 border-b flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">KML & Route Verification</CardTitle>
                          <CardDescription className="text-[13px] text-muted-foreground">
                            Integrasi data geospasial KML/KMZ dan verifikasi rute survey lapangan (Tersimpan ke Database).
                          </CardDescription>
                        </div>
                        <Button size="sm" variant="outline" type="button" onClick={handleOpenEditKml} className="text-[13px] h-8 gap-1.5">
                          <Upload className="w-3.5 h-3.5 mr-1" />
                          {(surveyKmlData?.fileName || project?.surveyKml?.fileName) ? 'Perbarui Data KML' : 'Upload File KML/KMZ'}
                        </Button>
                      </CardHeader>
                      <CardContent className="p-4">
                        {(surveyKmlData?.fileName || project?.surveyKml?.fileName) ? (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                              <div className="p-3 bg-muted/20 rounded-md border">
                                <div className="text-[12px] text-muted-foreground mb-1">Status Verifikasi Rute</div>
                                <div>
                                  <Badge
                                    className={`text-[12px] font-medium px-2 py-0.5 ${
                                      (surveyKmlData?.routeStatus || project?.surveyKml?.routeStatus) === 'Verified'
                                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                                        : (surveyKmlData?.routeStatus || project?.surveyKml?.routeStatus) === 'Need Revision'
                                        ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30'
                                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
                                    }`}
                                    variant="outline"
                                  >
                                    {(surveyKmlData?.routeStatus || project?.surveyKml?.routeStatus) || 'Verified'}
                                  </Badge>
                                </div>
                              </div>
                              <div className="p-3 bg-muted/20 rounded-md border">
                                <div className="text-[12px] text-muted-foreground mb-1">File KML / KMZ</div>
                                <div className="text-[13px] font-semibold text-foreground flex items-center gap-1.5">
                                  <FileText className="w-4 h-4 text-primary" />
                                  <span className="truncate">{(surveyKmlData?.fileName || project?.surveyKml?.fileName)}</span>
                                  <span className="text-[11px] text-muted-foreground">({(surveyKmlData?.fileSize || project?.surveyKml?.fileSize || '1.2 MB')})</span>
                                </div>
                              </div>
                              <div className="p-3 bg-muted/20 rounded-md border">
                                <div className="text-[12px] text-muted-foreground mb-1">Tanggal Verifikasi</div>
                                <div className="text-[13px] font-semibold text-foreground">{(surveyKmlData?.uploadDate || project?.surveyKml?.uploadDate) || '-'}</div>
                              </div>
                              <div className="p-3 bg-muted/20 rounded-md border">
                                <div className="text-[12px] text-muted-foreground mb-1">Verifikator GIS</div>
                                <div className="text-[13px] font-semibold text-foreground">{(surveyKmlData?.verifiedBy || project?.surveyKml?.verifiedBy) || '-'}</div>
                              </div>
                              <div className="p-3 bg-muted/20 rounded-md border">
                                <div className="text-[12px] text-muted-foreground mb-1">Koordinat Awal</div>
                                <div className="text-[13px] font-mono font-medium text-foreground">{(surveyKmlData?.startCoord || project?.surveyKml?.startCoord) || '-'}</div>
                              </div>
                              <div className="p-3 bg-muted/20 rounded-md border">
                                <div className="text-[12px] text-muted-foreground mb-1">Koordinat Akhir</div>
                                <div className="text-[13px] font-mono font-medium text-foreground">{(surveyKmlData?.endCoord || project?.surveyKml?.endCoord) || '-'}</div>
                              </div>
                            </div>

                            <div className="bg-muted/20 p-4 rounded-md border">
                              <div className="text-[13px] font-semibold text-foreground mb-1.5">Catatan Verifikasi GIS / KML</div>
                              <p className="text-[13px] text-foreground/90 leading-relaxed whitespace-pre-line">
                                {(surveyKmlData?.notes || project?.surveyKml?.notes) || 'Track KML telah diverifikasi dan siap digunakan sebagai acuan DRM Plan.'}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center max-w-sm mx-auto py-12">
                            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                              <Map className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground mb-2">Tidak Ada Data KML</h3>
                            <p className="text-muted-foreground text-[13px] mb-6">
                              Integrasi file KML/KMZ untuk verifikasi koordinat rute hasil survey lapangan.
                            </p>
                            <Button type="button" onClick={handleOpenEditKml} className="text-[13px]">
                              <Upload className="w-4 h-4 mr-2" />
                              Upload File KML/KMZ
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Modal Upload & Verifikasi KML */}
                    <Dialog open={isEditingKml} onOpenChange={setIsEditingKml}>
                      <DialogContent className="max-w-xl">
                        <DialogHeader>
                          <DialogTitle>Unggah & Verifikasi Data KML Geospasial</DialogTitle>
                          <DialogDescription className="text-[13px]">
                            Pilih file .kml atau .kmz dari komputer Anda untuk mengekstrak titik koordinat dan menyimpannya ke database.
                          </DialogDescription>
                        </DialogHeader>

                        {/* Input File Unggah Nyata */}
                        <div className="pt-2">
                          <input
                            type="file"
                            ref={kmlFileInputRef}
                            onChange={handleKmlFileSelect}
                            accept=".kml,.kmz"
                            className="hidden"
                          />
                          <div
                            onClick={() => kmlFileInputRef.current?.click()}
                            className="border-2 border-dashed border-primary/40 hover:border-primary bg-primary/5 hover:bg-primary/10 rounded-lg p-5 text-center cursor-pointer transition-colors"
                          >
                            <Upload className="w-7 h-7 text-primary mx-auto mb-1.5" />
                            <p className="text-[13px] font-semibold text-foreground">
                              {kmlFormData.fileName ? `File Terpilih: ${kmlFormData.fileName}` : 'Klik untuk Memilih / Mengunggah File KML atau KMZ'}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              Format: .kml atau .kmz (Sistem otomatis membaca koordinat track dan ukuran file)
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3">
                          <div className="space-y-1.5">
                            <Label className="text-[13px]">Nama File KML / KMZ</Label>
                            <Input
                              value={kmlFormData.fileName}
                              onChange={(e) => setKmlFormData({ ...kmlFormData, fileName: e.target.value })}
                              placeholder="Contoh: Route_FO_Sentul_Rev1.kml"
                              className="text-[13px]"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[13px]">Ukuran File</Label>
                            <Input
                              value={kmlFormData.fileSize}
                              onChange={(e) => setKmlFormData({ ...kmlFormData, fileSize: e.target.value })}
                              placeholder="Contoh: 1.2 MB"
                              className="text-[13px]"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-[13px]">Tanggal Verifikasi</Label>
                            <Input
                              type="date"
                              value={kmlFormData.uploadDate}
                              onChange={(e) => setKmlFormData({ ...kmlFormData, uploadDate: e.target.value })}
                              className="text-[13px]"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[13px]">Status Verifikasi</Label>
                            <Select
                              value={kmlFormData.routeStatus}
                              onValueChange={(val) => setKmlFormData({ ...kmlFormData, routeStatus: val })}
                            >
                              <SelectTrigger className="text-[13px] w-full">
                                <SelectValue placeholder="Pilih Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Verified" className="text-[13px]">Verified (Terverifikasi)</SelectItem>
                                <SelectItem value="Need Revision" className="text-[13px]">Need Revision (Perlu Revisi)</SelectItem>
                                <SelectItem value="Pending Verification" className="text-[13px]">Pending Verification</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-[13px]">Koordinat Titik Awal</Label>
                            <Input
                              value={kmlFormData.startCoord}
                              onChange={(e) => setKmlFormData({ ...kmlFormData, startCoord: e.target.value })}
                              placeholder="-6.553210, 106.854120"
                              className="text-[13px] font-mono"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[13px]">Koordinat Titik Akhir</Label>
                            <Input
                              value={kmlFormData.endCoord}
                              onChange={(e) => setKmlFormData({ ...kmlFormData, endCoord: e.target.value })}
                              placeholder="-6.578910, 106.883450"
                              className="text-[13px] font-mono"
                            />
                          </div>

                          <div className="space-y-1.5 sm:col-span-2">
                            <Label className="text-[13px]">Verifikator GIS (Master User)</Label>
                            <Select
                              value={kmlFormData.verifiedBy}
                              onValueChange={(val) => setKmlFormData({ ...kmlFormData, verifiedBy: val })}
                            >
                              <SelectTrigger className="text-[13px] w-full">
                                <SelectValue placeholder="Pilih Verifikator" />
                              </SelectTrigger>
                              <SelectContent>
                                {masterUsers.map((u) => (
                                  <SelectItem key={u.id} value={u.fullName} className="text-[13px]">
                                    {u.fullName} - {u.role}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1.5 sm:col-span-2">
                            <Label className="text-[13px]">Catatan Verifikasi Rute</Label>
                            <Textarea
                              rows={3}
                              value={kmlFormData.notes}
                              onChange={(e) => setKmlFormData({ ...kmlFormData, notes: e.target.value })}
                              placeholder="Catatan hasil pengecekan lintasan rute GIS..."
                              className="text-[13px]"
                            />
                          </div>
                        </div>

                        <DialogFooter className="gap-2">
                          <Button variant="outline" type="button" onClick={() => setIsEditingKml(false)} disabled={isSavingKml} className="text-[13px]">
                            Batal
                          </Button>
                          <Button type="button" onClick={handleSaveKml} disabled={isSavingKml || isUploadingKmlFile} className="text-[13px]">
                            {isSavingKml ? 'Menyimpan...' : 'Simpan Data KML'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TabsContent>

                  {/* 4. PERMIT MANAGEMENT */}
                  <TabsContent value="permits" className="mt-0">
                    <Card className="border-0 shadow-none ring-1 ring-border/50 p-0 gap-0">
                      <CardHeader className="bg-muted/10 p-4 border-b flex flex-row items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">Permit Management</CardTitle>
                            {permitsList.length > 0 && (
                              <Badge variant="secondary" className="text-[11px] font-normal px-2 py-0.5">
                                {permitsList.length} Site Terdaftar
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="text-[13px] text-muted-foreground">
                            Status perizinan site, tahapan progress, dan checklist dokumen resmi (Tersimpan ke Database).
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            type="button"
                            onClick={refreshPermits}
                            disabled={isLoadingPermits}
                            className="text-[13px] h-8 gap-1.5"
                            title="Segarkan data perizinan dari database"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPermits ? 'animate-spin' : ''}`} />
                            Segarkan
                          </Button>
                          <Button size="sm" type="button" onClick={handleOpenAddPermit} className="text-[13px] h-8 gap-1.5">
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Tambah Data Perizinan
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        {Array.isArray(permitsList) && permitsList.length > 0 ? (
                          <div className="overflow-x-auto">
                            <Table className="text-[13px] whitespace-nowrap">
                              <TableHeader className="bg-muted/30">
                                <TableRow>
                                  <TableHead className="font-semibold text-foreground px-4 py-2.5">Site ID</TableHead>
                                  <TableHead className="font-semibold text-foreground px-4 py-2.5">Kategori</TableHead>
                                  <TableHead className="font-semibold text-foreground px-4 py-2.5">Status</TableHead>
                                  <TableHead className="font-semibold text-foreground px-4 py-2.5">Progress Detail</TableHead>
                                  <TableHead className="font-semibold text-foreground px-4 py-2.5">Target Selesai</TableHead>
                                  <TableHead className="font-semibold text-foreground px-4 py-2.5">PIC</TableHead>
                                  <TableHead className="font-semibold text-foreground px-4 py-2.5 text-right">Biaya / Retribusi</TableHead>
                                  <TableHead className="font-semibold text-foreground px-4 py-2.5 text-center">Aksi</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {permitsList.map((p) => (
                                  <TableRow key={p.id} className="border-b hover:bg-muted/20 transition-none">
                                    <TableCell className="font-semibold text-foreground px-4 py-3">{p.siteId}</TableCell>
                                    <TableCell className="px-4 py-3 text-muted-foreground">{p.category || 'PU Kota / Kab'}</TableCell>
                                    <TableCell className="px-4 py-3">
                                      <Badge
                                        variant="outline"
                                        className={`text-[12px] font-medium px-2 py-0.5 ${
                                          p.status === 'On Air' || p.status === 'Uji Terima'
                                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                                            : p.status === 'Drop'
                                            ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30'
                                            : p.status === 'Perizinan'
                                            ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30'
                                            : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
                                        }`}
                                      >
                                        {p.status}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 font-medium text-foreground">{p.progressDetail}</TableCell>
                                    <TableCell className="px-4 py-3 text-muted-foreground">{p.targetDate || '-'}</TableCell>
                                    <TableCell className="px-4 py-3 text-foreground">{p.picName || '-'}</TableCell>
                                    <TableCell className="px-4 py-3 text-right font-medium">
                                      {p.cost ? `Rp ${p.cost.toLocaleString()}` : '-'}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-center">
                                      <div className="flex items-center justify-center gap-1">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                          onClick={() => handleOpenEditPermit(p)}
                                        >
                                          <Edit className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                                          onClick={() => handleDeletePermit(p.id)}
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <p className="text-[13px] text-muted-foreground mb-4">Belum ada data perizinan site yang tercatat di database.</p>
                            <Button size="sm" type="button" onClick={handleOpenAddPermit} className="text-[13px]">
                              <Plus className="w-4 h-4 mr-2" />
                              Tambah Data Perizinan
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Dialog Tambah/Edit Data Perizinan */}
                    <Dialog open={isPermitDialogOpen} onOpenChange={setIsPermitDialogOpen}>
                      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{editingPermitId ? 'Edit Data Perizinan Site' : 'Tambah Data Perizinan Site'}</DialogTitle>
                          <DialogDescription className="text-[13px]">
                            Masukkan detail Site ID, status tahapan, progress, dan checklist dokumen perizinan.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-3">
                          <div className="space-y-1.5">
                            <Label className="text-[13px]">Site ID / Ruas</Label>
                            <Input
                              value={permitFormData.siteId}
                              onChange={(e) => setPermitFormData({ ...permitFormData, siteId: e.target.value })}
                              placeholder="Contoh: SITE-SENTUL-01"
                              className="text-[13px]"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-[13px]">Kategori Instansi</Label>
                            <Select
                              value={permitFormData.category}
                              onValueChange={(val) => setPermitFormData({ ...permitFormData, category: val })}
                            >
                              <SelectTrigger className="text-[13px] w-full">
                                <SelectValue placeholder="Pilih Kategori" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PU Kota / Kab" className="text-[13px]">PU Kota / Kab</SelectItem>
                                <SelectItem value="PU Prov" className="text-[13px]">PU Provinsi</SelectItem>
                                <SelectItem value="PU Nas" className="text-[13px]">PU Nasional</SelectItem>
                                <SelectItem value="Private Area" className="text-[13px]">Private Area / Developer</SelectItem>
                                <SelectItem value="Izin Warga / Lingkungan" className="text-[13px]">Izin Warga / RT-RW</SelectItem>
                                <SelectItem value="LSM / Lainnya" className="text-[13px]">LSM / Kompensasi Lainnya</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-[13px]">Status Tahapan</Label>
                            <Select
                              value={permitFormData.status}
                              onValueChange={(val) => setPermitFormData({ ...permitFormData, status: val })}
                            >
                              <SelectTrigger className="text-[13px] w-full">
                                <SelectValue placeholder="Pilih Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Drop" className="text-[13px]">Drop</SelectItem>
                                <SelectItem value="Aanwijzing" className="text-[13px]">Aanwijzing</SelectItem>
                                <SelectItem value="Perizinan" className="text-[13px]">Perizinan</SelectItem>
                                <SelectItem value="Matdel" className="text-[13px]">Matdel</SelectItem>
                                <SelectItem value="Instalasi" className="text-[13px]">Instalasi</SelectItem>
                                <SelectItem value="Finish Install" className="text-[13px]">Finish Install</SelectItem>
                                <SelectItem value="On Air" className="text-[13px]">On Air</SelectItem>
                                <SelectItem value="Uji Terima" className="text-[13px]">Uji Terima</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1.5 sm:col-span-2">
                            <Label className="text-[13px]">Progress Detail</Label>
                            <Select
                              value={permitFormData.progressDetail}
                              onValueChange={(val) => setPermitFormData({ ...permitFormData, progressDetail: val })}
                            >
                              <SelectTrigger className="text-[13px] w-full">
                                <SelectValue placeholder="Pilih Progress Detail" />
                              </SelectTrigger>
                              <SelectContent className="max-h-[300px]">
                                <SelectGroup>
                                  <SelectLabel>Perizinan</SelectLabel>
                                  <SelectItem value="2.1 Submit permohon ke PU" className="text-[13px]">2.1 Submit permohon ke PU</SelectItem>
                                  <SelectItem value="2.2 Input OSS" className="text-[13px]">2.2 Input OSS</SelectItem>
                                  <SelectItem value="2.3 Pemaparan bersama PU" className="text-[13px]">2.3 Pemaparan bersama PU</SelectItem>
                                  <SelectItem value="2.4 Survey lokasi bersama PU" className="text-[13px]">2.4 Survey lokasi bersama PU</SelectItem>
                                  <SelectItem value="2.5 Perhitungan bank garansi" className="text-[13px]">2.5 Perhitungan bank garansi</SelectItem>
                                  <SelectItem value="2.6 Menunggu rekomtek" className="text-[13px]">2.6 Menunggu rekomtek</SelectItem>
                                  <SelectItem value="2.7 Izin Kades / Lurah / RTRW" className="text-[13px]">2.7 Izin Kades / Lurah / RTRW</SelectItem>
                                  <SelectItem value="2.8 Izin Developer / Private area" className="text-[13px]">2.8 Izin Developer / Private area</SelectItem>
                                  <SelectItem value="2.9 Pemilik lahan / warga" className="text-[13px]">2.9 Pemilik lahan / warga</SelectItem>
                                  <SelectItem value="2.10 Izin LSM / Preman" className="text-[13px]">2.10 Izin LSM / Preman</SelectItem>
                                  <SelectItem value="2.11 Pengajuan Biaya Comcase" className="text-[13px]">2.11 Pengajuan Biaya Comcase</SelectItem>
                                </SelectGroup>
                                <SelectGroup>
                                  <SelectLabel>Aanwijzing</SelectLabel>
                                  <SelectItem value="1.1 Penunjukan mitra" className="text-[13px]">1.1 Penunjukan mitra</SelectItem>
                                  <SelectItem value="1.2 Penjadwalan aanwijzing" className="text-[13px]">1.2 Penjadwalan aanwijzing</SelectItem>
                                  <SelectItem value="1.3 Review hasil aanwijzing" className="text-[13px]">1.3 Review hasil aanwijzing</SelectItem>
                                  <SelectItem value="1.4 Approval NPD" className="text-[13px]">1.4 Approval NPD</SelectItem>
                                </SelectGroup>
                                <SelectGroup>
                                  <SelectLabel>Instalasi & Fisik</SelectLabel>
                                  <SelectItem value="4.2 Proses Gali/Rojok" className="text-[13px]">4.2 Proses Gali/Rojok</SelectItem>
                                  <SelectItem value="4.4 Proses Penanaman Tiang" className="text-[13px]">4.4 Proses Penanaman Tiang</SelectItem>
                                  <SelectItem value="4.6 Proses Penarikan Kabel FO" className="text-[13px]">4.6 Proses Penarikan Kabel FO</SelectItem>
                                  <SelectItem value="5.1 Selesai Fisik/RFS" className="text-[13px]">5.1 Selesai Fisik/RFS</SelectItem>
                                  <SelectItem value="6.1 OA (On Air)" className="text-[13px]">6.1 OA (On Air)</SelectItem>
                                  <SelectItem value="7.3 Proses uji terima" className="text-[13px]">7.3 Proses uji terima</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-[13px]">Target Selesai Izin</Label>
                            <Input
                              type="date"
                              value={permitFormData.targetDate}
                              onChange={(e) => setPermitFormData({ ...permitFormData, targetDate: e.target.value })}
                              className="text-[13px]"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-[13px]">PIC Pengurusan Izin</Label>
                            <Select
                              value={permitFormData.picName}
                              onValueChange={(val) => setPermitFormData({ ...permitFormData, picName: val })}
                            >
                              <SelectTrigger className="text-[13px] w-full">
                                <SelectValue placeholder="Pilih PIC" />
                              </SelectTrigger>
                              <SelectContent>
                                {masterUsers.map((u) => (
                                  <SelectItem key={u.id} value={u.fullName} className="text-[13px]">
                                    {u.fullName} - {u.role}
                                  </SelectItem>
                                ))}
                                {permitFormData.picName && !masterUsers.some(u => u.fullName === permitFormData.picName) && (
                                  <SelectItem value={permitFormData.picName} className="text-[13px]">
                                    {permitFormData.picName}
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-[13px]">Estimasi Biaya / Retribusi (Rp)</Label>
                            <Input
                              type="number"
                              value={permitFormData.cost}
                              onChange={(e) => setPermitFormData({ ...permitFormData, cost: e.target.value })}
                              placeholder="Contoh: 2500000"
                              className="text-[13px]"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-[13px]">Catatan / Keterangan</Label>
                            <Input
                              value={permitFormData.notes}
                              onChange={(e) => setPermitFormData({ ...permitFormData, notes: e.target.value })}
                              placeholder="Keterangan dinas / berkas..."
                              className="text-[13px]"
                            />
                          </div>

                          <div className="space-y-2 sm:col-span-3 mt-2 border-t pt-3">
                            <Label className="text-[13px] font-semibold">Checklist Tahapan Dokumen PU / Izin Terpilih</Label>
                            <div className="pt-1">
                              <div className="flex flex-wrap items-center gap-4 text-[12px]">
                                {[
                                  { label: 'Surat Masuk', val: '2' },
                                  { label: 'Input OSS', val: '3' },
                                  { label: 'Survey PU', val: '4' },
                                  { label: 'Bank Garansi', val: '5' },
                                  { label: 'Sewa Lahan', val: '6' },
                                  { label: 'Rekomtek', val: '7' },
                                  { label: 'Izin Prinsip', val: '8' },
                                ].map((item) => (
                                  <label key={item.val} className="flex items-center gap-1.5 cursor-pointer">
                                    <input
                                      type="radio"
                                      name="checklist-radio-active"
                                      checked={permitFormData.checklistPU === item.val}
                                      onChange={() => setPermitFormData({ ...permitFormData, checklistPU: item.val })}
                                      className="w-3.5 h-3.5 accent-primary cursor-pointer"
                                    />
                                    <span>{item.label}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <DialogFooter className="gap-2">
                          <Button variant="outline" type="button" onClick={() => setIsPermitDialogOpen(false)} disabled={isSavingPermit} className="text-[13px]">
                            Batal
                          </Button>
                          <Button type="button" onClick={handleSavePermit} disabled={isSavingPermit} className="text-[13px]">
                            {isSavingPermit ? 'Menyimpan ke Database...' : 'Simpan Data'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TabsContent>
                </div>
              </Tabs>
            </TabsContent>
            <TabsContent value="review">
              <div className="space-y-4">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold">DRM Plan (Existing/Planned)</h2>
                  <p className="text-[11pt] text-muted-foreground">Rencana Design Review Meeting dan target penyelesaian pekerjaan.</p>
                </div>
                <CumulativeProgressTable
                  items={designatorItems}
                  onUpdateItems={handleUpdateDesignatorItems}
                  projectName={project?.name}
                  contractNo={project?.contractNo}
                  projectStartDate={project?.startDate}
                  projectEndDate={project?.targetDate}
                  requireReasonForAdd={false}
                  projectId={decodedId}
                />
              </div>
            </TabsContent>
            <TabsContent value="baselines">
              <Card className="border-0 shadow-none ring-1 ring-border/50 p-0 gap-0">
                <CardHeader className="bg-muted/10 p-4 border-b"><CardTitle className="text-lg">Baseline Lock</CardTitle></CardHeader>
                <CardContent className="p-4 flex justify-center py-12">
                  <div className="text-center max-w-sm">
                    <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                      <Lock className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Baseline Belum Dikunci</h3>
                    <p className="text-muted-foreground text-[10pt] mb-6">Kunci BOQ dan rute acuan agar tidak dapat diubah tanpa persetujuan khusus, setelah DRM disetujui.</p>
                    <Button variant="secondary" disabled><Lock className="w-4 h-4 mr-2" />Kunci Baseline</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="implementation" className="mt-0">
          <Tabs value={implTab} onValueChange={(v) => handleSubTabChange('implTab', v)} className="w-full">
            <TabsList className="mb-4 flex-wrap justify-start h-auto gap-2">
              <TabsTrigger value="daily" className="flex-none">Daily Progress</TabsTrigger>
              <TabsTrigger value="progress" className="flex-none">Progress</TabsTrigger>
              <TabsTrigger value="evidence" className="flex-none">Evidence Vault</TabsTrigger>
              <TabsTrigger value="issues" className="flex-none">Issue & Risk Control</TabsTrigger>
            </TabsList>
            <TabsContent value="daily">
              <Card ref={reportRef} className={cn("border-0 shadow-none ring-1 ring-border/50 p-0 gap-0 bg-card", isDark && "dark bg-[#111318] text-foreground")}>
                <CardHeader className="bg-muted/10 p-4 border-b flex flex-row items-center justify-between" data-html2canvas-ignore="false">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 shrink-0">
                      <Image src="/images/mai-logo.png" alt="MAI Logo" fill className="object-contain" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Laporan Harian (Daily Progress)</CardTitle>
                      <CardDescription>Rekapitulasi progress pekerjaan harian dan catatan info lapangan proyek.</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2" data-html2canvas-ignore="true">
                    <Button size="sm" variant="outline" onClick={handleExportImage} disabled={isExporting}>
                      <FileText className="w-4 h-4 mr-2" />
                      {exportText}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-6">
                  {/* Header Info (Data otomatis dari submit implementasi-progress pada tanggal terpilih) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/20 p-4 border rounded-md">
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 items-center gap-2">
                        <Label className="text-[10pt] text-muted-foreground">Nomor Kontrak</Label>
                        <div className="col-span-2 text-[10pt] font-semibold">{project.contractNo || (project as any).noSpk || '-'}</div>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-2">
                        <Label className="text-[10pt] text-muted-foreground">Ruas/Link</Label>
                        <div className="col-span-2 text-[10pt] font-semibold">{project.name || '-'}</div>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-2">
                        <Label className="text-[10pt] text-muted-foreground">Witel</Label>
                        <div className="col-span-2 text-[10pt] font-semibold">{project.location || (project as any).witel || '-'}</div>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-2">
                        <Label className="text-[10pt] text-muted-foreground">Mitra Pelaksana</Label>
                        <div className="col-span-2 text-[10pt] font-semibold">{(project as any).partnerName || 'PT. MITRA AKSES INSANI'}</div>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-2">
                        <Label className="text-[10pt] text-muted-foreground">Jumlah Tenaga Kerja</Label>
                        <div className="col-span-2 text-[10pt] font-semibold">{currentDayFieldInfo.tenagaKerja}</div>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-2">
                        <Label className="text-[10pt] text-muted-foreground">Jumlah Alat Berat</Label>
                        <div className="col-span-2 text-[10pt] font-semibold">{currentDayFieldInfo.alatBerat}</div>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-2">
                        <Label className="text-[10pt] text-muted-foreground">Cuaca / Hujan</Label>
                        <div className="col-span-2 text-[10pt] font-semibold">
                          {currentDayFieldInfo.cuaca && currentDayFieldInfo.cuaca !== '-' ? (
                            <span className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded text-[9pt] font-semibold uppercase",
                              currentDayFieldInfo.cuaca?.toUpperCase() === 'CERAH' && "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400",
                              currentDayFieldInfo.cuaca?.toUpperCase() === 'BERAWAN' && "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400",
                              currentDayFieldInfo.cuaca?.toUpperCase().includes('HUJAN') && "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                            )}>
                              {currentDayFieldInfo.cuaca}
                            </span>
                          ) : (
                            <span className="text-muted-foreground font-normal">-</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 items-center gap-2">
                        <Label className="text-[10pt] text-muted-foreground">Tanggal Update</Label>
                        <div className="col-span-2 flex items-center gap-2">
                          <Input
                            type="date"
                            value={selectedReportDate}
                            onChange={(e) => setSelectedReportDate(e.target.value)}
                            className="h-8 text-[10pt] w-auto min-w-[150px] bg-background font-semibold"
                          />
                          <span className="text-[9pt] text-muted-foreground hidden sm:inline">
                            ({formatDisplayDate(selectedReportDate).fullDate})
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-2">
                        <Label className="text-[10pt] text-muted-foreground">Minggu Ke</Label>
                        <div className="col-span-2 text-[10pt] font-semibold">{weekNumber}</div>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-2">
                        <Label className="text-[10pt] text-muted-foreground">Mulai Kerja</Label>
                        <div className="col-span-2 text-[10pt] font-semibold">{startDateFormatted}</div>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-2">
                        <Label className="text-[10pt] text-muted-foreground">TOC Akhir</Label>
                        <div className="col-span-2 text-[10pt] font-semibold">{targetDateFormatted}</div>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-2">
                        <Label className="text-[10pt] text-muted-foreground">Sisa Hari Kalender</Label>
                        <div className="col-span-2 text-[10pt] font-semibold">{remainingCalendarDays}</div>
                      </div>
                    </div>
                  </div>

                  {/* Table Rekapitulasi dengan Outline yang tegas dan rapi */}
                  <div className="mt-6 w-full rounded-lg border border-border bg-card overflow-hidden shadow-xs">
                    <Table className="text-[10pt] whitespace-nowrap">
                      <TableHeader className="bg-muted/30">
                        <TableRow className="border-b border-border">
                          <TableHead rowSpan={2} className="text-left border-r border-border align-middle font-semibold text-foreground px-4">
                            Lokasi<br />Pekerjaan/Posisi
                          </TableHead>
                          <TableHead colSpan={7} className="text-center border-r border-b border-border font-semibold text-foreground px-4">
                            {project.contractNo || project.name || 'SAT012'}
                          </TableHead>
                          <TableHead rowSpan={2} className="align-middle text-center font-semibold text-foreground bg-muted/40 px-4">
                            Volume<br />Sisa Pekerjaan
                          </TableHead>
                        </TableRow>
                        <TableRow className="border-b border-border">
                          <TableHead className="text-center text-[10pt] border-r border-border px-4">Volume Kemarin</TableHead>
                          <TableHead className="text-center text-[10pt] border-r border-border px-4">Satuan</TableHead>
                          <TableHead className="text-center text-[10pt] border-r border-border bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 px-4">Rencana Hari Ini</TableHead>
                          <TableHead className="text-center text-[10pt] border-r border-border bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 px-4">Volume Hari Ini</TableHead>
                          <TableHead className="text-center text-[10pt] border-r border-border bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 px-4">Satuan</TableHead>
                          <TableHead className="text-center text-[10pt] border-r border-border px-4">Volume Sekarang</TableHead>
                          <TableHead className="text-center text-[10pt] border-r border-border px-4">Volume BOQ</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dailySummaryRows.map((row, idx) => (
                          <TableRow key={idx} className={idx < dailySummaryRows.length - 1 ? "border-b border-border" : ""}>
                            <TableCell className="text-left font-medium border-r border-border px-4 py-3">{row.job}</TableCell>
                            <TableCell className="border-r border-border px-4 py-3 text-center">{row.volumeKemarin}</TableCell>
                            <TableCell className="border-r border-border text-center text-muted-foreground px-4 py-3">{row.unit}</TableCell>
                            <TableCell className="border-r border-border px-4 py-3 bg-red-50/50 dark:bg-red-950/10 text-center font-medium">{row.rencanaHariIni}</TableCell>
                            <TableCell className="border-r border-border px-4 py-3 bg-red-50/50 dark:bg-red-950/10 text-center font-medium">{row.volumeHariIni}</TableCell>
                            <TableCell className="border-r border-border text-center text-muted-foreground bg-red-50/50 dark:bg-red-950/10 px-4 py-3">{row.unit}</TableCell>
                            <TableCell className="border-r border-border px-4 py-3 text-center font-medium">{row.volumeSekarang}</TableCell>
                            <TableCell className="border-r border-border px-4 py-3 text-center">{row.volumeBOQ}</TableCell>
                            <TableCell className="px-4 py-3 bg-muted/20 text-center font-semibold">{row.volumeSisa}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Kendala & Solusi */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between border-t pt-4">
                      <Label className="text-[11pt] font-semibold text-foreground">
                        Catatan Kendala & Solusi ({formatDisplayDate(selectedReportDate).fullDate})
                      </Label>
                    </div>
                    <div className="grid grid-cols-[100px_1fr] items-start gap-2">
                      <Label className="text-[10pt] font-semibold text-muted-foreground mt-1">Kendala</Label>
                      <div className="text-[10pt] leading-relaxed text-foreground whitespace-pre-wrap">{currentDailyNotes.kendala}</div>
                    </div>
                    <div className="grid grid-cols-[100px_1fr] items-start gap-2">
                      <Label className="text-[10pt] font-semibold text-muted-foreground mt-1">Solusi</Label>
                      <div className="text-[10pt] leading-relaxed text-foreground whitespace-pre-wrap">{currentDailyNotes.solusi}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="progress">
              <div className="space-y-6">
                <SCurveChart 
                  data={sCurveData}
                  targetPercent={progressMetrics.targetPercent}
                  actualPercent={progressMetrics.actualPercent}
                  deviation={progressMetrics.deviation}
                />
                
                <div className="mt-8">
                  <h3 className="text-[18px] font-semibold mb-1.5 text-slate-800 dark:text-slate-200">
                    Detail Progress per Designator
                  </h3>
                  <CumulativeProgressTable
                    items={designatorItems}
                    onUpdateItems={handleUpdateDesignatorItems}
                    projectStartDate={project?.startDate}
                    projectEndDate={project?.targetDate}
                    projectId={decodedId}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="evidence">
              <Card className="border-0 shadow-none ring-1 ring-border/50 p-0 gap-0 bg-card">
                <CardHeader className="bg-muted/10 p-4 border-b flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Camera className="w-5 h-5 text-primary" />
                      Evidence Vault (Dokumentasi Lapangan)
                    </CardTitle>
                    <CardDescription>
                      Arsip foto dan bukti dokumentasi fisik pekerjaan (galian, penarikan kabel, tiang OSP, jointing) tersimpan di database server.
                    </CardDescription>
                  </div>
                  <Button size="sm" onClick={handleOpenAddEvidence}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Dokumentasi
                  </Button>
                </CardHeader>
                <CardContent className="p-4">
                  {evidencesList.length === 0 ? (
                    <div className="flex justify-center py-12">
                      <div className="text-center max-w-sm">
                        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                          <Camera className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">Vault Dokumentasi Kosong</h3>
                        <p className="text-muted-foreground text-[10pt] mb-6">
                          Belum ada foto dokumentasi pekerjaan fisik yang tersimpan di database server.
                        </p>
                        <Button onClick={handleOpenAddEvidence}>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Dokumentasi Pertama
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {evidencesList.map((evd) => (
                        <div
                          key={evd.id}
                          className="group relative flex flex-col rounded-lg border border-border bg-card overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <div className="relative w-full h-44 bg-muted/40 overflow-hidden">
                            {evd.imageUrl ? (
                              <img
                                src={evd.imageUrl}
                                alt={evd.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                                <ImageIcon className="w-10 h-10 opacity-40" />
                              </div>
                            )}
                            <div className="absolute top-2 left-2">
                              <Badge className="bg-primary/90 text-primary-foreground text-[10px] font-semibold backdrop-blur-xs">
                                {evd.category}
                              </Badge>
                            </div>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 hover:bg-destructive text-white"
                              onClick={() => handleDeleteEvidence(evd.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>

                          <div className="p-3.5 flex flex-col flex-1 justify-between space-y-2.5">
                            <div>
                              <h4 className="font-semibold text-sm text-foreground line-clamp-1">{evd.title}</h4>
                              {evd.notes && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                                  {evd.notes}
                                </p>
                              )}
                            </div>

                            <div className="pt-2 border-t border-border/60 text-[11px] text-muted-foreground space-y-1">
                              <div className="flex items-center gap-1.5 truncate">
                                <MapPin className="w-3.5 h-3.5 shrink-0 text-primary/70" />
                                <span className="truncate">{evd.location || 'Lokasi tidak dispesifikasikan'}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 shrink-0 text-muted-foreground/70" />
                                  <span>{evd.date ? formatDisplayDate(evd.date).fullDate : '-'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <User className="w-3 h-3 text-muted-foreground/70" />
                                  <span className="truncate max-w-[100px]">{evd.uploader || '-'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Modal Upload Dokumentasi */}
              <Dialog open={isEvidenceDialogOpen} onOpenChange={setIsEvidenceDialogOpen}>
                <DialogContent className="sm:max-w-[550px] p-6">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-bold flex items-center gap-2">
                      <Camera className="w-5 h-5 text-primary" />
                      Upload Dokumentasi Lapangan
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      Unggah foto dokumentasi fisik lapangan beserta catatan teknis. Data tersimpan di database server.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-2">
                    {/* File Upload / Preview */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Foto Dokumentasi</Label>
                      <input
                        type="file"
                        ref={evidenceFileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleEvidenceImageFile}
                      />
                      {evidenceFormData.imageUrl ? (
                        <div className="relative w-full h-36 rounded-md overflow-hidden border">
                          <img
                            src={evidenceFormData.imageUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="absolute bottom-2 right-2 text-xs h-7"
                            onClick={() => evidenceFileInputRef.current?.click()}
                          >
                            Ganti Foto
                          </Button>
                        </div>
                      ) : (
                        <div
                          onClick={() => evidenceFileInputRef.current?.click()}
                          className="w-full h-32 border-2 border-dashed rounded-md flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/30 transition-colors"
                        >
                          <Upload className="w-6 h-6 text-muted-foreground" />
                          <div className="text-xs text-muted-foreground text-center">
                            <span className="font-semibold text-primary">Klik untuk upload foto</span> dari perangkat
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Judul Dokumentasi</Label>
                        <Input
                          value={evidenceFormData.title}
                          onChange={(e) => setEvidenceFormData({ ...evidenceFormData, title: e.target.value })}
                          placeholder="Contoh: Galian Tanah Span MH-02"
                          className="text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Kategori Pekerjaan</Label>
                        <Select
                          value={evidenceFormData.category}
                          onValueChange={(val) => setEvidenceFormData({ ...evidenceFormData, category: val })}
                        >
                          <SelectTrigger className="text-xs w-full">
                            <SelectValue placeholder="Pilih Kategori" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Galian" className="text-xs">Galian</SelectItem>
                            <SelectItem value="Kabel FO" className="text-xs">Kabel FO</SelectItem>
                            <SelectItem value="Tiang OSP" className="text-xs">Tiang OSP</SelectItem>
                            <SelectItem value="Handhole" className="text-xs">Handhole</SelectItem>
                            <SelectItem value="Jointing" className="text-xs">Jointing</SelectItem>
                            <SelectItem value="Lainnya" className="text-xs">Lainnya</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Tanggal Foto</Label>
                        <Input
                          type="date"
                          value={evidenceFormData.date}
                          onChange={(e) => setEvidenceFormData({ ...evidenceFormData, date: e.target.value })}
                          className="text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Lokasi / Titik Span</Label>
                        <Input
                          value={evidenceFormData.location}
                          onChange={(e) => setEvidenceFormData({ ...evidenceFormData, location: e.target.value })}
                          placeholder="Contoh: Jl. Sentul KM 1.5"
                          className="text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Pengunggah / Reporter</Label>
                      <Select
                        value={evidenceFormData.uploader}
                        onValueChange={(val) => setEvidenceFormData({ ...evidenceFormData, uploader: val })}
                      >
                        <SelectTrigger className="text-xs w-full">
                          <SelectValue placeholder="Pilih Pengunggah" />
                        </SelectTrigger>
                        <SelectContent>
                          {masterUsers.map((u) => (
                            <SelectItem key={u.id} value={u.fullName} className="text-xs">
                              {u.fullName} ({u.role})
                            </SelectItem>
                          ))}
                          {evidenceFormData.uploader && !masterUsers.some((u) => u.fullName === evidenceFormData.uploader) && (
                            <SelectItem value={evidenceFormData.uploader} className="text-xs">
                              {evidenceFormData.uploader}
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Catatan / Spesifikasi Teknis</Label>
                      <Textarea
                        value={evidenceFormData.notes}
                        onChange={(e) => setEvidenceFormData({ ...evidenceFormData, notes: e.target.value })}
                        placeholder="Keterangan kondisi hasil pekerjaan lapangan..."
                        className="text-xs min-h-[60px]"
                      />
                    </div>
                  </div>

                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" size="sm" onClick={() => setIsEvidenceDialogOpen(false)} disabled={isSavingEvidence}>
                      Batal
                    </Button>
                    <Button size="sm" onClick={handleSaveEvidence} disabled={isSavingEvidence}>
                      {isSavingEvidence ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        'Simpan Dokumentasi'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            <TabsContent value="issues">
              <Card className="border-0 shadow-none ring-1 ring-border/50 p-0 gap-0 bg-card">
                <CardHeader className="bg-muted/10 p-4 border-b flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      Issue & Risk Control (Kendala & Mitigasi Risiko)
                    </CardTitle>
                    <CardDescription>
                      Pencatatan kendala proyek, tingkat keparahan (severity), status penanganan, serta rencana mitigasi risiko di database server.
                    </CardDescription>
                  </div>
                  <Button size="sm" onClick={handleOpenAddIssue}>
                    <Plus className="w-4 h-4 mr-2" />
                    Laporkan Kendala Baru
                  </Button>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {issuesList.length === 0 ? (
                    <div className="flex justify-center py-12">
                      <div className="text-center max-w-sm">
                        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                          <AlertTriangle className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">Tidak Ada Issue Aktif</h3>
                        <p className="text-muted-foreground text-[10pt] mb-6">
                          Pencatatan kendala (issue log) dan mitigasi risiko proyek saat ini bersih di database server.
                        </p>
                        <Button variant="outline" onClick={handleOpenAddIssue}>
                          <Plus className="w-4 h-4 mr-2" />
                          Laporkan Kendala Baru
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Summary Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 bg-muted/20 border rounded-md">
                          <div className="text-[11px] text-muted-foreground">Total Kendala</div>
                          <div className="text-xl font-bold text-foreground mt-0.5">{issuesList.length}</div>
                        </div>
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-md">
                          <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">Open</div>
                          <div className="text-xl font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                            {issuesList.filter((i) => i.status === 'Open').length}
                          </div>
                        </div>
                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
                          <div className="text-[11px] text-blue-700 dark:text-blue-400 font-medium">In Progress</div>
                          <div className="text-xl font-bold text-blue-700 dark:text-blue-400 mt-0.5">
                            {issuesList.filter((i) => i.status === 'In Progress').length}
                          </div>
                        </div>
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">Resolved</div>
                          <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                            {issuesList.filter((i) => i.status === 'Resolved' || i.status === 'Closed').length}
                          </div>
                        </div>
                      </div>

                      {/* Issues Table */}
                      <div className="w-full rounded-md border border-border overflow-hidden">
                        <Table className="text-[11px] whitespace-nowrap">
                          <TableHeader className="bg-muted/30">
                            <TableRow className="border-b border-border">
                              <TableHead className="px-3 py-2.5 font-semibold">Kendala / Risiko</TableHead>
                              <TableHead className="px-3 py-2.5 font-semibold text-center">Severity</TableHead>
                              <TableHead className="px-3 py-2.5 font-semibold text-center">Status</TableHead>
                              <TableHead className="px-3 py-2.5 font-semibold">Tanggal Lapor</TableHead>
                              <TableHead className="px-3 py-2.5 font-semibold">Target Selesai</TableHead>
                              <TableHead className="px-3 py-2.5 font-semibold">PIC / Reporter</TableHead>
                              <TableHead className="px-3 py-2.5 font-semibold">Rencana Mitigasi & Solusi</TableHead>
                              <TableHead className="px-3 py-2.5 font-semibold text-center">Aksi</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {issuesList.map((issue) => (
                              <TableRow key={issue.id} className="border-b border-border/60 hover:bg-muted/20">
                                <TableCell className="px-3 py-2.5">
                                  <div className="font-semibold text-foreground">{issue.title}</div>
                                  <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                                      {issue.category}
                                    </Badge>
                                    <span className="truncate max-w-[200px]">{issue.description}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="px-3 py-2.5 text-center">
                                  <span
                                    className={cn(
                                      "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold",
                                      issue.severity === 'Critical' && "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
                                      issue.severity === 'High' && "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
                                      issue.severity === 'Medium' && "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
                                      issue.severity === 'Low' && "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                                    )}
                                  >
                                    {issue.severity}
                                  </span>
                                </TableCell>
                                <TableCell className="px-3 py-2.5 text-center">
                                  <span
                                    className={cn(
                                      "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold",
                                      issue.status === 'Open' && "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400",
                                      issue.status === 'In Progress' && "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400",
                                      issue.status === 'Resolved' && "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400",
                                      issue.status === 'Closed' && "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                                    )}
                                  >
                                    {issue.status}
                                  </span>
                                </TableCell>
                                <TableCell className="px-3 py-2.5">
                                  {issue.reportDate ? formatDisplayDate(issue.reportDate).fullDate : '-'}
                                </TableCell>
                                <TableCell className="px-3 py-2.5">
                                  {issue.targetResolutionDate ? formatDisplayDate(issue.targetResolutionDate).fullDate : '-'}
                                </TableCell>
                                <TableCell className="px-3 py-2.5">
                                  <div className="font-medium text-foreground">{issue.pic || '-'}</div>
                                  <div className="text-[10px] text-muted-foreground">Lapor: {issue.reporter || '-'}</div>
                                </TableCell>
                                <TableCell className="px-3 py-2.5 max-w-[250px] whitespace-normal">
                                  <p className="text-[11px] leading-snug line-clamp-2 text-foreground/90">
                                    {issue.mitigationPlan || '-'}
                                  </p>
                                </TableCell>
                                <TableCell className="px-3 py-2.5 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                      onClick={() => handleOpenEditIssue(issue)}
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                      onClick={() => handleDeleteIssue(issue.id)}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Modal Laporkan / Edit Kendala */}
              <Dialog open={isIssueDialogOpen} onOpenChange={setIsIssueDialogOpen}>
                <DialogContent className="sm:max-w-[550px] p-6">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-bold flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      {editingIssueId ? 'Edit Kendala & Mitigasi Risiko' : 'Laporkan Kendala Baru'}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      Catat rincian kendala lapangan, status penanganan, serta langkah mitigasi risiko ke database server.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-3.5 py-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Judul Kendala / Risiko</Label>
                      <Input
                        value={issueFormData.title}
                        onChange={(e) => setIssueFormData({ ...issueFormData, title: e.target.value })}
                        placeholder="Contoh: Izin crossing belum terbit dari Balai PU"
                        className="text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Tingkat Keparahan</Label>
                        <Select
                          value={issueFormData.severity}
                          onValueChange={(val) => setIssueFormData({ ...issueFormData, severity: val })}
                        >
                          <SelectTrigger className="text-xs w-full">
                            <SelectValue placeholder="Severity" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Low" className="text-xs">Low</SelectItem>
                            <SelectItem value="Medium" className="text-xs">Medium</SelectItem>
                            <SelectItem value="High" className="text-xs">High</SelectItem>
                            <SelectItem value="Critical" className="text-xs">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Kategori</Label>
                        <Select
                          value={issueFormData.category}
                          onValueChange={(val) => setIssueFormData({ ...issueFormData, category: val })}
                        >
                          <SelectTrigger className="text-xs w-full">
                            <SelectValue placeholder="Kategori" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Teknis" className="text-xs">Teknis</SelectItem>
                            <SelectItem value="Perizinan" className="text-xs">Perizinan</SelectItem>
                            <SelectItem value="Sosial/Warga" className="text-xs">Sosial/Warga</SelectItem>
                            <SelectItem value="Cuaca" className="text-xs">Cuaca</SelectItem>
                            <SelectItem value="Material" className="text-xs">Material</SelectItem>
                            <SelectItem value="Lainnya" className="text-xs">Lainnya</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Status</Label>
                        <Select
                          value={issueFormData.status}
                          onValueChange={(val) => setIssueFormData({ ...issueFormData, status: val })}
                        >
                          <SelectTrigger className="text-xs w-full">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Open" className="text-xs">Open</SelectItem>
                            <SelectItem value="In Progress" className="text-xs">In Progress</SelectItem>
                            <SelectItem value="Resolved" className="text-xs">Resolved</SelectItem>
                            <SelectItem value="Closed" className="text-xs">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Tanggal Lapor</Label>
                        <Input
                          type="date"
                          value={issueFormData.reportDate}
                          onChange={(e) => setIssueFormData({ ...issueFormData, reportDate: e.target.value })}
                          className="text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Target Selesai / Mitigasi</Label>
                        <Input
                          type="date"
                          value={issueFormData.targetResolutionDate}
                          onChange={(e) => setIssueFormData({ ...issueFormData, targetResolutionDate: e.target.value })}
                          className="text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Pelapor (Reporter)</Label>
                        <Input
                          value={issueFormData.reporter}
                          onChange={(e) => setIssueFormData({ ...issueFormData, reporter: e.target.value })}
                          placeholder="Nama pelapor kendala"
                          className="text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">PIC Penanggung Jawab Solusi</Label>
                        <Select
                          value={issueFormData.pic}
                          onValueChange={(val) => setIssueFormData({ ...issueFormData, pic: val })}
                        >
                          <SelectTrigger className="text-xs w-full">
                            <SelectValue placeholder="Pilih PIC Solusi" />
                          </SelectTrigger>
                          <SelectContent>
                            {masterUsers.map((u) => (
                              <SelectItem key={u.id} value={u.fullName} className="text-xs">
                                {u.fullName} ({u.role})
                              </SelectItem>
                            ))}
                            {issueFormData.pic && !masterUsers.some((u) => u.fullName === issueFormData.pic) && (
                              <SelectItem value={issueFormData.pic} className="text-xs">
                                {issueFormData.pic}
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Deskripsi Kendala Lapangan</Label>
                      <Textarea
                        value={issueFormData.description}
                        onChange={(e) => setIssueFormData({ ...issueFormData, description: e.target.value })}
                        placeholder="Uraikan detail masalah atau rintangan yang terjadi di lapangan..."
                        className="text-xs min-h-[60px]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Rencana Solusi / Mitigasi Risiko</Label>
                      <Textarea
                        value={issueFormData.mitigationPlan}
                        onChange={(e) => setIssueFormData({ ...issueFormData, mitigationPlan: e.target.value })}
                        placeholder="Langkah antisipasi, mitigasi atau tindakan penyelesaian yang akan diambil..."
                        className="text-xs min-h-[60px]"
                      />
                    </div>
                  </div>

                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" size="sm" onClick={() => setIsIssueDialogOpen(false)} disabled={isSavingIssue}>
                      Batal
                    </Button>
                    <Button size="sm" onClick={handleSaveIssue} disabled={isSavingIssue}>
                      {isSavingIssue ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        editingIssueId ? 'Perbarui Kendala' : 'Simpan Kendala'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="commissioning" className="mt-0">
          <Tabs value={commTab} onValueChange={(v) => handleSubTabChange('commTab', v)} className="w-full">
            <TabsList className="mb-4 flex-wrap justify-start h-auto gap-2">
              <TabsTrigger value="tests" className="flex-none">OTDR & Power Test Results</TabsTrigger>
              <TabsTrigger value="defects" className="flex-none">Defect & Punch List</TabsTrigger>
              <TabsTrigger value="acceptance" className="flex-none">BA Acceptance (BA UT)</TabsTrigger>
            </TabsList>
            {/* SUBTAB 1: OTDR & POWER TEST RESULTS */}
            <TabsContent value="tests">
              <Card className="border-0 shadow-none ring-1 ring-border/50 p-0 gap-0 bg-card">
                <CardHeader className="bg-muted/10 p-4 border-b flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-500" />
                      Hasil Pengukuran OTDR & Continuity Core
                    </CardTitle>
                    <CardDescription>
                      Pencatatan trace loss fiber optik, panjang kabel, dan status kelayakan (PASS/FAIL) tersimpan di database server.
                    </CardDescription>
                  </div>
                  <Button size="sm" onClick={handleOpenAddOtdr}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Hasil Test OTDR
                  </Button>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {otdrTestsList.length === 0 ? (
                    <div className="flex justify-center py-12">
                      <div className="text-center max-w-sm">
                        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                          <Zap className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">Hasil Test Belum Tersedia</h3>
                        <p className="text-muted-foreground text-[10pt] mb-6">
                          Belum ada data pengukuran OTDR atau redaman kabel optik yang tersimpan di database server.
                        </p>
                        <Button onClick={handleOpenAddOtdr}>
                          <Plus className="w-4 h-4 mr-2" />
                          Tambah Hasil Test OTDR
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Metric Summary Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 bg-muted/20 border rounded-md">
                          <div className="text-[11px] text-muted-foreground">Total Pengukuran</div>
                          <div className="text-xl font-bold text-foreground mt-0.5">{otdrTestsList.length}</div>
                        </div>
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">PASS (Memenuhi Syarat)</div>
                          <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                            {otdrTestsList.filter((t) => t.result === 'PASS').length}
                          </div>
                        </div>
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                          <div className="text-[11px] text-red-700 dark:text-red-400 font-medium">FAIL (Perlu Perbaikan)</div>
                          <div className="text-xl font-bold text-red-700 dark:text-red-400 mt-0.5">
                            {otdrTestsList.filter((t) => t.result === 'FAIL').length}
                          </div>
                        </div>
                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
                          <div className="text-[11px] text-blue-700 dark:text-blue-400 font-medium">Rata-rata Total Loss</div>
                          <div className="text-xl font-bold text-blue-700 dark:text-blue-400 mt-0.5">
                            {(
                              otdrTestsList.reduce((acc, t) => acc + (Number(t.totalLossDb) || 0), 0) /
                              (otdrTestsList.length || 1)
                            ).toFixed(2)}{' '}
                            dB
                          </div>
                        </div>
                      </div>

                      {/* OTDR Table */}
                      <div className="w-full rounded-md border border-border overflow-hidden">
                        <Table className="text-[11px] whitespace-nowrap">
                          <TableHeader className="bg-muted/30">
                            <TableRow className="border-b border-border">
                              <TableHead className="px-3 py-2.5 font-semibold">Test ID & Core</TableHead>
                              <TableHead className="px-3 py-2.5 font-semibold text-center">Arah</TableHead>
                              <TableHead className="px-3 py-2.5 font-semibold text-right">Jarak (KM)</TableHead>
                              <TableHead className="px-3 py-2.5 font-semibold text-right">Total Loss (dB)</TableHead>
                              <TableHead className="px-3 py-2.5 font-semibold text-right">Event Loss (dB)</TableHead>
                              <TableHead className="px-3 py-2.5 font-semibold text-center">Panjang Gelombang</TableHead>
                              <TableHead className="px-3 py-2.5 font-semibold text-center">Hasil</TableHead>
                              <TableHead className="px-3 py-2.5 font-semibold">Penguji & Tanggal</TableHead>
                              <TableHead className="px-3 py-2.5 font-semibold">Catatan / File</TableHead>
                              <TableHead className="px-3 py-2.5 font-semibold text-center">Aksi</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {otdrTestsList.map((test) => (
                              <TableRow key={test.id} className="border-b border-border/60 hover:bg-muted/20">
                                <TableCell className="px-3 py-2.5">
                                  <div className="font-semibold text-foreground">{test.fiberCore}</div>
                                  <div className="text-[10px] text-muted-foreground">{test.testId}</div>
                                </TableCell>
                                <TableCell className="px-3 py-2.5 text-center font-mono text-[10px]">
                                  {test.direction || 'A -> B'}
                                </TableCell>
                                <TableCell className="px-3 py-2.5 text-right font-medium">
                                  {test.distanceKm ? `${test.distanceKm} km` : '-'}
                                </TableCell>
                                <TableCell className="px-3 py-2.5 text-right font-medium">
                                  {test.totalLossDb ? `${test.totalLossDb} dB` : '-'}
                                </TableCell>
                                <TableCell className="px-3 py-2.5 text-right">
                                  {test.eventLossDb ? `${test.eventLossDb} dB` : '-'}
                                </TableCell>
                                <TableCell className="px-3 py-2.5 text-center text-muted-foreground">
                                  {test.wavelength || '1310 nm'}
                                </TableCell>
                                <TableCell className="px-3 py-2.5 text-center">
                                  <span
                                    className={cn(
                                      "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold",
                                      test.result === 'PASS'
                                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                                        : "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400"
                                    )}
                                  >
                                    {test.result === 'PASS' ? (
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                    ) : (
                                      <XCircle className="w-3 h-3 mr-1" />
                                    )}
                                    {test.result}
                                  </span>
                                </TableCell>
                                <TableCell className="px-3 py-2.5">
                                  <div className="font-medium text-foreground">{test.testedBy || '-'}</div>
                                  <div className="text-[10px] text-muted-foreground">
                                    {test.testDate ? formatDisplayDate(test.testDate).fullDate : '-'}
                                  </div>
                                </TableCell>
                                <TableCell className="px-3 py-2.5 max-w-[200px] whitespace-normal">
                                  <p className="text-[10px] text-foreground/80 line-clamp-1">{test.notes || '-'}</p>
                                  {test.fileName && (
                                    <span className="text-[9px] text-primary flex items-center gap-1 mt-0.5">
                                      <FileText className="w-3 h-3" /> {test.fileName}
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell className="px-3 py-2.5 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                      onClick={() => handleOpenEditOtdr(test)}
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                      onClick={() => handleDeleteOtdr(test.id)}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Modal Form OTDR */}
              <Dialog open={isOtdrDialogOpen} onOpenChange={setIsOtdrDialogOpen}>
                <DialogContent className="sm:max-w-[550px] p-6">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-bold flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-500" />
                      {editingOtdrId ? 'Edit Hasil Test OTDR' : 'Tambah Hasil Test OTDR'}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      Input hasil pengukuran trace loss, panjang kabel optik, dan verifikasi continuity di database server.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-3.5 py-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Test ID</Label>
                        <Input
                          value={otdrFormData.testId}
                          onChange={(e) => setOtdrFormData({ ...otdrFormData, testId: e.target.value })}
                          placeholder="OTDR-001"
                          className="text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Fiber Core / Identifier</Label>
                        <Input
                          value={otdrFormData.fiberCore}
                          onChange={(e) => setOtdrFormData({ ...otdrFormData, fiberCore: e.target.value })}
                          placeholder="Core 01 (SM)"
                          className="text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Arah (Direction)</Label>
                        <Select
                          value={otdrFormData.direction}
                          onValueChange={(val) => setOtdrFormData({ ...otdrFormData, direction: val })}
                        >
                          <SelectTrigger className="text-xs w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A -> B" className="text-xs">A -&gt; B (Main)</SelectItem>
                            <SelectItem value="B -> A" className="text-xs">B -&gt; A (Reverse)</SelectItem>
                            <SelectItem value="Bi-Directional" className="text-xs">Bi-Directional</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Jarak Kabel (KM)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={otdrFormData.distanceKm}
                          onChange={(e) => setOtdrFormData({ ...otdrFormData, distanceKm: parseFloat(e.target.value) || 0 })}
                          className="text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Panjang Gelombang</Label>
                        <Select
                          value={otdrFormData.wavelength}
                          onValueChange={(val) => setOtdrFormData({ ...otdrFormData, wavelength: val })}
                        >
                          <SelectTrigger className="text-xs w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1310 nm" className="text-xs">1310 nm</SelectItem>
                            <SelectItem value="1550 nm" className="text-xs">1550 nm</SelectItem>
                            <SelectItem value="1625 nm" className="text-xs">1625 nm</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Total Loss (dB)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={otdrFormData.totalLossDb}
                          onChange={(e) => setOtdrFormData({ ...otdrFormData, totalLossDb: parseFloat(e.target.value) || 0 })}
                          className="text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Event Loss (dB)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={otdrFormData.eventLossDb}
                          onChange={(e) => setOtdrFormData({ ...otdrFormData, eventLossDb: parseFloat(e.target.value) || 0 })}
                          className="text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Hasil Status</Label>
                        <Select
                          value={otdrFormData.result}
                          onValueChange={(val) => setOtdrFormData({ ...otdrFormData, result: val })}
                        >
                          <SelectTrigger className="text-xs w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PASS" className="text-xs text-emerald-600 font-semibold">PASS (Lolos)</SelectItem>
                            <SelectItem value="FAIL" className="text-xs text-red-600 font-semibold">FAIL (Gagal)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Teknisi Penguji</Label>
                        <Select
                          value={otdrFormData.testedBy}
                          onValueChange={(val) => setOtdrFormData({ ...otdrFormData, testedBy: val })}
                        >
                          <SelectTrigger className="text-xs w-full">
                            <SelectValue placeholder="Pilih Teknisi" />
                          </SelectTrigger>
                          <SelectContent>
                            {masterUsers.map((u) => (
                              <SelectItem key={u.id} value={u.fullName} className="text-xs">
                                {u.fullName} ({u.role})
                              </SelectItem>
                            ))}
                            {otdrFormData.testedBy && !masterUsers.some((u) => u.fullName === otdrFormData.testedBy) && (
                              <SelectItem value={otdrFormData.testedBy} className="text-xs">
                                {otdrFormData.testedBy}
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Tanggal Pengukuran</Label>
                        <Input
                          type="date"
                          value={otdrFormData.testDate}
                          onChange={(e) => setOtdrFormData({ ...otdrFormData, testDate: e.target.value })}
                          className="text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Lampiran File Kurva / Laporan (.sor / .pdf)</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          ref={otdrFileInputRef}
                          className="hidden"
                          onChange={handleOtdrFileChange}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => otdrFileInputRef.current?.click()}
                        >
                          <Upload className="w-3.5 h-3.5 mr-1.5" />
                          Pilih File Laporan
                        </Button>
                        <span className="text-xs text-muted-foreground truncate">
                          {otdrFormData.fileName || 'Belum ada file dipilih'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Catatan Pengukuran</Label>
                      <Textarea
                        value={otdrFormData.notes}
                        onChange={(e) => setOtdrFormData({ ...otdrFormData, notes: e.target.value })}
                        placeholder="Catatan kondisi redaman, sambungan closure, atau alasan fail..."
                        className="text-xs min-h-[50px]"
                      />
                    </div>
                  </div>

                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" size="sm" onClick={() => setIsOtdrDialogOpen(false)} disabled={isSavingOtdr}>
                      Batal
                    </Button>
                    <Button size="sm" onClick={handleSaveOtdr} disabled={isSavingOtdr}>
                      {isSavingOtdr ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        editingOtdrId ? 'Perbarui Hasil Test' : 'Simpan Hasil Test'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* SUBTAB 2: DEFECT & PUNCH LIST */}
            <TabsContent value="defects">
              <Card className="border-0 shadow-none ring-1 ring-border/50 p-0 gap-0 bg-card">
                <CardHeader className="bg-muted/10 p-4 border-b flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-primary" />
                      Defect &amp; Punch List Management
                    </CardTitle>
                    <CardDescription>
                      Daftar temuan cacat/perbaikan minor dan mayor lapangan sebelum proses penandatanganan BA UT.
                    </CardDescription>
                  </div>
                  <Button size="sm" onClick={handleOpenAddDefect}>
                    <Plus className="w-4 h-4 mr-2" />
                    Catat Defect Baru
                  </Button>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {defectsList.length === 0 ? (
                    <div className="flex justify-center py-12">
                      <div className="text-center max-w-sm">
                        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                          <Wrench className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">Tidak Ada Defect</h3>
                        <p className="text-muted-foreground text-[10pt] mb-6">
                          Daftar perbaikan minor (punch list) saat ini bersih di database server.
                        </p>
                        <Button variant="outline" onClick={handleOpenAddDefect}>
                          <Plus className="w-4 h-4 mr-2" />
                          Catat Defect Baru
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Metric Summary Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 bg-muted/20 border rounded-md">
                          <div className="text-[11px] text-muted-foreground">Total Defect</div>
                          <div className="text-xl font-bold text-foreground mt-0.5">{defectsList.length}</div>
                        </div>
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-md">
                          <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">Open</div>
                          <div className="text-xl font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                            {defectsList.filter((d) => d.status === 'Open').length}
                          </div>
                        </div>
                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
                          <div className="text-[11px] text-blue-700 dark:text-blue-400 font-medium">In Correction</div>
                          <div className="text-xl font-bold text-blue-700 dark:text-blue-400 mt-0.5">
                            {defectsList.filter((d) => d.status === 'In Correction').length}
                          </div>
                        </div>
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">Closed (Clear)</div>
                          <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                            {defectsList.filter((d) => d.status === 'Closed').length}
                          </div>
                        </div>
                      </div>

                      {/* Defects Table */}
                      <div className="w-full rounded-md border border-border overflow-hidden">
                        <Table className="text-[11px] whitespace-nowrap">
                          <TableHeader className="bg-muted/30">
                            <TableRow className="border-b border-border">
                              <TableHead className="px-3 py-2.5 font-semibold">Punch ID &amp; Temuan</TableHead>
                              <TableHead className="px-3 py-2.5 font-semibold">Lokasi Temuan</TableHead>
                              <TableHead className="px-3 py-2.5 font-semibold text-center">Severity</TableHead>
                              <TableHead className="px-3 py-2.5 font-semibold text-center">Status</TableHead>
                              <TableHead className="px-3 py-2.5 font-semibold">PIC Penanggung Jawab</TableHead>
                              <TableHead className="px-3 py-2.5 font-semibold">Target Selesai</TableHead>
                              <TableHead className="px-3 py-2.5 font-semibold">Catatan Solusi</TableHead>
                              <TableHead className="px-3 py-2.5 font-semibold text-center">Aksi</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {defectsList.map((defect) => (
                              <TableRow key={defect.id} className="border-b border-border/60 hover:bg-muted/20">
                                <TableCell className="px-3 py-2.5">
                                  <div className="font-semibold text-foreground">{defect.punchId}</div>
                                  <div className="text-[10px] text-muted-foreground max-w-[220px] truncate">
                                    {defect.description}
                                  </div>
                                </TableCell>
                                <TableCell className="px-3 py-2.5">
                                  <span className="text-foreground/90">{defect.location || '-'}</span>
                                </TableCell>
                                <TableCell className="px-3 py-2.5 text-center">
                                  <span
                                    className={cn(
                                      "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold",
                                      defect.severity === 'Critical' && "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
                                      defect.severity === 'Major' && "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
                                      defect.severity === 'Minor' && "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                                    )}
                                  >
                                    {defect.severity}
                                  </span>
                                </TableCell>
                                <TableCell className="px-3 py-2.5 text-center">
                                  <span
                                    className={cn(
                                      "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold",
                                      defect.status === 'Open' && "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400",
                                      defect.status === 'In Correction' && "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400",
                                      defect.status === 'Closed' && "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                                    )}
                                  >
                                    {defect.status}
                                  </span>
                                </TableCell>
                                <TableCell className="px-3 py-2.5 font-medium">
                                  {defect.pic || '-'}
                                </TableCell>
                                <TableCell className="px-3 py-2.5">
                                  {defect.dueDate ? formatDisplayDate(defect.dueDate).fullDate : '-'}
                                </TableCell>
                                <TableCell className="px-3 py-2.5 max-w-[200px] whitespace-normal">
                                  <p className="text-[10px] text-foreground/80 line-clamp-1">
                                    {defect.resolutionNotes || '-'}
                                  </p>
                                </TableCell>
                                <TableCell className="px-3 py-2.5 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                      onClick={() => handleOpenEditDefect(defect)}
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                      onClick={() => handleDeleteDefect(defect.id)}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Modal Form Defect */}
              <Dialog open={isDefectDialogOpen} onOpenChange={setIsDefectDialogOpen}>
                <DialogContent className="sm:max-w-[550px] p-6">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-bold flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-primary" />
                      {editingDefectId ? 'Edit Punch List Defect' : 'Catat Defect Baru'}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      Pencatatan temuan cacat fisik / pengukuran dan rencana perbaikan ke database server.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-3.5 py-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Punch ID</Label>
                        <Input
                          value={defectFormData.punchId}
                          onChange={(e) => setDefectFormData({ ...defectFormData, punchId: e.target.value })}
                          placeholder="PUNCH-01"
                          className="text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Tingkat Keparahan (Severity)</Label>
                        <Select
                          value={defectFormData.severity}
                          onValueChange={(val) => setDefectFormData({ ...defectFormData, severity: val })}
                        >
                          <SelectTrigger className="text-xs w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Minor" className="text-xs text-blue-600 font-medium">Minor (Polesan/Labeling)</SelectItem>
                            <SelectItem value="Major" className="text-xs text-orange-600 font-medium">Major (Bending/Splicing Loss)</SelectItem>
                            <SelectItem value="Critical" className="text-xs text-red-600 font-medium">Critical (Kabel Putus/Core Rusak)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Deskripsi Temuan Masalah</Label>
                      <Textarea
                        value={defectFormData.description}
                        onChange={(e) => setDefectFormData({ ...defectFormData, description: e.target.value })}
                        placeholder="Contoh: Splicing loss pada Core 03 melebihi ambang batas 0.1 dB..."
                        className="text-xs min-h-[60px]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Lokasi Temuan</Label>
                        <Input
                          value={defectFormData.location}
                          onChange={(e) => setDefectFormData({ ...defectFormData, location: e.target.value })}
                          placeholder="Contoh: Closure C-02 KM 22.4"
                          className="text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Status Penanganan</Label>
                        <Select
                          value={defectFormData.status}
                          onValueChange={(val) => setDefectFormData({ ...defectFormData, status: val })}
                        >
                          <SelectTrigger className="text-xs w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Open" className="text-xs">Open</SelectItem>
                            <SelectItem value="In Correction" className="text-xs">In Correction</SelectItem>
                            <SelectItem value="Closed" className="text-xs">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">PIC Penanggung Jawab</Label>
                        <Select
                          value={defectFormData.pic}
                          onValueChange={(val) => setDefectFormData({ ...defectFormData, pic: val })}
                        >
                          <SelectTrigger className="text-xs w-full">
                            <SelectValue placeholder="Pilih PIC" />
                          </SelectTrigger>
                          <SelectContent>
                            {masterUsers.map((u) => (
                              <SelectItem key={u.id} value={u.fullName} className="text-xs">
                                {u.fullName} ({u.role})
                              </SelectItem>
                            ))}
                            {defectFormData.pic && !masterUsers.some((u) => u.fullName === defectFormData.pic) && (
                              <SelectItem value={defectFormData.pic} className="text-xs">
                                {defectFormData.pic}
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Target Selesai (Due Date)</Label>
                        <Input
                          type="date"
                          value={defectFormData.dueDate}
                          onChange={(e) => setDefectFormData({ ...defectFormData, dueDate: e.target.value })}
                          className="text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Rencana Tindakan / Catatan Perbaikan</Label>
                      <Textarea
                        value={defectFormData.resolutionNotes}
                        onChange={(e) => setDefectFormData({ ...defectFormData, resolutionNotes: e.target.value })}
                        placeholder="Langkah teknis perbaikan yang telah / akan dilaksanakan..."
                        className="text-xs min-h-[50px]"
                      />
                    </div>
                  </div>

                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" size="sm" onClick={() => setIsDefectDialogOpen(false)} disabled={isSavingDefect}>
                      Batal
                    </Button>
                    <Button size="sm" onClick={handleSaveDefect} disabled={isSavingDefect}>
                      {isSavingDefect ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        editingDefectId ? 'Perbarui Defect' : 'Simpan Defect'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* SUBTAB 3: BA ACCEPTANCE (BA UT) */}
            <TabsContent value="acceptance">
              <Card className="border-0 shadow-none ring-1 ring-border/50 p-0 gap-0 bg-card">
                <CardHeader className="bg-muted/10 p-4 border-b flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileCheck2 className="w-5 h-5 text-primary" />
                      Berita Acara Uji Terima (BA UT / BAUT)
                    </CardTitle>
                    <CardDescription>
                      Penerbitan, peninjauan dan persetujuan Berita Acara Uji Terima resmi bersama klien / bowheer di database server.
                    </CardDescription>
                  </div>
                  <Button size="sm" onClick={handleOpenAddBaut}>
                    <Plus className="w-4 h-4 mr-2" />
                    Buat Draft BA UT
                  </Button>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {bautsList.length === 0 ? (
                    <div className="flex justify-center py-12">
                      <div className="text-center max-w-sm">
                        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                          <FileCheck2 className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">BA UT Belum Dibuat</h3>
                        <p className="text-muted-foreground text-[10pt] mb-6">
                          Mulai proses persetujuan Berita Acara Uji Terima secara digital yang tersimpan ke database server.
                        </p>
                        <Button onClick={handleOpenAddBaut}>
                          <Plus className="w-4 h-4 mr-2" />
                          Buat Draft BA UT
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Metric Summary Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 bg-muted/20 border rounded-md">
                          <div className="text-[11px] text-muted-foreground">Total BA UT</div>
                          <div className="text-xl font-bold text-foreground mt-0.5">{bautsList.length}</div>
                        </div>
                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
                          <div className="text-[11px] text-blue-700 dark:text-blue-400 font-medium">Ready for Sign-off</div>
                          <div className="text-xl font-bold text-blue-700 dark:text-blue-400 mt-0.5">
                            {bautsList.filter((b) => b.status === 'Ready for Sign-off').length}
                          </div>
                        </div>
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">Signed &amp; Approved</div>
                          <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                            {bautsList.filter((b) => b.status === 'Signed & Approved').length}
                          </div>
                        </div>
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-md">
                          <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">Draft / In Review</div>
                          <div className="text-xl font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                            {bautsList.filter((b) => b.status === 'Draft' || b.status === 'Under Review').length}
                          </div>
                        </div>
                      </div>

                      {/* BAUT Table */}
                      <div className="w-full rounded-md border border-border overflow-hidden">
                        <Table className="text-[11px] whitespace-nowrap">
                          <TableHeader className="bg-muted/30">
                            <TableRow className="border-b border-border">
                              <TableHead className="px-3 py-2.5 font-semibold">Nomor BAUT &amp; Judul</TableHead>
                              <TableHead className="px-3 py-2.5 font-semibold">Klien / Bowheer</TableHead>
                              <TableHead className="px-3 py-2.5 font-semibold">Tanggal BAUT</TableHead>
                              <TableHead className="px-3 py-2.5 font-semibold text-center">Status</TableHead>
                              <TableHead className="px-3 py-2.5 font-semibold">Penandatangan</TableHead>
                              <TableHead className="px-3 py-2.5 font-semibold">Cakupan Pekerjaan &amp; Dokumen</TableHead>
                              <TableHead className="px-3 py-2.5 font-semibold text-center">Aksi</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {bautsList.map((baut) => (
                              <TableRow key={baut.id} className="border-b border-border/60 hover:bg-muted/20">
                                <TableCell className="px-3 py-2.5">
                                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                                    <FileCheck2 className="w-3.5 h-3.5 text-primary" />
                                    {baut.bautNumber}
                                  </div>
                                  <div className="text-[10px] text-muted-foreground max-w-[240px] truncate">
                                    {baut.title}
                                  </div>
                                </TableCell>
                                <TableCell className="px-3 py-2.5 font-medium">
                                  {baut.clientName || '-'}
                                </TableCell>
                                <TableCell className="px-3 py-2.5">
                                  {baut.date ? formatDisplayDate(baut.date).fullDate : '-'}
                                </TableCell>
                                <TableCell className="px-3 py-2.5 text-center">
                                  <span
                                    className={cn(
                                      "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold",
                                      baut.status === 'Draft' && "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
                                      baut.status === 'Under Review' && "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400",
                                      baut.status === 'Ready for Sign-off' && "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400",
                                      baut.status === 'Signed & Approved' && "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                                    )}
                                  >
                                    {baut.status}
                                  </span>
                                </TableCell>
                                <TableCell className="px-3 py-2.5">
                                  <div className="text-[10px] text-foreground font-medium">
                                    Vendor: {baut.signatoryVendor || '-'}
                                  </div>
                                  <div className="text-[10px] text-muted-foreground">
                                    Klien: {baut.signatoryClient || '-'}
                                  </div>
                                </TableCell>
                                <TableCell className="px-3 py-2.5 max-w-[200px] whitespace-normal">
                                  <p className="text-[10px] text-foreground/80 line-clamp-1">{baut.scopeCovered || '-'}</p>
                                  {baut.documentName && (
                                    <span className="text-[9px] text-primary flex items-center gap-1 mt-0.5">
                                      <FileText className="w-3 h-3" /> {baut.documentName}
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell className="px-3 py-2.5 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                      onClick={() => handleOpenEditBaut(baut)}
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                      onClick={() => handleDeleteBaut(baut.id)}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Modal Form BA UT */}
              <Dialog open={isBautDialogOpen} onOpenChange={setIsBautDialogOpen}>
                <DialogContent className="sm:max-w-[550px] p-6">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-bold flex items-center gap-2">
                      <FileCheck2 className="w-5 h-5 text-primary" />
                      {editingBautId ? 'Edit Draft BA UT' : 'Buat Draft Berita Acara Uji Terima (BA UT)'}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      Formulir resmi BA UT untuk pengetesan fisik &amp; continuity optik tersimpan di database server.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-3.5 py-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Nomor BAUT</Label>
                        <Input
                          value={bautFormData.bautNumber}
                          onChange={(e) => setBautFormData({ ...bautFormData, bautNumber: e.target.value })}
                          placeholder="BAUT-2026-089"
                          className="text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Tanggal Berita Acara</Label>
                        <Input
                          type="date"
                          value={bautFormData.date}
                          onChange={(e) => setBautFormData({ ...bautFormData, date: e.target.value })}
                          className="text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Judul Berita Acara</Label>
                      <Input
                        value={bautFormData.title}
                        onChange={(e) => setBautFormData({ ...bautFormData, title: e.target.value })}
                        placeholder="Contoh: Berita Acara Uji Terima (BA UT) Fisik & Continuity"
                        className="text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Nama Klien / Bowheer</Label>
                        <Input
                          value={bautFormData.clientName}
                          onChange={(e) => setBautFormData({ ...bautFormData, clientName: e.target.value })}
                          placeholder="PT Telkom Indonesia"
                          className="text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Status Persetujuan</Label>
                        <Select
                          value={bautFormData.status}
                          onValueChange={(val) => setBautFormData({ ...bautFormData, status: val })}
                        >
                          <SelectTrigger className="text-xs w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Draft" className="text-xs">Draft</SelectItem>
                            <SelectItem value="Under Review" className="text-xs">Under Review</SelectItem>
                            <SelectItem value="Ready for Sign-off" className="text-xs">Ready for Sign-off</SelectItem>
                            <SelectItem value="Signed & Approved" className="text-xs">Signed & Approved</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Penandatangan Vendor (Mitra)</Label>
                        <Select
                          value={bautFormData.signatoryVendor}
                          onValueChange={(val) => setBautFormData({ ...bautFormData, signatoryVendor: val })}
                        >
                          <SelectTrigger className="text-xs w-full">
                            <SelectValue placeholder="Pilih Vendor Signatory" />
                          </SelectTrigger>
                          <SelectContent>
                            {masterUsers.map((u) => (
                              <SelectItem key={u.id} value={u.fullName} className="text-xs">
                                {u.fullName} ({u.role})
                              </SelectItem>
                            ))}
                            {bautFormData.signatoryVendor && !masterUsers.some((u) => u.fullName === bautFormData.signatoryVendor) && (
                              <SelectItem value={bautFormData.signatoryVendor} className="text-xs">
                                {bautFormData.signatoryVendor}
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Penandatangan Klien (Customer)</Label>
                        <Input
                          value={bautFormData.signatoryClient}
                          onChange={(e) => setBautFormData({ ...bautFormData, signatoryClient: e.target.value })}
                          placeholder="Nama PIC Klien / Witel"
                          className="text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Cakupan Pekerjaan (Scope Covered)</Label>
                      <Textarea
                        value={bautFormData.scopeCovered}
                        onChange={(e) => setBautFormData({ ...bautFormData, scopeCovered: e.target.value })}
                        placeholder="Uraikan ruas kabel, galian, dan terminasi yang diuji terima..."
                        className="text-xs min-h-[50px]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Lampiran Dokumen Scan BAUT (.pdf / .docx)</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          ref={bautFileInputRef}
                          className="hidden"
                          onChange={handleBautFileChange}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => bautFileInputRef.current?.click()}
                        >
                          <Upload className="w-3.5 h-3.5 mr-1.5" />
                          Pilih Dokumen BAUT
                        </Button>
                        <span className="text-xs text-muted-foreground truncate">
                          {bautFormData.documentName || 'Belum ada dokumen dipilih'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Catatan Tambahan</Label>
                      <Textarea
                        value={bautFormData.notes}
                        onChange={(e) => setBautFormData({ ...bautFormData, notes: e.target.value })}
                        placeholder="Keterangan berita acara, nomor registrasi, dll..."
                        className="text-xs min-h-[45px]"
                      />
                    </div>
                  </div>

                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" size="sm" onClick={() => setIsBautDialogOpen(false)} disabled={isSavingBaut}>
                      Batal
                    </Button>
                    <Button size="sm" onClick={handleSaveBaut} disabled={isSavingBaut}>
                      {isSavingBaut ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        editingBautId ? 'Perbarui BA UT' : 'Simpan Draft BA UT'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="closing" className="mt-0">
          <Tabs value={closeTab} onValueChange={(v) => handleSubTabChange('closeTab', v)} className="w-full">
            <TabsList className="mb-4 flex-wrap justify-start h-auto gap-2">
              <TabsTrigger value="docs" className="flex-none">As-Built Documentation</TabsTrigger>
              <TabsTrigger value="assets" className="flex-none">Asset Inventory Record</TabsTrigger>
              <TabsTrigger value="profitability" className="flex-none">Final Profitability Report</TabsTrigger>
            </TabsList>
            {/* SUBTAB 1: AS-BUILT DOCUMENTATION */}
            <TabsContent value="docs">
              <Card className="border-0 shadow-none ring-1 ring-border/50 p-0 gap-0 bg-card">
                <CardHeader className="bg-muted/10 p-4 border-b flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Book className="w-5 h-5 text-primary" />
                      As-Built Documentation Repository
                    </CardTitle>
                    <CardDescription>
                      Arsip dokumen resmi As-Built Drawing (ABD), peta rute KML final, dan berkas serah terima tersimpan di database server.
                    </CardDescription>
                  </div>
                  <Button size="sm" onClick={handleOpenAddDoc}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Dokumen ABD
                  </Button>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {asBuiltDocsList.length === 0 ? (
                    <div className="flex justify-center py-12">
                      <div className="text-center max-w-sm">
                        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                          <Book className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">Dokumen ABD Belum Ada</h3>
                        <p className="text-muted-foreground text-[10pt] mb-6">
                          Unggah dokumen As-Built Drawing (ABD) final untuk diserahkan ke tim operasional dan bowheer.
                        </p>
                        <Button onClick={handleOpenAddDoc}>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Dokumen ABD
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Metric Summary Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 bg-muted/20 border rounded-md">
                          <div className="text-[11px] text-muted-foreground">Total Dokumen</div>
                          <div className="text-xl font-bold text-foreground mt-0.5">{asBuiltDocsList.length}</div>
                        </div>
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">Final Verified</div>
                          <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                            {asBuiltDocsList.filter((d) => d.status === 'Final Verified').length}
                          </div>
                        </div>
                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
                          <div className="text-[11px] text-blue-700 dark:text-blue-400 font-medium">Customer Signed</div>
                          <div className="text-xl font-bold text-blue-700 dark:text-blue-400 mt-0.5">
                            {asBuiltDocsList.filter((d) => d.status === 'Customer Signed').length}
                          </div>
                        </div>
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-md">
                          <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">Under Review</div>
                          <div className="text-xl font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                            {asBuiltDocsList.filter((d) => d.status === 'Under Review').length}
                          </div>
                        </div>
                      </div>

                      {/* Documents Table */}
                      <div className="w-full rounded-md border border-border overflow-hidden">
                        <Table className="text-[11px] whitespace-nowrap">
                          <TableHeader className="bg-muted/30">
                            <TableRow className="border-b border-border">
                              <TableHead className="px-3 py-2.5 font-semibold">Nama File / Dokumen</TableHead>
                              <TableHead className="px-3 py-2.5 font-semibold">Kategori</TableHead>
                              <TableHead className="px-3 py-2.5 font-semibold text-center">Ukuran</TableHead>
                              <TableHead className="px-3 py-2.5 font-semibold">Tanggal Verifikasi</TableHead>
                              <TableHead className="px-3 py-2.5 font-semibold text-center">Status Verifikasi</TableHead>
                              <TableHead className="px-3 py-2.5 font-semibold">Catatan / Deskripsi</TableHead>
                              <TableHead className="px-3 py-2.5 font-semibold text-center">Aksi</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {asBuiltDocsList.map((doc) => (
                              <TableRow key={doc.id} className="border-b border-border/60 hover:bg-muted/20">
                                <TableCell className="px-3 py-2.5">
                                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5 text-primary" />
                                    {doc.name}
                                  </div>
                                </TableCell>
                                <TableCell className="px-3 py-2.5">
                                  <Badge variant="outline" className="text-[10px] font-normal px-1.5 py-0.5">
                                    {doc.category}
                                  </Badge>
                                </TableCell>
                                <TableCell className="px-3 py-2.5 text-center text-muted-foreground font-mono">
                                  {doc.size || '-'}
                                </TableCell>
                                <TableCell className="px-3 py-2.5">
                                  {doc.date ? formatDisplayDate(doc.date).fullDate : '-'}
                                </TableCell>
                                <TableCell className="px-3 py-2.5 text-center">
                                  <span
                                    className={cn(
                                      "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold",
                                      doc.status === 'Final Verified' && "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400",
                                      doc.status === 'Customer Signed' && "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400",
                                      doc.status === 'Under Review' && "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                                    )}
                                  >
                                    {doc.status === 'Final Verified' ? (
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                    ) : (
                                      <FileCheck2 className="w-3 h-3 mr-1" />
                                    )}
                                    {doc.status}
                                  </span>
                                </TableCell>
                                <TableCell className="px-3 py-2.5 max-w-[220px] whitespace-normal">
                                  <p className="text-[10px] text-foreground/80 line-clamp-1">{doc.notes || '-'}</p>
                                </TableCell>
                                <TableCell className="px-3 py-2.5 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                      onClick={() => handleOpenEditDoc(doc)}
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                      onClick={() => handleDeleteDoc(doc.id)}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Modal Upload / Edit Dokumen ABD */}
              <Dialog open={isDocDialogOpen} onOpenChange={setIsDocDialogOpen}>
                <DialogContent className="sm:max-w-[550px] p-6">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-bold flex items-center gap-2">
                      <Book className="w-5 h-5 text-primary" />
                      {editingDocId ? 'Edit Dokumen As-Built' : 'Upload Dokumen As-Built (ABD)'}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      Penyimpanan berkas gambar rute As-Built Drawing dan verifikasi serah terima ke database server.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-3.5 py-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Pilih File dari Perangkat</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          ref={docFileInputRef}
                          className="hidden"
                          onChange={handleDocFileChange}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => docFileInputRef.current?.click()}
                        >
                          <Upload className="w-3.5 h-3.5 mr-1.5" />
                          Pilih Berkas Dokumen
                        </Button>
                        <span className="text-xs text-muted-foreground truncate">
                          {docFormData.name || 'Belum ada file dipilih'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Nama Dokumen</Label>
                      <Input
                        value={docFormData.name}
                        onChange={(e) => setDocFormData({ ...docFormData, name: e.target.value })}
                        placeholder="As-Built Drawing Route Feeder.pdf"
                        className="text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Kategori Dokumen</Label>
                        <Select
                          value={docFormData.category}
                          onValueChange={(val) => setDocFormData({ ...docFormData, category: val })}
                        >
                          <SelectTrigger className="text-xs w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Engineering" className="text-xs">Engineering (CAD/Drawing)</SelectItem>
                            <SelectItem value="GIS Spatial" className="text-xs">GIS Spatial (KML/KMZ)</SelectItem>
                            <SelectItem value="Testing" className="text-xs">Testing (OTDR/Measurement)</SelectItem>
                            <SelectItem value="Acceptance" className="text-xs">Acceptance (BAUT/Handover)</SelectItem>
                            <SelectItem value="Lainnya" className="text-xs">Lainnya</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Status Verifikasi</Label>
                        <Select
                          value={docFormData.status}
                          onValueChange={(val) => setDocFormData({ ...docFormData, status: val })}
                        >
                          <SelectTrigger className="text-xs w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Final Verified" className="text-xs text-emerald-600 font-semibold">Final Verified</SelectItem>
                            <SelectItem value="Customer Signed" className="text-xs text-blue-600 font-semibold">Customer Signed</SelectItem>
                            <SelectItem value="Under Review" className="text-xs text-amber-600 font-semibold">Under Review</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Ukuran File</Label>
                        <Input
                          value={docFormData.size}
                          onChange={(e) => setDocFormData({ ...docFormData, size: e.target.value })}
                          placeholder="Contoh: 14.2 MB"
                          className="text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Tanggal Verifikasi</Label>
                        <Input
                          type="date"
                          value={docFormData.date}
                          onChange={(e) => setDocFormData({ ...docFormData, date: e.target.value })}
                          className="text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Catatan / Keterangan Dokumen</Label>
                      <Textarea
                        value={docFormData.notes}
                        onChange={(e) => setDocFormData({ ...docFormData, notes: e.target.value })}
                        placeholder="Keterangan versi revisi, paraf pengawas, atau cakupan dokumen..."
                        className="text-xs min-h-[50px]"
                      />
                    </div>
                  </div>

                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" size="sm" onClick={() => setIsDocDialogOpen(false)} disabled={isSavingDoc}>
                      Batal
                    </Button>
                    <Button size="sm" onClick={handleSaveDoc} disabled={isSavingDoc}>
                      {isSavingDoc ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        editingDocId ? 'Perbarui Dokumen' : 'Simpan Dokumen'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* SUBTAB 2: ASSET INVENTORY RECORD */}
            <TabsContent value="assets">
              <Card className="border-0 shadow-none ring-1 ring-border/50 p-0 gap-0 bg-card">
                <CardHeader className="bg-muted/10 p-4 border-b flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Database className="w-5 h-5 text-primary" />
                      Fiber Asset Inventory &amp; Handover Record
                    </CardTitle>
                    <CardDescription>
                      Pencatatan aset jaringan optik terbangun, spesifikasi fisik, dan masa garansi resmi di database server.
                    </CardDescription>
                  </div>
                  <Button size="sm" onClick={handleOpenAddAsset}>
                    <Plus className="w-4 h-4 mr-2" />
                    Catat Aset Jaringan Baru
                  </Button>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {assetsList.length === 0 ? (
                    <div className="flex justify-center py-12">
                      <div className="text-center max-w-sm">
                        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                          <Database className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">Aset Belum Tercatat</h3>
                        <p className="text-muted-foreground text-[10pt] mb-6">
                          Catat aset jaringan baru yang telah terbangun untuk disinkronisasi ke Master Data dan operasional.
                        </p>
                        <Button onClick={handleOpenAddAsset}>
                          <Plus className="w-4 h-4 mr-2" />
                          Catat Aset Baru
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Metric Summary Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 bg-muted/20 border rounded-md">
                          <div className="text-[11px] text-muted-foreground">Total Aset Tercatat</div>
                          <div className="text-xl font-bold text-foreground mt-0.5">{assetsList.length}</div>
                        </div>
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">Active / Transferred</div>
                          <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                            {assetsList.filter((a) => a.status === 'Active / Transferred').length}
                          </div>
                        </div>
                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
                          <div className="text-[11px] text-blue-700 dark:text-blue-400 font-medium">In Testing</div>
                          <div className="text-xl font-bold text-blue-700 dark:text-blue-400 mt-0.5">
                            {assetsList.filter((a) => a.status === 'In Testing').length}
                          </div>
                        </div>
                        <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-md">
                          <div className="text-[11px] text-purple-700 dark:text-purple-400 font-medium">Vendor Rekanan</div>
                          <div className="text-xl font-bold text-purple-700 dark:text-purple-400 mt-0.5">
                            {new Set(assetsList.map((a) => a.vendor).filter(Boolean)).size || 1}
                          </div>
                        </div>
                      </div>

                      {/* Assets Table */}
                      <div className="w-full rounded-md border border-border overflow-hidden">
                        <Table className="text-[11px] whitespace-nowrap">
                          <TableHeader className="bg-muted/30">
                            <TableRow className="border-b border-border">
                              <TableHead className="px-3 py-2.5 font-semibold">Asset ID &amp; Tipe</TableHead>
                              <TableHead className="px-3 py-2.5 font-semibold">Spesifikasi Teknis</TableHead>
                              <TableHead className="px-3 py-2.5 font-semibold">Lokasi Penempatan</TableHead>
                              <TableHead className="px-3 py-2.5 font-semibold">Masa Garansi &amp; Vendor</TableHead>
                              <TableHead className="px-3 py-2.5 font-semibold text-center">Status Aset</TableHead>
                              <TableHead className="px-3 py-2.5 font-semibold">Catatan</TableHead>
                              <TableHead className="px-3 py-2.5 font-semibold text-center">Aksi</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {assetsList.map((asset) => (
                              <TableRow key={asset.id} className="border-b border-border/60 hover:bg-muted/20">
                                <TableCell className="px-3 py-2.5">
                                  <div className="font-semibold text-foreground">{asset.assetId}</div>
                                  <div className="text-[10px] text-muted-foreground">{asset.type}</div>
                                </TableCell>
                                <TableCell className="px-3 py-2.5">
                                  <span className="font-medium text-foreground/90">{asset.specification}</span>
                                </TableCell>
                                <TableCell className="px-3 py-2.5">
                                  <span className="text-foreground/80">{asset.location || '-'}</span>
                                </TableCell>
                                <TableCell className="px-3 py-2.5">
                                  <div className="text-[10px] text-foreground font-medium">{asset.warranty || '-'}</div>
                                  <div className="text-[9px] text-muted-foreground">{asset.vendor || '-'}</div>
                                </TableCell>
                                <TableCell className="px-3 py-2.5 text-center">
                                  <span
                                    className={cn(
                                      "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold",
                                      asset.status === 'Active / Transferred' && "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400",
                                      asset.status === 'In Testing' && "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400",
                                      asset.status === 'Under Maintenance' && "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                                    )}
                                  >
                                    <ShieldCheck className="w-3 h-3 mr-1" />
                                    {asset.status}
                                  </span>
                                </TableCell>
                                <TableCell className="px-3 py-2.5 max-w-[200px] whitespace-normal">
                                  <p className="text-[10px] text-foreground/80 line-clamp-1">{asset.notes || '-'}</p>
                                </TableCell>
                                <TableCell className="px-3 py-2.5 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                      onClick={() => handleOpenEditAsset(asset)}
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                      onClick={() => handleDeleteAsset(asset.id)}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Modal Form Asset */}
              <Dialog open={isAssetDialogOpen} onOpenChange={setIsAssetDialogOpen}>
                <DialogContent className="sm:max-w-[550px] p-6">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-bold flex items-center gap-2">
                      <Database className="w-5 h-5 text-primary" />
                      {editingAssetId ? 'Edit Aset Jaringan' : 'Catat Aset Jaringan Baru'}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      Pencatatan aset fisik jaringan optik, vendor penyedia, dan garansi operasional ke database server.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-3.5 py-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Asset ID</Label>
                        <Input
                          value={assetFormData.assetId}
                          onChange={(e) => setAssetFormData({ ...assetFormData, assetId: e.target.value })}
                          placeholder="AST-CAB-001"
                          className="text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Tipe Aset</Label>
                        <Select
                          value={assetFormData.type}
                          onValueChange={(val) => setAssetFormData({ ...assetFormData, type: val })}
                        >
                          <SelectTrigger className="text-xs w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cable Asset" className="text-xs">Cable Asset (Kabel FO)</SelectItem>
                            <SelectItem value="Closure Asset" className="text-xs">Closure Asset (Joint Closure)</SelectItem>
                            <SelectItem value="ODF Asset" className="text-xs">ODF / ODC Asset (Kabinet)</SelectItem>
                            <SelectItem value="Pole Asset" className="text-xs">Pole Asset (Tiang Besi/Beton)</SelectItem>
                            <SelectItem value="Handhole Asset" className="text-xs">Handhole Asset</SelectItem>
                            <SelectItem value="Optical Splitter" className="text-xs">Optical Splitter / Passive</SelectItem>
                            <SelectItem value="Lainnya" className="text-xs">Lainnya</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Spesifikasi Teknis</Label>
                      <Input
                        value={assetFormData.specification}
                        onChange={(e) => setAssetFormData({ ...assetFormData, specification: e.target.value })}
                        placeholder="Contoh: Kabel Fiber Optik ADSS 24 Core Single Mode G.652D"
                        className="text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Lokasi Penempatan / Span</Label>
                        <Input
                          value={assetFormData.location}
                          onChange={(e) => setAssetFormData({ ...assetFormData, location: e.target.value })}
                          placeholder="Contoh: Span ODC Sentul s/d Tiang 22"
                          className="text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Status Aset</Label>
                        <Select
                          value={assetFormData.status}
                          onValueChange={(val) => setAssetFormData({ ...assetFormData, status: val })}
                        >
                          <SelectTrigger className="text-xs w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Active / Transferred" className="text-xs text-emerald-600 font-semibold">Active / Transferred</SelectItem>
                            <SelectItem value="In Testing" className="text-xs text-blue-600 font-semibold">In Testing</SelectItem>
                            <SelectItem value="Under Maintenance" className="text-xs text-amber-600 font-semibold">Under Maintenance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Masa Garansi</Label>
                        <Input
                          value={assetFormData.warranty}
                          onChange={(e) => setAssetFormData({ ...assetFormData, warranty: e.target.value })}
                          placeholder="Contoh: 24 Bulan Garansi (Exp: Sep 2028)"
                          className="text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Vendor / Pabrikan</Label>
                        <Input
                          value={assetFormData.vendor}
                          onChange={(e) => setAssetFormData({ ...assetFormData, vendor: e.target.value })}
                          placeholder="Contoh: PT Voksel Electric Tbk"
                          className="text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Catatan Serah Terima / Kondisi Aset</Label>
                      <Textarea
                        value={assetFormData.notes}
                        onChange={(e) => setAssetFormData({ ...assetFormData, notes: e.target.value })}
                        placeholder="Keterangan kelengkapan aksesoris, nomor seri, atau kondisi fisik..."
                        className="text-xs min-h-[50px]"
                      />
                    </div>
                  </div>

                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" size="sm" onClick={() => setIsAssetDialogOpen(false)} disabled={isSavingAsset}>
                      Batal
                    </Button>
                    <Button size="sm" onClick={handleSaveAsset} disabled={isSavingAsset}>
                      {isSavingAsset ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        editingAssetId ? 'Perbarui Aset' : 'Simpan Data Aset'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* SUBTAB 3: FINAL PROFITABILITY REPORT */}
            <TabsContent value="profitability">
              <div className="space-y-4">
                {/* Header & Adjust Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/10 p-4 border rounded-lg">
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                      <CircleDollarSign className="w-5 h-5 text-emerald-600" />
                      Laporan Profitabilitas &amp; Margin Akhir Proyek
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Perbandingan nilai kontrak, realisasi pengeluaran aktual (Capex + Opex), serta analisis varian biaya tersimpan di database server.
                    </p>
                  </div>
                  <Button size="sm" onClick={handleOpenEditProfitability} className="shrink-0">
                    <PenTool className="w-4 h-4 mr-2" />
                    Sesuaikan Angka P&amp;L &amp; Varian
                  </Button>
                </div>

                {/* 4 Financial Summary Cards */}
                {(() => {
                  const contract = Number(profitabilityData?.contractValue) || 0;
                  const capex = Number(profitabilityData?.actualCapex) || 0;
                  const opex = Number(profitabilityData?.actualOpex) || 0;
                  const totalCost = capex + opex;
                  const grossMargin = contract - totalCost;
                  const marginPercent = contract > 0 ? ((grossMargin / contract) * 100).toFixed(1) : '0.0';
                  const rab = Number(profitabilityData?.rabBudget) || 0;
                  const varianceVsRab = rab - totalCost;

                  return (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <Card className="border-0 shadow-none ring-1 ring-border/50 p-4">
                          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Final Contract Value (Revenue)
                          </div>
                          <div className="text-xl font-bold text-foreground mt-1">
                            Rp {contract.toLocaleString('id-ID')}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-1">Nilai SPK / Kontrak resmi</div>
                        </Card>

                        <Card className="border-0 shadow-none ring-1 ring-border/50 p-4">
                          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Final Actual Cost (Capex + Opex)
                          </div>
                          <div className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-1">
                            Rp {totalCost.toLocaleString('id-ID')}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-1">
                            Capex: Rp {capex.toLocaleString('id-ID')} | Opex: Rp {opex.toLocaleString('id-ID')}
                          </div>
                        </Card>

                        <Card className="border-0 shadow-none ring-1 ring-border/50 p-4 bg-emerald-500/5">
                          <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                            Final Gross Margin
                          </div>
                          <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                            Rp {grossMargin.toLocaleString('id-ID')}
                          </div>
                          <div className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Margin Profit: {marginPercent}%
                          </div>
                        </Card>

                        <Card className="border-0 shadow-none ring-1 ring-border/50 p-4">
                          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Realisasi vs Anggaran RAB
                          </div>
                          <div
                            className={cn(
                              "text-xl font-bold mt-1",
                              varianceVsRab >= 0 ? "text-blue-600 dark:text-blue-400" : "text-amber-600 dark:text-amber-400"
                            )}
                          >
                            {varianceVsRab >= 0 ? '+' : ''}Rp {varianceVsRab.toLocaleString('id-ID')}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-1">
                            {varianceVsRab >= 0 ? 'Efisiensi / Penghematan biaya' : 'Overbudget anggaran RAB'}
                          </div>
                        </Card>
                      </div>

                      {/* Root Cause & Cost Variance Analysis Card */}
                      <Card className="border-0 shadow-none ring-1 ring-border/50 p-0 gap-0 bg-card">
                        <CardHeader className="bg-muted/10 p-4 border-b flex flex-row items-center justify-between">
                          <div>
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                              Analisis Varian Biaya &amp; Faktor Lapangan (Root Cause)
                            </CardTitle>
                            <CardDescription className="text-xs">
                              Daftar kendala lapangan dan penyesuaian teknis yang berdampak pada variasi margin proyek.
                            </CardDescription>
                          </div>
                          <Button size="sm" variant="outline" onClick={handleOpenEditProfitability} className="text-xs h-8">
                            <Plus className="w-3.5 h-3.5 mr-1.5" />
                            Tambah / Edit Faktor Varian
                          </Button>
                        </CardHeader>
                        <CardContent className="p-4">
                          {(!profitabilityData?.rootCauses || profitabilityData.rootCauses.length === 0) ? (
                            <div className="text-center py-6 text-xs text-muted-foreground">
                              Belum ada catatan faktor varian biaya lapangan yang dimasukkan.
                            </div>
                          ) : (
                            <div className="w-full rounded-md border border-border overflow-hidden">
                              <Table className="text-[11px]">
                                <TableHeader className="bg-muted/30">
                                  <TableRow className="border-b border-border">
                                    <TableHead className="px-3 py-2.5 font-semibold">Faktor Lapangan &amp; Kendala</TableHead>
                                    <TableHead className="px-3 py-2.5 font-semibold">Penjelasan Analisis</TableHead>
                                    <TableHead className="px-3 py-2.5 font-semibold text-right">Besaran Dampak (Rp)</TableHead>
                                    <TableHead className="px-3 py-2.5 font-semibold text-center">Tingkat Dampak</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {profitabilityData.rootCauses.map((cause: any) => (
                                    <TableRow key={cause.id} className="border-b border-border/60 hover:bg-muted/20">
                                      <TableCell className="px-3 py-2.5 font-semibold text-foreground">
                                        {cause.title}
                                      </TableCell>
                                      <TableCell className="px-3 py-2.5 text-foreground/80 max-w-[320px]">
                                        {cause.description}
                                      </TableCell>
                                      <TableCell className="px-3 py-2.5 text-right font-mono font-medium text-slate-800 dark:text-slate-200">
                                        Rp {Number(cause.impactAmount || 0).toLocaleString('id-ID')}
                                      </TableCell>
                                      <TableCell className="px-3 py-2.5 text-center">
                                        <span
                                          className={cn(
                                            "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold",
                                            cause.impactLevel === 'High Cost Impact' && "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
                                            cause.impactLevel === 'Moderate' && "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
                                            cause.impactLevel === 'Low' && "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                                          )}
                                        >
                                          {cause.impactLevel}
                                        </span>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                          {profitabilityData?.notes && (
                            <div className="mt-3 p-3 bg-muted/20 rounded border text-xs text-foreground/90">
                              <span className="font-semibold text-muted-foreground">Catatan Evaluasi: </span>
                              {profitabilityData.notes}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </>
                  );
                })()}
              </div>

              {/* Modal Dialog Sesuaikan P&L dan Varian */}
              <Dialog open={isProfitabilityDialogOpen} onOpenChange={setIsProfitabilityDialogOpen}>
                <DialogContent className="sm:max-w-[620px] p-6 max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-bold flex items-center gap-2">
                      <CircleDollarSign className="w-5 h-5 text-emerald-600" />
                      Sesuaikan Angka Profitabilitas &amp; Faktor Varian
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      Perbarui nilai kontrak, realisasi biaya aktual (Capex &amp; Opex), serta rincian faktor varian biaya ke database server.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Final Contract Value (Rp)</Label>
                        <Input
                          type="number"
                          value={profFormData.contractValue}
                          onChange={(e) => setProfFormData({ ...profFormData, contractValue: parseFloat(e.target.value) || 0 })}
                          className="text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Target Anggaran RAB (Rp)</Label>
                        <Input
                          type="number"
                          value={profFormData.rabBudget}
                          onChange={(e) => setProfFormData({ ...profFormData, rabBudget: parseFloat(e.target.value) || 0 })}
                          className="text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Realisasi Capex Aktual (Rp)</Label>
                        <Input
                          type="number"
                          value={profFormData.actualCapex}
                          onChange={(e) => setProfFormData({ ...profFormData, actualCapex: parseFloat(e.target.value) || 0 })}
                          className="text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Realisasi Opex Aktual (Rp)</Label>
                        <Input
                          type="number"
                          value={profFormData.actualOpex}
                          onChange={(e) => setProfFormData({ ...profFormData, actualOpex: parseFloat(e.target.value) || 0 })}
                          className="text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Catatan Evaluasi Keuangan</Label>
                      <Textarea
                        value={profFormData.notes}
                        onChange={(e) => setProfFormData({ ...profFormData, notes: e.target.value })}
                        placeholder="Contoh: Proyek diselesaikan dengan margin positif sesuai target komersial..."
                        className="text-xs min-h-[50px]"
                      />
                    </div>

                    {/* Section Tambah Faktor Varian */}
                    <div className="border rounded-md p-3 bg-muted/15 space-y-2.5">
                      <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5 text-primary" />
                        Tambah Faktor Varian Biaya (Root Cause)
                      </div>

                      <div className="space-y-1.5">
                        <Input
                          value={profFormData.newCauseTitle}
                          onChange={(e) => setProfFormData({ ...profFormData, newCauseTitle: e.target.value })}
                          placeholder="Judul faktor (cth: Perizinan crossing jalan nasional)"
                          className="text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Input
                          value={profFormData.newCauseDesc}
                          onChange={(e) => setProfFormData({ ...profFormData, newCauseDesc: e.target.value })}
                          placeholder="Penjelasan detail kendala lapangan..."
                          className="text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Besaran Dampak (Rp)</Label>
                          <Input
                            type="number"
                            value={profFormData.newCauseAmount}
                            onChange={(e) => setProfFormData({ ...profFormData, newCauseAmount: parseFloat(e.target.value) || 0 })}
                            className="text-xs"
                          />
                        </div>

                        <div>
                          <Label className="text-[10px] text-muted-foreground">Tingkat Dampak</Label>
                          <Select
                            value={profFormData.newCauseImpact}
                            onValueChange={(val) => setProfFormData({ ...profFormData, newCauseImpact: val })}
                          >
                            <SelectTrigger className="text-xs w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Low" className="text-xs">Low Impact</SelectItem>
                              <SelectItem value="Moderate" className="text-xs">Moderate</SelectItem>
                              <SelectItem value="High Cost Impact" className="text-xs">High Cost Impact</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="w-full text-xs h-8"
                        onClick={handleAddRootCauseItem}
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Tambahkan Faktor Varian Ini
                      </Button>

                      {/* List Root Causes di dalam dialog */}
                      {profFormData.rootCauses.length > 0 && (
                        <div className="mt-2 space-y-1.5 pt-2 border-t">
                          <div className="text-[11px] font-semibold text-muted-foreground">Daftar Faktor Terdaftar:</div>
                          {profFormData.rootCauses.map((rc) => (
                            <div key={rc.id} className="flex items-center justify-between p-2 bg-background border rounded text-xs">
                              <div>
                                <div className="font-semibold text-foreground">{rc.title}</div>
                                <div className="text-[10px] text-muted-foreground">
                                  Rp {Number(rc.impactAmount || 0).toLocaleString('id-ID')} - {rc.impactLevel}
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                onClick={() => handleRemoveRootCauseItem(rc.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" size="sm" onClick={() => setIsProfitabilityDialogOpen(false)} disabled={isSavingProfitability}>
                      Batal
                    </Button>
                    <Button size="sm" onClick={handleSaveProfitability} disabled={isSavingProfitability}>
                      {isSavingProfitability ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        'Simpan Laporan Profitabilitas'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
