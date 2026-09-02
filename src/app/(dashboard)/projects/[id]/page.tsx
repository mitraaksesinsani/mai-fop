'use client';

import { useParams, useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useRef } from 'react';
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

  // Export State
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const [exportText, setExportText] = useState('Copy Data');

  const handleExportImage = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    setExportText('Menyalin...');
    try {
      const blob = await htmlToImage.toBlob(reportRef.current, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
      });
      
      if (blob) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setExportText('Tersalin!');
          setTimeout(() => setExportText('Copy Data'), 3000);
        } catch (err) {
          console.error('Gagal menyalin gambar', err);
          setExportText('Gagal Menyalin');
          setTimeout(() => setExportText('Copy Data'), 3000);
        }
      } else {
        throw new Error('Blob is null');
      }
    } catch (err) {
      console.error('Gagal membuat gambar', err);
      setExportText('Gagal Export');
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
          <p className="text-muted-foreground text-sm mt-1">
            Project ID: {project.id}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList variant="line" className="inline-flex w-fit max-w-full flex-wrap justify-start border-b rounded-none px-0 h-auto gap-x-6 gap-y-2 mb-6">
          <TabsTrigger value="overview" className="pb-3 pt-2 px-1 rounded-none text-sm flex-none">Overview</TabsTrigger>
          <TabsTrigger value="planning" className="pb-3 pt-2 px-1 rounded-none text-sm flex-none">Planning</TabsTrigger>
          <TabsTrigger value="implementation" className="pb-3 pt-2 px-1 rounded-none text-sm flex-none">Implementation</TabsTrigger>
          <TabsTrigger value="commissioning" className="pb-3 pt-2 px-1 rounded-none text-sm flex-none">Commissioning</TabsTrigger>
          <TabsTrigger value="closing" className="pb-3 pt-2 px-1 rounded-none text-sm flex-none">Closing & Handover</TabsTrigger>
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
                        <div className="text-sm text-muted-foreground mb-1">Customer / Client</div>
                        <div className="font-medium text-foreground">{project.customer}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Tipe Proyek</div>
                        <div className="font-medium text-foreground">{project.type}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Lokasi Pekerjaan</div>
                        <div className="font-medium text-foreground">{project.location || '-'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Nomor Kontrak</div>
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
                      <p className="text-muted-foreground text-sm mb-4">Ruang lingkup belum ditambahkan</p>
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
                      <div className="text-sm text-muted-foreground mb-1">Mulai (Start Date)</div>
                      <div className="font-medium text-foreground">{project.startDate || '-'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Target Selesai</div>
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
                      <div className="text-sm text-muted-foreground mb-1">Project Manager (PIC)</div>
                      <div className="font-medium text-foreground">{project.manager || '-'}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Status Kemajuan Fase Proyek (Project Phase Status) */}
            <Card className="border-0 shadow-none ring-1 ring-border/50 p-0 gap-0">
              <CardHeader className="bg-muted/10 p-4 border-b">
                <CardTitle className="text-lg">Status & Kemajuan Fase Proyek</CardTitle>
                <CardDescription>Ringkasan status pekerjaan dari perencanaan hingga serah terima.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 bg-muted/5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Phase 1 */}
                  <div className="p-4 rounded-xl border bg-card hover:shadow-sm transition-all relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                          <Activity className="w-4 h-4" />
                        </div>
                        <div className="font-semibold">Engineering Planning</div>
                      </div>
                      <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400">Aktif</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total BOQ:</span>
                        <span className="font-medium">{project.boqItems?.length || 0} Items</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Est. Nilai RAB:</span>
                        <span className="font-medium">Rp {((project.boqItems || []).reduce((sum, item) => sum + (item.quantity * item.price), 0)).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Panjang Rute:</span>
                        <span className="font-medium">24.5 km</span>
                      </div>
                    </div>
                  </div>

                  {/* Phase 2 */}
                  <div className="p-4 rounded-xl border bg-card hover:shadow-sm transition-all relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                          <ClipboardCheck className="w-4 h-4" />
                        </div>
                        <div className="font-semibold">Survey Management</div>
                      </div>
                      <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400">Pending</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Titik Koordinat:</span>
                        <span className="font-medium text-amber-600">Menunggu</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">File KML/KMZ:</span>
                        <span className="font-medium">Belum Diunggah</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status Izin:</span>
                        <span className="font-medium text-amber-600">Draft</span>
                      </div>
                    </div>
                  </div>

                  {/* Phase 3 */}
                  <div className="p-4 rounded-xl border bg-card hover:shadow-sm transition-all relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-slate-300 dark:bg-slate-700"></div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                          <FileCheck className="w-4 h-4" />
                        </div>
                        <div className="font-semibold text-muted-foreground group-hover:text-foreground transition-colors">DRM Approval</div>
                      </div>
                      <Badge variant="outline" className="text-slate-500 border-slate-200 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700">Not Started</Badge>
                    </div>
                    <div className="space-y-2 text-sm opacity-60">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tanggal Submit:</span>
                        <span className="font-medium">-</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Reviewer:</span>
                        <span className="font-medium">-</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status Dokumen:</span>
                        <span className="font-medium">N/A</span>
                      </div>
                    </div>
                  </div>

                  {/* Phase 4 */}
                  <div className="p-4 rounded-xl border bg-card hover:shadow-sm transition-all relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-slate-300 dark:bg-slate-700"></div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                          <Hammer className="w-4 h-4" />
                        </div>
                        <div className="font-semibold text-muted-foreground group-hover:text-foreground transition-colors">Implementation</div>
                      </div>
                      <Badge variant="outline" className="text-slate-500 border-slate-200 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700">Not Started</Badge>
                    </div>
                    <div className="space-y-2 text-sm opacity-60">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Progress Fisik:</span>
                        <span className="font-medium">0%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tim Instalasi:</span>
                        <span className="font-medium">-</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Issue Terbuka:</span>
                        <span className="font-medium">0</span>
                      </div>
                    </div>
                  </div>

                  {/* Phase 5 */}
                  <div className="p-4 rounded-xl border bg-card hover:shadow-sm transition-all relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-slate-300 dark:bg-slate-700"></div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div className="font-semibold text-muted-foreground group-hover:text-foreground transition-colors">Commissioning</div>
                      </div>
                      <Badge variant="outline" className="text-slate-500 border-slate-200 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700">Not Started</Badge>
                    </div>
                    <div className="space-y-2 text-sm opacity-60">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hasil Tes OTDR:</span>
                        <span className="font-medium">-</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Defect:</span>
                        <span className="font-medium">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">BA Uji Terima:</span>
                        <span className="font-medium">-</span>
                      </div>
                    </div>
                  </div>

                  {/* Phase 6 */}
                  <div className="p-4 rounded-xl border bg-card hover:shadow-sm transition-all relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-slate-300 dark:bg-slate-700"></div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                          <Flag className="w-4 h-4" />
                        </div>
                        <div className="font-semibold text-muted-foreground group-hover:text-foreground transition-colors">Closing & Handover</div>
                      </div>
                      <Badge variant="outline" className="text-slate-500 border-slate-200 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700">Not Started</Badge>
                    </div>
                    <div className="space-y-2 text-sm opacity-60">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tgl Handover:</span>
                        <span className="font-medium">-</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Final CAPEX:</span>
                        <span className="font-medium">-</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status BAST:</span>
                        <span className="font-medium">-</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="planning" className="mt-0">
          <Tabs value={planningTab} onValueChange={(v) => handleSubTabChange('planningTab', v)} className="w-full">
            <TabsList className="mb-4 flex-wrap justify-start h-auto gap-2">
              <TabsTrigger value="boq" className="flex-none">BOQ Management</TabsTrigger>
              <TabsTrigger value="commercial" className="flex-none">Commercial & Margin</TabsTrigger>
              <TabsTrigger value="survey" className="flex-none">Survey</TabsTrigger>
              <TabsTrigger value="review" className="flex-none">Design Review & Decision</TabsTrigger>
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
                      <p className="text-muted-foreground text-sm mb-6">Proyek ini belum memiliki daftar material dan Bill of Quantities. Silakan buat baru atau import dari Excel.</p>
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
                              <TableHead className="font-normal text-xs text-muted-foreground">Nama Material</TableHead>
                              <TableHead className="font-normal text-xs text-muted-foreground">Qty</TableHead>
                              <TableHead className="font-normal text-xs text-muted-foreground">Satuan</TableHead>
                              <TableHead className="font-normal text-xs text-muted-foreground">Harga Satuan</TableHead>
                              <TableHead className="font-normal text-xs text-muted-foreground">Total Harga</TableHead>
                              <TableHead className="font-normal text-xs text-muted-foreground text-right">{isEditingBOQ ? '' : 'Action'}</TableHead>
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
                                    <Button variant="outline" size="sm" className="rounded-full h-8 px-4 text-xs font-medium">
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
                                    <SelectTrigger className="h-8 text-xs border-dashed w-[220px]">
                                      <SelectValue placeholder="Pilih dari Master Data..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {MASTER_MATERIALS.map((mat) => (
                                        <SelectItem key={mat.name} value={mat.name} className="text-xs">
                                          {mat.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell className="py-2">
                                  <Input type="number" value={newBOQItem.quantity || ''} onChange={e => setNewBOQItem({ ...newBOQItem, quantity: parseInt(e.target.value) || 0 })} className="h-8 text-xs w-20 border-dashed" />
                                </TableCell>
                                <TableCell className="py-2 text-foreground/80">
                                  <div className="flex h-8 items-center text-xs px-3 bg-muted/30 border border-dashed rounded-md w-20">{newBOQItem.unit || '-'}</div>
                                </TableCell>
                                <TableCell className="py-2 text-foreground/80">
                                  <div className="flex h-8 items-center text-xs px-3 bg-muted/30 border border-dashed rounded-md">Rp {(newBOQItem.price || 0).toLocaleString()}</div>
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
                            <span className="text-sm text-muted-foreground mr-4">Total Estimasi BOQ:</span>
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
                      <p className="text-muted-foreground text-sm mb-6">Buat analisa margin awal untuk memproyeksikan biaya, pendapatan, dan profitabilitas proyek.</p>
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
                            <p className="text-sm text-muted-foreground mb-1">Total CAPEX</p>
                            <p className="text-xl font-semibold">Rp {(totalBOQ + (project.commercial?.capex || 0)).toLocaleString()}</p>
                            <div className="mt-3 space-y-1">
                              <p className="text-xs text-muted-foreground flex justify-between"><span>BOQ Material:</span> <span>Rp {totalBOQ.toLocaleString()}</span></p>
                              <p className="text-xs text-muted-foreground flex justify-between"><span>Biaya Tambahan:</span> <span>Rp {(project.commercial?.capex || 0).toLocaleString()}</span></p>
                            </div>
                          </div>
                          <div className="bg-muted/20 p-4 rounded-md border">
                            <p className="text-sm text-muted-foreground mb-1">Estimasi OPEX</p>
                            <p className="text-xl font-semibold">Rp {(project.commercial?.opex || 0).toLocaleString()}/bln</p>
                          </div>
                          <div className="bg-muted/20 p-4 rounded-md border">
                            <p className="text-sm text-muted-foreground mb-1">Proyeksi Pendapatan</p>
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
                      <p className="text-muted-foreground text-sm mb-6">Data koordinat dan catuan fiber belum tersedia. Anda dapat mendeskripsikan rute secara manual atau mengunggah data geospasial.</p>
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
                    <p className="text-muted-foreground text-sm mb-6">Form validasi hasil survey lapangan oleh tim belum diisi.</p>
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
                    <p className="text-muted-foreground text-sm mb-6">Integrasi file KML/KMZ untuk verifikasi koordinat rute hasil survey lapangan.</p>
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
                            <Table className="text-xs whitespace-nowrap">
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
                  <Table className="text-sm whitespace-nowrap">
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
              <Card className="border-0 shadow-none ring-1 ring-border/50 p-0 gap-0">
                <CardHeader className="bg-muted/10 p-4 border-b"><CardTitle className="text-lg">Design Review & Decision</CardTitle></CardHeader>
                <CardContent className="p-4 flex justify-center py-12">
                  <div className="text-center max-w-sm">
                    <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                      <Search className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">DRM Belum Diajukan</h3>
                    <p className="text-muted-foreground text-sm mb-6">Ajukan dokumen desain untuk mendapatkan persetujuan (DRM) sebelum tahap implementasi dimulai.</p>
                    <Button><Plus className="w-4 h-4 mr-2" />Ajukan Review DRM</Button>
                  </div>
                </CardContent>
              </Card>
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
                    <p className="text-muted-foreground text-sm mb-6">Kunci BOQ dan rute acuan agar tidak dapat diubah tanpa persetujuan khusus, setelah DRM disetujui.</p>
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
              <Card ref={reportRef} className="border-0 shadow-none ring-1 ring-border/50 p-0 gap-0 bg-card">
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
                        <Label className="text-sm text-muted-foreground">Nomor Kontrak</Label>
                        <div className="col-span-2 text-sm font-semibold">{project.contractNo || '-'}</div>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-2">
                        <Label className="text-sm text-muted-foreground">Ruas/Link</Label>
                        <div className="col-span-2 text-sm font-semibold">{project.name || '-'}</div>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-2">
                        <Label className="text-sm text-muted-foreground">Witel</Label>
                        <div className="col-span-2 text-sm font-semibold">WITEL SUMBAGSEL</div>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-2">
                        <Label className="text-sm text-muted-foreground">Mitra Pelaksana</Label>
                        <div className="col-span-2 text-sm font-semibold">PT. MITRA AKSES INSANI</div>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-2">
                        <Label className="text-sm text-muted-foreground">Jumlah Tenaga Kerja</Label>
                        <div className="col-span-2 text-sm font-semibold">26 Orang</div>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-2">
                        <Label className="text-sm text-muted-foreground">Jumlah Alat Berat</Label>
                        <div className="col-span-2 text-sm font-semibold">-</div>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-2">
                        <Label className="text-sm text-muted-foreground">Hujan</Label>
                        <div className="col-span-2 text-sm font-semibold">CERAH</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 items-center gap-2">
                        <Label className="text-sm text-muted-foreground">Tanggal Update</Label>
                        <div className="col-span-2 text-sm font-semibold">1-Sep-2026</div>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-2">
                        <Label className="text-sm text-muted-foreground">Minggu Ke</Label>
                        <div className="col-span-2 text-sm font-semibold">1</div>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-2">
                        <Label className="text-sm text-muted-foreground">Mulai Kerja</Label>
                        <div className="col-span-2 text-sm font-semibold">22-Okt-2025</div>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-2">
                        <Label className="text-sm text-muted-foreground">TOC Akhir</Label>
                        <div className="col-span-2 text-sm font-semibold">-</div>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-2">
                        <Label className="text-sm text-muted-foreground">Sisa Hari Kalender</Label>
                        <div className="col-span-2 text-sm font-semibold">-46266</div>
                      </div>
                    </div>
                  </div>

                  {/* Table Rekapitulasi */}
                  <div className="mt-6 overflow-x-auto w-full">
                    <Table className="text-sm whitespace-nowrap">
                      <TableHeader className="bg-muted/30">
                        <TableRow>
                          <TableHead rowSpan={2} className="text-left border-r align-middle font-semibold text-foreground px-4">
                            Lokasi<br />Pekerjaan/Posisi
                          </TableHead>
                          <TableHead colSpan={7} className="text-center border-r border-b font-semibold text-foreground px-4">SAT012</TableHead>
                          <TableHead rowSpan={2} className="align-middle text-center font-semibold text-foreground bg-muted/40 px-4">
                            Volume<br />Sisa Pekerjaan
                          </TableHead>
                        </TableRow>
                        <TableRow>
                          <TableHead className="text-center text-sm border-r px-4">Volume Kemarin</TableHead>
                          <TableHead className="text-center text-sm border-r px-4">Satuan</TableHead>
                          <TableHead className="text-center text-sm border-r bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 px-4">Rencana Hari Ini</TableHead>
                          <TableHead className="text-center text-sm border-r bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 px-4">Volume Hari Ini</TableHead>
                          <TableHead className="text-center text-sm border-r bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 px-4">Satuan</TableHead>
                          <TableHead className="text-center text-sm border-r px-4">Volume Sekarang</TableHead>
                          <TableHead className="text-center text-sm border-r px-4">Volume BOQ</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {['Pekerjaan Galian', 'Pekerjaan Jembatan', 'Pekerjaan Handhole (HH)', 'Progres Penarikan Kabel', 'Penyambungan/Jointing'].map((job, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="text-left font-medium border-r px-4 py-3">{job}</TableCell>
                            <TableCell className="border-r px-4 py-3 text-center">0</TableCell>
                            <TableCell className="border-r text-center text-muted-foreground px-4 py-3">{idx === 2 || idx === 4 ? (idx===4?'Titik':'Unit') : 'Meter'}</TableCell>
                            <TableCell className="border-r px-4 py-3 bg-red-50/50 dark:bg-red-950/10 text-center font-medium">0</TableCell>
                            <TableCell className="border-r px-4 py-3 bg-red-50/50 dark:bg-red-950/10 text-center font-medium">0</TableCell>
                            <TableCell className="border-r text-center text-muted-foreground bg-red-50/50 dark:bg-red-950/10 px-4 py-3">{idx === 2 || idx === 4 ? (idx===4?'Titik':'Unit') : 'Meter'}</TableCell>
                            <TableCell className="border-r px-4 py-3 text-center">0</TableCell>
                            <TableCell className="border-r px-4 py-3 text-center">0</TableCell>
                            <TableCell className="px-4 py-3 bg-muted/20 text-center font-medium">0</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Kendala & Solusi */}
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-[100px_1fr] items-start gap-2 border-t pt-4">
                      <Label className="text-sm font-semibold text-muted-foreground mt-1">Kendala</Label>
                      <div className="text-sm leading-relaxed">-</div>
                    </div>
                    <div className="grid grid-cols-[100px_1fr] items-start gap-2">
                      <Label className="text-sm font-semibold text-muted-foreground mt-1">Solusi</Label>
                      <div className="text-sm leading-relaxed">-</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="progress">
              <Card className="border-0 shadow-none ring-1 ring-border/50 p-0 gap-0">
                <CardHeader className="bg-muted/10 p-4 border-b flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Progress Pekerjaan</CardTitle>
                    <CardDescription>Listing dan input progress harian (Tarik Kabel, Tanam Tiang, dsb).</CardDescription>
                  </div>
                  <Button size="sm"><Plus className="w-4 h-4 mr-2" />Tambah Progress</Button>
                </CardHeader>
                <CardContent className="p-0 [&_div[data-slot=table-container]]:border-0 [&_div[data-slot=table-container]]:rounded-none">
                  <div className="overflow-x-auto">
                    <Table className="text-sm whitespace-nowrap">
                      <TableHeader className="bg-muted/30">
                        <TableRow>
                          <TableHead className="font-semibold text-foreground px-4">TANGGAL</TableHead>
                          <TableHead className="font-semibold text-foreground px-4">ID PROJECT</TableHead>
                          <TableHead className="font-semibold text-foreground px-4">PROJECT NAME</TableHead>
                          <TableHead className="font-semibold text-foreground px-4">DESIGNATOR</TableHead>
                          <TableHead className="font-semibold text-foreground px-4 text-right">VOLUME</TableHead>
                          <TableHead className="font-semibold text-foreground px-4">SATUAN</TableHead>
                          <TableHead className="font-semibold text-foreground px-4">ALAT KERJA</TableHead>
                          <TableHead className="font-semibold text-foreground px-4 text-right">JUMLAH TENAGA</TableHead>
                          <TableHead className="font-semibold text-foreground px-4">MANDOR</TableHead>
                          <TableHead className="font-semibold text-foreground px-4">SPAN</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[
                          { date: '01/09/26', id: 'ID009', name: 'TJB002', desig: 'AC-OF-SM-ADSS-24D', vol: '398', unit: 'meter', alat: 'Manual', tenaga: '20', mandor: 'Jagar', span: 'JT01 - JT02' },
                          { date: '01/09/26', id: 'ID009', name: 'TJB002', desig: 'AC-OF-SM-ADSS-24D', vol: '1.200', unit: 'meter', alat: 'Manual', tenaga: '20', mandor: 'Jagar', span: 'JT01 - JT02' },
                          { date: '01/09/26', id: 'ID009', name: 'TJB002', desig: 'AC-OF-SM-ADSS-24D', vol: '1.300', unit: 'meter', alat: 'Manual', tenaga: '20', mandor: 'Jagar', span: 'JT01 - JT02' },
                          { date: '01/09/26', id: 'ID009', name: 'TJB002', desig: 'PU-S7.0-140', vol: '16', unit: 'btg', alat: 'Manual', tenaga: '20', mandor: 'Jagar', span: 'JT01 - JT02' },
                          { date: '01/09/26', id: 'ID009', name: 'TJB002', desig: 'AC-OF-SM-ADSS-24D', vol: '700', unit: 'meter', alat: 'Manual', tenaga: '20', mandor: 'Jagar', span: 'JT01 - JT02' },
                          { date: '01/09/26', id: 'ID009', name: 'TJB002', desig: 'PU-S7.0-140', vol: '12', unit: 'btg', alat: 'Manual', tenaga: '20', mandor: 'Jagar', span: 'JT01 - JT02' },
                          { date: '01/09/26', id: 'ID009', name: 'TJB002', desig: 'PU-S7.0-140', vol: '6', unit: 'btg', alat: 'Manual', tenaga: '20', mandor: 'Jagar', span: 'JT01 - JT02' },
                          { date: '01/09/26', id: 'ID009', name: 'TJB002', desig: 'PU-S7.0-140', vol: '7', unit: 'btg', alat: 'Manual', tenaga: '20', mandor: 'Jagar', span: 'JT01 - JT02' },
                        ].map((row, i) => (
                          <TableRow key={i}>
                            <TableCell className="px-4">{row.date}</TableCell>
                            <TableCell className="px-4">{row.id}</TableCell>
                            <TableCell className="px-4">{row.name}</TableCell>
                            <TableCell className="px-4"><Badge variant="secondary" className="font-mono text-xs">{row.desig}</Badge></TableCell>
                            <TableCell className="px-4 text-right font-medium">{row.vol}</TableCell>
                            <TableCell className="px-4 text-muted-foreground">{row.unit}</TableCell>
                            <TableCell className="px-4">{row.alat}</TableCell>
                            <TableCell className="px-4 text-right">{row.tenaga}</TableCell>
                            <TableCell className="px-4">{row.mandor}</TableCell>
                            <TableCell className="px-4">{row.span}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Edit className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
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
                    <p className="text-muted-foreground text-sm mb-6">Galeri foto dan dokumentasi pekerjaan lapangan (galian, penarikan kabel) belum diunggah.</p>
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
                    <p className="text-muted-foreground text-sm mb-6">Pencatatan kendala (issue log) dan mitigasi risiko proyek sedang bersih.</p>
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
                    <p className="text-muted-foreground text-sm mb-6">Unggah hasil pengetesan kabel optik dan validasi redaman untuk direview.</p>
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
                    <p className="text-muted-foreground text-sm mb-6">Daftar perbaikan minor (punch list) saat ini kosong.</p>
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
                    <p className="text-muted-foreground text-sm mb-6">Mulai proses persetujuan Berita Acara Uji Terima secara digital.</p>
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
                    <p className="text-muted-foreground text-sm mb-6">Unggah dokumen As-Built Drawing (ABD) final untuk diserahkan ke operasional.</p>
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
                    <p className="text-muted-foreground text-sm mb-6">Catat aset jaringan baru yang telah terbangun untuk disinkronisasi ke Master Data.</p>
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
                    <p className="text-muted-foreground text-sm mb-6">Laporan margin akhir akan membandingkan biaya RAB dengan pengeluaran aktual dari seluruh modul.</p>
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
