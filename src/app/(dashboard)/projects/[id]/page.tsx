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
import { ArrowLeft, Edit, Plus, Upload, Map, CircleDollarSign, CheckCircle, FileText, Search, Lock, TrendingUp, Camera, AlertTriangle, Zap, Wrench, FileCheck2, Book, Database, PenTool, Trash2, Activity, ClipboardCheck, FileCheck, Hammer, Flag } from 'lucide-react';
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
  const [routeText, setRouteText] = useState('');
  const [isEditingRoute, setIsEditingRoute] = useState(false);

  // Master Data Mock
  const MASTER_MATERIALS = [
    { name: 'Kabel Fiber Optik 24 Core', unit: 'm', price: 8000 },
    { name: 'Kabel Fiber Optik 48 Core', unit: 'm', price: 12000 },
    { name: 'Tiang Besi 7 Meter', unit: 'batang', price: 850000 },
    { name: 'Tiang Besi 9 Meter', unit: 'batang', price: 1100000 },
    { name: 'ODP 8 Core', unit: 'unit', price: 350000 },
    { name: 'ODP 16 Core', unit: 'unit', price: 550000 },
    { name: 'ODC 144 Core', unit: 'unit', price: 4500000 },
    { name: 'Closure 24 Core', unit: 'unit', price: 250000 },
    { name: 'Aksesoris Tiang', unit: 'set', price: 75000 },
    { name: 'Jasa Penarikan Kabel FO', unit: 'm', price: 3500 },
    { name: 'Jasa Pendirian Tiang', unit: 'titik', price: 150000 },
  ];

  // Commercial States
  const [commercialData, setCommercialData] = useState({ capex: 0, opex: 0, revenue: 0 });
  const [isEditingCommercial, setIsEditingCommercial] = useState(false);

  // Find the project based on the decoded ID from URL
  const decodedId = decodeURIComponent(params?.id || '');
  const project = projects.find((p) => p.id === decodedId);

  const [designatorItems, setDesignatorItems] = useState<DesignatorItem[]>(
    (project as any)?.designatorItems || []
  );

  useEffect(() => {
    if (!decodedId) return;
    try {
      const saved = localStorage.getItem(`proper_project_designators_${decodedId}`);
      if (saved) {
        setDesignatorItems(JSON.parse(saved));
      } else {
        setDesignatorItems((project as any)?.designatorItems || []);
      }
    } catch (err) {
      console.error("Failed to load designator items", err);
    }
  }, [decodedId, project]);

  const handleUpdateDesignatorItems = (items: DesignatorItem[]) => {
    setDesignatorItems(items);
    try {
      localStorage.setItem(`proper_project_designators_${decodedId}`, JSON.stringify(items));
    } catch (err) {
      console.error("Failed to save designator items", err);
    }
  };

  const progressMetrics = calculateOverallProjectProgress(designatorItems);
  const progressDates = useMemo(() => {
    return generateProgressDates(project?.startDate, project?.targetDate);
  }, [project?.startDate, project?.targetDate]);

  const sCurveData = generateSCurveData(designatorItems, progressDates);

  // Tanggal Terpilih Laporan Harian (Daily Progress)
  const [selectedReportDate, setSelectedReportDate] = useState<string>(() => {
    return toISODateString(new Date());
  });

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

  // Rekapitulasi Data Tabel Berdasarkan Tanggal yang Dipilih
  const dailySummaryRows = useMemo(() => {
    const jobCategories: {
      name: string;
      matcher: (item: DesignatorItem) => boolean;
      defaultUnit: string;
    }[] = [
      {
        name: 'Pekerjaan Galian',
        matcher: (item) => item.jenis === 'Galian',
        defaultUnit: 'Meter',
      },
      {
        name: 'Pekerjaan Jembatan',
        matcher: (item) => item.jenis === 'Jembatan',
        defaultUnit: 'Meter',
      },
      {
        name: 'Pekerjaan Handhole (HH)',
        matcher: (item) => item.jenis === 'Handhole',
        defaultUnit: 'Unit',
      },
      {
        name: 'Progres Penarikan Kabel',
        matcher: (item) => item.jenis === 'Kabel',
        defaultUnit: 'Meter',
      },
      {
        name: 'Penyambungan/Jointing',
        matcher: (item) => item.jenis === 'Terminasi' || item.jenis === 'Jointing',
        defaultUnit: 'Titik',
      },
    ];

    return jobCategories.map((cat) => {
      const matchedItems = designatorItems.filter(cat.matcher);
      const unit = matchedItems[0]?.satuan || cat.defaultUnit;
      const volumeBOQ = matchedItems.reduce((acc, it) => acc + (Number(it.volumeTarget) || 0), 0);

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
  }, [decodedId, selectedReportDate, designatorItems]);

  // Info Lapangan (Mandor & Alat Berat) pada Tanggal yang Dipilih
  const currentDayFieldInfo = useMemo(() => {
    let mandors: string[] = [];
    let alatKerjaList: string[] = [];

    designatorItems.forEach((it) => {
      const recs = it.dailyRecords?.[selectedReportDate];
      if (recs && recs.length > 0) {
        recs.forEach((r) => {
          if (r.mandor && !mandors.includes(r.mandor)) mandors.push(r.mandor);
          if (r.alatKerja && !alatKerjaList.includes(r.alatKerja)) alatKerjaList.push(r.alatKerja);
        });
      }
    });

    return {
      tenagaKerja: mandors.length > 0 ? `${mandors.join(', ')} (${mandors.length * 8} Orang)` : '26 Orang',
      alatBerat: alatKerjaList.length > 0 ? alatKerjaList.join(', ') : '-',
    };
  }, [designatorItems, selectedReportDate]);

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
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-3">
            {project.name}
            <StatusBadge status={project.status || 'Planning'} />
          </h1>
          <p className="text-muted-foreground text-[10pt] mt-1">
            Project ID: {project.id}
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
                        <CardDescription>Detail dasar mengenai proyek ini</CardDescription>
                      </div>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Detail
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <div className="text-[10pt] text-muted-foreground mb-1">Customer / Client</div>
                        <div className="font-medium text-foreground">{project.customer}</div>
                      </div>
                      <div>
                        <div className="text-[10pt] text-muted-foreground mb-1">Tipe Proyek</div>
                        <div className="font-medium text-foreground">{project.type}</div>
                      </div>
                      <div>
                        <div className="text-[10pt] text-muted-foreground mb-1">Lokasi Pekerjaan</div>
                        <div className="font-medium text-foreground">{project.location || '-'}</div>
                      </div>
                      <div>
                        <div className="text-[10pt] text-muted-foreground mb-1">Nomor Kontrak</div>
                        <div className="font-medium text-foreground">{project.contractNo || '-'}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-none ring-1 ring-border/50 p-0 gap-0">
                  <CardHeader className="bg-muted/30 p-4 border-b">
                    <CardTitle className="text-lg">Ruang Lingkup (Scope)</CardTitle>
                    <CardDescription>Cakupan pekerjaan yang akan dilakukan pada proyek ini</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/20 rounded-lg border border-dashed">
                      <p className="text-muted-foreground text-[10pt] mb-4">Ruang lingkup belum ditambahkan</p>
                      <Button variant="secondary" size="sm">Tambah Lingkup Pekerjaan</Button>
                    </div>
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
                      <div className="text-[10pt] text-muted-foreground mb-1">Mulai (Start Date)</div>
                      <div className="font-medium text-foreground">{project.startDate || '-'}</div>
                    </div>
                    <div>
                      <div className="text-[10pt] text-muted-foreground mb-1">Target Selesai</div>
                      <div className="font-medium text-foreground">{project.targetDate || '-'}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-none ring-1 ring-border/50 p-0 gap-0">
                  <CardHeader className="bg-muted/30 p-4 border-b">
                    <CardTitle className="text-lg">Manajemen</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <div className="text-[10pt] text-muted-foreground mb-1">Project Manager (PIC)</div>
                      <div className="font-medium text-foreground">{project.manager || '-'}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

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
                      <div className="border-0 shadow-none">
                        <Table className="border-0">
                          <TableHeader className="bg-transparent">
                            <TableRow className="border-b border-border hover:bg-transparent">
                              <TableHead className="font-normal text-[10pt] text-muted-foreground">Nama Material</TableHead>
                              <TableHead className="font-normal text-[10pt] text-muted-foreground">Qty</TableHead>
                              <TableHead className="font-normal text-[10pt] text-muted-foreground">Satuan</TableHead>
                              <TableHead className="font-normal text-[10pt] text-muted-foreground">Harga Satuan</TableHead>
                              <TableHead className="font-normal text-[10pt] text-muted-foreground">Total Harga</TableHead>
                              <TableHead className="font-normal text-[10pt] text-muted-foreground text-right">{isEditingBOQ ? '' : 'Action'}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {project.boqItems?.map((item) => (
                              <TableRow key={item.id} className="border-b border-border hover:bg-transparent transition-none">
                                <TableCell className="font-medium py-2 text-foreground/90">{item.name}</TableCell>
                                <TableCell className="py-2 text-foreground/80">{item.quantity}</TableCell>
                                <TableCell className="py-2 text-foreground/80">{item.unit}</TableCell>
                                <TableCell className="py-2 text-foreground/80">Rp {item.price.toLocaleString()}</TableCell>
                                <TableCell className="py-2 text-foreground/80">Rp {(item.quantity * item.price).toLocaleString()}</TableCell>
                                <TableCell className="py-2 text-right">
                                  {isEditingBOQ ? (
                                    <Button variant="ghost" size="icon" onClick={() => {
                                      const newItems = project.boqItems?.filter(i => i.id !== item.id);
                                      updateProject(project.id, { boqItems: newItems });
                                    }}>
                                      <Trash2 className="w-4 h-4 text-red-500" />
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
                              <TableRow className="border-b border-border hover:bg-transparent transition-none">
                                <TableCell className="py-2">
                                  <Select
                                    value={newBOQItem.name}
                                    onValueChange={(val) => {
                                      const material = MASTER_MATERIALS.find(m => m.name === val);
                                      if (material) {
                                        setNewBOQItem({
                                          ...newBOQItem,
                                          name: material.name,
                                          unit: material.unit,
                                          price: material.price
                                        });
                                      }
                                    }}
                                  >
                                    <SelectTrigger className="h-8 text-[10pt] border-dashed w-[220px]">
                                      <SelectValue placeholder="Pilih dari Master Data..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {MASTER_MATERIALS.map((mat) => (
                                        <SelectItem key={mat.name} value={mat.name} className="text-[10pt]">
                                          {mat.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell className="py-2">
                                  <Input type="number" value={newBOQItem.quantity || ''} onChange={e => setNewBOQItem({ ...newBOQItem, quantity: parseInt(e.target.value) || 0 })} className="h-8 text-[10pt] w-20 border-dashed" />
                                </TableCell>
                                <TableCell className="py-2 text-foreground/80">
                                  <div className="flex h-8 items-center text-[10pt] px-3 bg-muted/30 border border-dashed rounded-md w-20">{newBOQItem.unit || '-'}</div>
                                </TableCell>
                                <TableCell className="py-2 text-foreground/80">
                                  <div className="flex h-8 items-center text-[10pt] px-3 bg-muted/30 border border-dashed rounded-md">Rp {(newBOQItem.price || 0).toLocaleString()}</div>
                                </TableCell>
                                <TableCell className="py-2 text-foreground/80 font-medium">
                                  Rp {(newBOQItem.quantity * newBOQItem.price).toLocaleString()}
                                </TableCell>
                                <TableCell className="py-2 text-right">
                                  <Button size="icon" className="h-8 w-8 rounded-full" onClick={() => {
                                    if (newBOQItem.name) {
                                      const updated = [...(project.boqItems || []), { id: Date.now().toString(), ...newBOQItem }];
                                      updateProject(project.id, { boqItems: updated });
                                      setNewBOQItem({ name: '', quantity: 1, unit: 'm', price: 0 });
                                    }
                                  }}>
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
                <TabsList className="flex-col justify-start h-auto w-full md:w-64 bg-transparent border-r rounded-none p-0 gap-1 items-start shrink-0">
                  <TabsTrigger value="route" className="w-full justify-start text-left data-[state=active]:bg-muted/50 data-[state=active]:border-r-2 data-[state=active]:border-primary rounded-none shadow-none">Route & Catuan Fiber</TabsTrigger>
                  <TabsTrigger value="validation" className="w-full justify-start text-left data-[state=active]:bg-muted/50 data-[state=active]:border-r-2 data-[state=active]:border-primary rounded-none shadow-none">Survey Validation</TabsTrigger>
                  <TabsTrigger value="kml" className="w-full justify-start text-left data-[state=active]:bg-muted/50 data-[state=active]:border-r-2 data-[state=active]:border-primary rounded-none shadow-none">KML & Route Verification</TabsTrigger>
                  <TabsTrigger value="permits" className="w-full justify-start text-left data-[state=active]:bg-muted/50 data-[state=active]:border-r-2 data-[state=active]:border-primary rounded-none shadow-none">Permit Management</TabsTrigger>
                </TabsList>
                <div className="flex-1 w-full min-w-0">
              <TabsContent value="route" className="mt-0">
                <Card className="border-0 shadow-none ring-1 ring-border/50 p-0 gap-0">
                <CardHeader className="bg-muted/10 p-4 border-b flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Route & Catuan Fiber</CardTitle>
                    <CardDescription>Peta rute dan topologi fiber optik.</CardDescription>
                  </div>
                  {!isEditingRoute && !project.routeNotes ? (
                    <Button size="sm" onClick={() => setIsEditingRoute(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Deskripsi Rute
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => {
                      if (isEditingRoute) updateProject(project.id, { routeNotes: routeText });
                      else setRouteText(project.routeNotes || '');
                      setIsEditingRoute(!isEditingRoute);
                    }}>
                      {isEditingRoute ? 'Simpan Rute' : 'Edit Rute'}
                    </Button>
                  )}
                </CardHeader>
                <CardContent className={`p-4 ${!project.routeNotes && !isEditingRoute ? 'flex justify-center py-12' : ''}`}>
                  {!project.routeNotes && !isEditingRoute ? (
                    <div className="text-center max-w-sm">
                      <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Map className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">Rute Belum Dipetakan</h3>
                      <p className="text-muted-foreground text-[10pt] mb-6">Data koordinat dan catuan fiber belum tersedia. Anda dapat mendeskripsikan rute secara manual atau mengunggah data geospasial.</p>
                      <Button onClick={() => setIsEditingRoute(true)}><Plus className="w-4 h-4 mr-2" />Buat Deskripsi Rute</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {isEditingRoute ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="route-notes">Deskripsi Rute Geografis & Catuan Fiber</Label>
                            <Input id="route-notes" placeholder="Misal: Tarikan FO dari ODC X menuju ODP Y menyusuri Jl. Sudirman sejauh 5KM..." value={routeText} onChange={e => setRouteText(e.target.value)} />
                          </div>
                        </div>
                      ) : (
                        <div className="bg-muted/30 p-4 rounded-md border">
                          <h4 className="font-medium text-sm text-muted-foreground mb-2">Deskripsi Rute</h4>
                          <p className="text-foreground leading-relaxed">{project.routeNotes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              </TabsContent>
              <TabsContent value="validation" className="mt-0">
                <Card className="border-0 shadow-none ring-1 ring-border/50 p-0 gap-0">
                  <CardHeader className="bg-muted/10 p-4 border-b"><CardTitle className="text-lg">Survey Validation</CardTitle></CardHeader>
                <CardContent className="p-4 flex justify-center py-12">
                  <div className="text-center max-w-sm">
                    <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Belum Ada Hasil Survey</h3>
                    <p className="text-muted-foreground text-[10pt] mb-6">Form validasi hasil survey lapangan oleh tim belum diisi.</p>
                    <Button><Plus className="w-4 h-4 mr-2" />Mulai Form Survey</Button>
                  </div>
                </CardContent>
              </Card>

              </TabsContent>
              <TabsContent value="kml" className="mt-0">
                <Card className="border-0 shadow-none ring-1 ring-border/50 p-0 gap-0">
                  <CardHeader className="bg-muted/10 p-4 border-b"><CardTitle className="text-lg">KML & Route Verification</CardTitle></CardHeader>
                <CardContent className="p-4 flex justify-center py-12">
                  <div className="text-center max-w-sm">
                    <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                      <Map className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Tidak Ada Data KML</h3>
                    <p className="text-muted-foreground text-[10pt] mb-6">Integrasi file KML/KMZ untuk verifikasi koordinat rute hasil survey lapangan.</p>
                    <Button><Upload className="w-4 h-4 mr-2" />Upload File KML/KMZ</Button>
                  </div>
                </CardContent>
              </Card>

              </TabsContent>
              <TabsContent value="permits" className="mt-0">
                <Card className="border-0 shadow-none ring-1 ring-border/50 p-0 gap-0">
                  <CardHeader className="bg-muted/10 p-4 border-b flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Permit Management</CardTitle>
                    <CardDescription>Status perizinan (RT/RW, dinas terkait, izin galian) akan dikelola di sini.</CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger className={buttonVariants({ size: "sm" })}>
                      <Plus className="w-4 h-4 mr-2" />Tambah Data
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[1000px]">
                      <DialogHeader>
                        <DialogTitle>Tambah Data Perizinan</DialogTitle>
                        <DialogDescription>
                          Masukkan detail Site ID, Status, dan Progress dari site.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="site-id">Site ID</Label>
                          <Input id="site-id" placeholder="Masukkan Site ID..." />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="status">Status</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Drop</SelectItem>
                              <SelectItem value="1">Aanwijzing</SelectItem>
                              <SelectItem value="2">Perizinan</SelectItem>
                              <SelectItem value="3">Matdel</SelectItem>
                              <SelectItem value="4">Instalasi</SelectItem>
                              <SelectItem value="5">Finish Install</SelectItem>
                              <SelectItem value="6">On Air</SelectItem>
                              <SelectItem value="7">Uji Terima</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="progress">Progress</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih Progress Detail" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                              <SelectGroup>
                                <SelectLabel>Drop</SelectLabel>
                                <SelectItem value="0.1">Feeder penuh</SelectItem>
                                <SelectItem value="0.2">Cancel DWS</SelectItem>
                                <SelectItem value="0.3">Cancel TSel</SelectItem>
                                <SelectItem value="0.4">Disolusikan PT1 / Squad Alpha / FO Eksisting</SelectItem>
                                <SelectItem value="0.5">Double order</SelectItem>
                                <SelectItem value="0.6">High commcase</SelectItem>
                                <SelectItem value="0.7">Private area</SelectItem>
                                <SelectItem value="0.8">Change to radio/Jalur Akses</SelectItem>
                                <SelectItem value="0.9">Sewa lahan tinggi</SelectItem>
                              </SelectGroup>
                              <SelectGroup>
                                <SelectLabel>Aanwijzing</SelectLabel>
                                <SelectItem value="1.1">Penunjukan mitra</SelectItem>
                                <SelectItem value="1.2">Penjadwalan aanwijzing</SelectItem>
                                <SelectItem value="1.3">Review hasil aanwijzing</SelectItem>
                                <SelectItem value="1.4">Approval NPD</SelectItem>
                                <SelectItem value="1.5">Kendala - Basetray ODC Full - Redesign</SelectItem>
                                <SelectItem value="1.6">Kendala - Distribusi Penuh - Redesign</SelectItem>
                                <SelectItem value="1.7">Kendala - Feeder Full - Redesign</SelectItem>
                                <SelectItem value="1.8">Kendala - Catuan butuh QE</SelectItem>
                                <SelectItem value="1.9">Commcase</SelectItem>
                                <SelectItem value="1.10">OLT penuh need confirm ED</SelectItem>
                                <SelectItem value="1.11">Lokasi Bencana/Unavailable FO</SelectItem>
                              </SelectGroup>
                              <SelectGroup>
                                <SelectLabel>Perizinan</SelectLabel>
                                <SelectItem value="2.1">Submit permohon ke PU</SelectItem>
                                <SelectItem value="2.2">Input OSS</SelectItem>
                                <SelectItem value="2.3">Pemaparan bersama PU</SelectItem>
                                <SelectItem value="2.4">Survey lokasi bersama PU</SelectItem>
                                <SelectItem value="2.5">Perhitungan bank garansi</SelectItem>
                                <SelectItem value="2.6">Menunggu rekomtek</SelectItem>
                                <SelectItem value="2.7">Izin Kades / Lurah / RTRW</SelectItem>
                                <SelectItem value="2.8">Izin Developer / Private area</SelectItem>
                                <SelectItem value="2.9">Pemilik lahan / warga</SelectItem>
                                <SelectItem value="2.10">Izin LSM / Preman</SelectItem>
                                <SelectItem value="2.11">Pengajuan Biaya Comcase</SelectItem>
                              </SelectGroup>
                              <SelectGroup>
                                <SelectLabel>Matdel</SelectLabel>
                                <SelectItem value="3.1">Depedensi Site Belum Ready</SelectItem>
                                <SelectItem value="3.2">Order Material</SelectItem>
                                <SelectItem value="3.3">Material tidak ready</SelectItem>
                                <SelectItem value="3.4">Proses Pengiriman Pabrik ke WH</SelectItem>
                                <SelectItem value="3.5">Proses Transfer antar gudang (TAG)</SelectItem>
                                <SelectItem value="3.6">Proses Pengiriman WH ke site</SelectItem>
                                <SelectItem value="3.7">Material On Site</SelectItem>
                                <SelectItem value="3.8">Menunggu manpower</SelectItem>
                              </SelectGroup>
                              <SelectGroup>
                                <SelectLabel>Instalasi</SelectLabel>
                                <SelectItem value="4.1">Kendala - Tidak Dapat Izin Warga/Kades/Lurah/Developer</SelectItem>
                                <SelectItem value="4.2">Proses Gali/Rojok</SelectItem>
                                <SelectItem value="4.3">Kendala - Gali/Rojok - Paralel Comcase/Perjinan PU</SelectItem>
                                <SelectItem value="4.4">Proses Penanaman Tiang</SelectItem>
                                <SelectItem value="4.5">Kendala - Penanaman Tiang - Paralel Comcase/Perjinan PU</SelectItem>
                                <SelectItem value="4.6">Proses Penarikan Kabel FO</SelectItem>
                                <SelectItem value="4.7">Kendala - Penarikan Kabel FO - Paralel Comcase/Perjinan PU</SelectItem>
                                <SelectItem value="4.8">Proses Terminasi catuan / Pemasangan OTB</SelectItem>
                                <SelectItem value="4.9">Change to radio IP temporer</SelectItem>
                              </SelectGroup>
                              <SelectGroup>
                                <SelectLabel>Finish Install</SelectLabel>
                                <SelectItem value="5.1">Selesai Fisik/RFS/L0/Perapihan</SelectItem>
                                <SelectItem value="5.2">Kendala - Kabel FO catuan rusak butuh QE</SelectItem>
                                <SelectItem value="5.3">Kendala - OLT full</SelectItem>
                                <SelectItem value="5.4">Kendala - Dependensi Site Belum Ready</SelectItem>
                                <SelectItem value="5.5">Kendala - Dependensi LoP lain</SelectItem>
                                <SelectItem value="5.6">Waiting instalasi ONT</SelectItem>
                                <SelectItem value="5.7">Sudah Submit ABD ke SDI</SelectItem>
                                <SelectItem value="5.8">Revisi ABD</SelectItem>
                              </SelectGroup>
                              <SelectGroup>
                                <SelectLabel>On Air</SelectLabel>
                                <SelectItem value="6.1">OA</SelectItem>
                              </SelectGroup>
                              <SelectGroup>
                                <SelectLabel>Uji Terima</SelectLabel>
                                <SelectItem value="7.1">Surat permohonan uji terima</SelectItem>
                                <SelectItem value="7.2">Penunjukan tim uji terima</SelectItem>
                                <SelectItem value="7.3">Proses uji terima</SelectItem>
                                <SelectItem value="7.4.1">Revisi hasil uji terima</SelectItem>
                                <SelectItem value="7.4.2">Penyusunan dok uji terima dan dok project</SelectItem>
                                <SelectItem value="7.5">Verifikasi Perbaikan Dokument UToleh Tim Pemberi Kerja</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2 mt-2">
                          <Label>Checklist Dokumen / Izin</Label>
                          <div className="pt-2">
                            <Table className="text-[10pt] whitespace-nowrap">
                              <TableHeader className="bg-muted/30">
                                <TableRow>
                                  <TableHead className="font-medium text-foreground w-[120px]">Kategori</TableHead>
                                  <TableHead className="font-medium text-foreground text-center">Tidak ada</TableHead>
                                  <TableHead className="font-medium text-foreground text-center">Surat Masuk</TableHead>
                                  <TableHead className="font-medium text-foreground text-center">Input OSS</TableHead>
                                  <TableHead className="font-medium text-foreground text-center">Survey Bersama PU</TableHead>
                                  <TableHead className="font-medium text-foreground text-center">Bank Garansi</TableHead>
                                  <TableHead className="font-medium text-foreground text-center">Sewa Lahan</TableHead>
                                  <TableHead className="font-medium text-foreground text-center">Rekomtek</TableHead>
                                  <TableHead className="font-medium text-foreground text-center">Izin Prinsip</TableHead>
                                  <TableHead className="font-medium text-foreground text-center">Under Table</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {['PU Nas', 'PU Prov', 'PU Kota / Kab', 'Private Area'].map((category) => (
                                  <TableRow key={category}>
                                    <TableCell className="font-medium py-2">{category}</TableCell>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((col) => (
                                      <TableCell key={col} className="text-center py-2">
                                        <input type="radio" name={`checklist-${category}`} className="w-4 h-4 cursor-pointer accent-primary" />
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>

                      </div>
                      <DialogFooter>
                        <Button type="submit">Simpan Data</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className="p-0">
                  <Table className="text-[10pt] whitespace-nowrap">
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="font-semibold text-foreground px-4">Site ID</TableHead>
                        <TableHead className="font-semibold text-foreground px-4">Status</TableHead>
                        <TableHead className="font-semibold text-foreground px-4">Progress Detail</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">Belum ada data</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

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
                      <CardDescription>Rekapitulasi progress pekerjaan harian proyek.</CardDescription>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={handleExportImage} disabled={isExporting}>
                    <FileText className="w-4 h-4 mr-2" />
                    {exportText}
                  </Button>
                </CardHeader>
                <CardContent className="p-4 space-y-6">
                  {/* Header Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/20 p-4 border rounded-md">
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 items-center gap-2">
                        <Label className="text-[10pt] text-muted-foreground">Nomor Kontrak</Label>
                        <div className="col-span-2 text-[10pt] font-semibold">{project.contractNo || '-'}</div>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-2">
                        <Label className="text-[10pt] text-muted-foreground">Ruas/Link</Label>
                        <div className="col-span-2 text-[10pt] font-semibold">{project.name || '-'}</div>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-2">
                        <Label className="text-[10pt] text-muted-foreground">Witel</Label>
                        <div className="col-span-2 text-[10pt] font-semibold">WITEL SUMBAGSEL</div>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-2">
                        <Label className="text-[10pt] text-muted-foreground">Mitra Pelaksana</Label>
                        <div className="col-span-2 text-[10pt] font-semibold">PT. MITRA AKSES INSANI</div>
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
                        <Label className="text-[10pt] text-muted-foreground">Hujan</Label>
                        <div className="col-span-2 text-[10pt] font-semibold">CERAH</div>
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
                          <TableHead colSpan={7} className="text-center border-r border-b border-border font-semibold text-foreground px-4">SAT012</TableHead>
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
                    <div className="grid grid-cols-[100px_1fr] items-start gap-2 border-t pt-4">
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
                  <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">
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
              <Card className="border-0 shadow-none ring-1 ring-border/50 p-0 gap-0">
                <CardHeader className="bg-muted/10 p-4 border-b"><CardTitle className="text-lg">Evidence Vault</CardTitle></CardHeader>
                <CardContent className="p-4 flex justify-center py-12">
                  <div className="text-center max-w-sm">
                    <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                      <Camera className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Vault Kosong</h3>
                    <p className="text-muted-foreground text-[10pt] mb-6">Galeri foto dan dokumentasi pekerjaan lapangan (galian, penarikan kabel) belum diunggah.</p>
                    <Button><Upload className="w-4 h-4 mr-2" />Upload Dokumentasi</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="issues">
              <Card className="border-0 shadow-none ring-1 ring-border/50 p-0 gap-0">
                <CardHeader className="bg-muted/10 p-4 border-b"><CardTitle className="text-lg">Issue & Risk Control</CardTitle></CardHeader>
                <CardContent className="p-4 flex justify-center py-12">
                  <div className="text-center max-w-sm">
                    <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                      <AlertTriangle className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Tidak Ada Issue Aktif</h3>
                    <p className="text-muted-foreground text-[10pt] mb-6">Pencatatan kendala (issue log) dan mitigasi risiko proyek sedang bersih.</p>
                    <Button variant="outline"><Plus className="w-4 h-4 mr-2" />Laporkan Kendala Baru</Button>
                  </div>
                </CardContent>
              </Card>
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
            <TabsContent value="tests">
              <Card className="border-0 shadow-none ring-1 ring-border/50 p-0 gap-0">
                <CardHeader className="bg-muted/10 p-4 border-b"><CardTitle className="text-lg">OTDR & Power Test Results</CardTitle></CardHeader>
                <CardContent className="p-4 flex justify-center py-12">
                  <div className="text-center max-w-sm">
                    <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                      <Zap className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Hasil Test Belum Tersedia</h3>
                    <p className="text-muted-foreground text-[10pt] mb-6">Unggah hasil pengetesan kabel optik dan validasi redaman untuk direview.</p>
                    <Button><Upload className="w-4 h-4 mr-2" />Upload Laporan OTDR</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="defects">
              <Card className="border-0 shadow-none ring-1 ring-border/50 p-0 gap-0">
                <CardHeader className="bg-muted/10 p-4 border-b"><CardTitle className="text-lg">Defect & Punch List</CardTitle></CardHeader>
                <CardContent className="p-4 flex justify-center py-12">
                  <div className="text-center max-w-sm">
                    <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                      <Wrench className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Tidak Ada Defect</h3>
                    <p className="text-muted-foreground text-[10pt] mb-6">Daftar perbaikan minor (punch list) saat ini kosong.</p>
                    <Button variant="outline"><Plus className="w-4 h-4 mr-2" />Catat Defect Baru</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="acceptance">
              <Card className="border-0 shadow-none ring-1 ring-border/50 p-0 gap-0">
                <CardHeader className="bg-muted/10 p-4 border-b"><CardTitle className="text-lg">BA Acceptance (BA UT)</CardTitle></CardHeader>
                <CardContent className="p-4 flex justify-center py-12">
                  <div className="text-center max-w-sm">
                    <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                      <FileCheck2 className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">BA UT Belum Dibuat</h3>
                    <p className="text-muted-foreground text-[10pt] mb-6">Mulai proses persetujuan Berita Acara Uji Terima secara digital.</p>
                    <Button><Plus className="w-4 h-4 mr-2" />Buat Draft BA UT</Button>
                  </div>
                </CardContent>
              </Card>
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
            <TabsContent value="docs">
              <Card className="border-0 shadow-none ring-1 ring-border/50 p-0 gap-0">
                <CardHeader className="bg-muted/10 p-4 border-b"><CardTitle className="text-lg">As-Built Documentation</CardTitle></CardHeader>
                <CardContent className="p-4 flex justify-center py-12">
                  <div className="text-center max-w-sm">
                    <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                      <Book className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Dokumen ABD Belum Ada</h3>
                    <p className="text-muted-foreground text-[10pt] mb-6">Unggah dokumen As-Built Drawing (ABD) final untuk diserahkan ke operasional.</p>
                    <Button><Upload className="w-4 h-4 mr-2" />Upload Dokumen ABD</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="assets">
              <Card className="border-0 shadow-none ring-1 ring-border/50 p-0 gap-0">
                <CardHeader className="bg-muted/10 p-4 border-b"><CardTitle className="text-lg">Asset Inventory Record</CardTitle></CardHeader>
                <CardContent className="p-4 flex justify-center py-12">
                  <div className="text-center max-w-sm">
                    <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                      <Database className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Aset Belum Tercatat</h3>
                    <p className="text-muted-foreground text-[10pt] mb-6">Catat aset jaringan baru yang telah terbangun untuk disinkronisasi ke Master Data.</p>
                    <Button><Plus className="w-4 h-4 mr-2" />Sinkronisasi Aset</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="profitability">
              <Card className="border-0 shadow-none ring-1 ring-border/50 p-0 gap-0">
                <CardHeader className="bg-muted/10 p-4 border-b"><CardTitle className="text-lg">Final Profitability Report</CardTitle></CardHeader>
                <CardContent className="p-4 flex justify-center py-12">
                  <div className="text-center max-w-sm">
                    <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                      <CircleDollarSign className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Laporan Margin Belum Tersedia</h3>
                    <p className="text-muted-foreground text-[10pt] mb-6">Laporan margin akhir akan membandingkan biaya RAB dengan pengeluaran aktual dari seluruh modul.</p>
                    <Button><PenTool className="w-4 h-4 mr-2" />Generate Laporan P&L</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
