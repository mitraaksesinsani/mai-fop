'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Search,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  FolderKanban,
  FolderX,
  Layers,
  Calendar,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Clock,
  Activity,
  FileText
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from '@/components/ui/table';
import { useProject, Project } from '@/context/ProjectContext';
import {
  DesignatorItem,
  DEFAULT_DESIGNATOR_ITEMS,
  PROGRESS_DATES,
  getVolumeTotal,
  getProgressPercent,
  generateProgressDates,
  formatDisplayDate,
  getItemDailyVolume,
} from '@/lib/designatorProgress';

// Helper untuk menampilkan ID exact yang ringkas dan manusiawi (bukan raw UUID database)
function getProjectDisplayId(p?: Project | null): string {
  if (!p) return '';
  if (p.contractNo && p.contractNo.trim()) {
    const clean = p.contractNo.split(' | ')[0].trim();
    if (clean) return clean;
  }
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(p.id);
  if (!isUuid && p.id) {
    return p.id;
  }
  const numMatch = p.name.match(/\b\d{3,5}\b/);
  if (numMatch) {
    return numMatch[0];
  }
  return p.id ? p.id.substring(0, 8).toUpperCase() : '0001';
}

export default function DashboardPage() {
  const { projects } = useProject();

  // State Hierarki Navigasi Dashboard:
  // Level 1: selectedProject === null (List Project Site)
  // Level 2: selectedProject !== null && selectedDesignator === null (List Seluruh Designator)
  // Level 3: selectedDesignator !== null (Grafik & Tabel Progress Designator)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedDesignator, setSelectedDesignator] = useState<DesignatorItem | null>(null);

  // Filter pencarian
  const [projectSearch, setProjectSearch] = useState('');
  const [designatorSearch, setDesignatorSearch] = useState('');

  // Sinkronisasi data designator proyek terpilih dari Project Master List (localStorage / state)
  const projectDesignators = useMemo(() => {
    if (!selectedProject) return [];
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`proper_project_designators_${selectedProject.id}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed as DesignatorItem[];
          }
        }
      } catch (e) {
        console.error('Failed to parse project designators', e);
      }
    }
    return ((selectedProject as any)?.designatorItems || []) as DesignatorItem[];
  }, [selectedProject]);

  // Update selectedDesignator reference jika projectDesignators berubah
  useEffect(() => {
    if (selectedDesignator && projectDesignators.length > 0) {
      const refreshed = projectDesignators.find(
        (d) => d.idVolume === selectedDesignator.idVolume || d.designator === selectedDesignator.designator
      );
      if (refreshed) {
        setSelectedDesignator(refreshed);
      }
    }
  }, [projectDesignators]);

  // Filter list proyek (Level 1)
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const term = projectSearch.toLowerCase();
      return (
        p.name.toLowerCase().includes(term) ||
        p.id.toLowerCase().includes(term) ||
        p.customer.toLowerCase().includes(term) ||
        (p.location && p.location.toLowerCase().includes(term)) ||
        (p.contractNo && p.contractNo.toLowerCase().includes(term))
      );
    });
  }, [projects, projectSearch]);

  // Filter list designator (Level 2)
  const filteredDesignators = useMemo(() => {
    return projectDesignators.filter((d) => {
      const term = designatorSearch.toLowerCase();
      return (
        d.designator.toLowerCase().includes(term) ||
        d.namaDeskripsi.toLowerCase().includes(term) ||
        d.jenis.toLowerCase().includes(term) ||
        d.satuan.toLowerCase().includes(term)
      );
    });
  }, [projectDesignators, designatorSearch]);

  // Daftar tanggal pemantauan progress
  const progressDates = useMemo(() => {
    return generateProgressDates(selectedProject?.startDate, selectedProject?.targetDate);
  }, [selectedProject?.startDate, selectedProject?.targetDate]);

  // Data perkembangan (chart & tabel) khusus designator yang sedang dipilih (Level 3)
  const designatorProgressionData = useMemo(() => {
    if (!selectedDesignator) return [];

    const targetVolume = selectedDesignator.volumeTarget || selectedDesignator.boqVolume || 0;
    const N = progressDates.length;
    let runningActual = 0;

    return progressDates.map((dateStr, idx) => {
      const dailyVol = getItemDailyVolume(selectedDesignator, dateStr);
      runningActual += dailyVol;

      // Target kurva akumulasi sinusoidal (S-Curve)
      const x = idx / (N - 1 || 1);
      const targetPercent = Math.min(100, Math.max(0, parseFloat((((Math.sin(x * Math.PI - Math.PI / 2) + 1) / 2) * 100).toFixed(2))));
      const targetKumulatifVol = Math.round((targetPercent / 100) * targetVolume);

      const actualPercent = targetVolume > 0
        ? parseFloat(((runningActual / targetVolume) * 100).toFixed(2))
        : 0;

      // Catatan spesifik jika ada di dailyRecords
      const records = selectedDesignator.dailyRecords?.[dateStr] || [];
      const noteParts: string[] = [];
      records.forEach((r) => {
        if (r.alatKerja) noteParts.push(`Alat: ${r.alatKerja}`);
        if (r.mandor) noteParts.push(`Mandor: ${r.mandor}`);
        if (r.span) noteParts.push(`Span: ${r.span}`);
      });
      const notes = noteParts.join(' | ') || (dailyVol > 0 ? 'Pekerjaan berjalan' : '-');

      return {
        no: idx + 1,
        date: dateStr,
        dailyVolume: dailyVol,
        actualCumulative: runningActual,
        targetCumulative: idx === N - 1 ? targetVolume : targetKumulatifVol,
        actualPercent: Math.min(100, actualPercent),
        targetPercent: idx === N - 1 ? 100 : targetPercent,
        notes,
      };
    });
  }, [selectedDesignator, progressDates]);

  // Rekap metrik untuk designator terpilih
  const currentActualVol = selectedDesignator ? getVolumeTotal(selectedDesignator) : 0;
  const targetVol = selectedDesignator ? (selectedDesignator.volumeTarget || selectedDesignator.boqVolume || 0) : 0;
  const currentPct = selectedDesignator ? getProgressPercent(selectedDesignator) : 0;
  const remainingVol = Math.max(0, targetVol - currentActualVol);

  return (
    <div className="space-y-6 animate-fade-in text-[12px]">
      {/* ========================================================================= */}
      {/* LEVEL 1: DAFTAR PROJECT SITE */}
      {/* ========================================================================= */}
      {!selectedProject && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Dashboard Pemantauan Proyek
              </h1>
              <p className="text-muted-foreground text-[12px] mt-1">
                Pilih salah satu project site untuk menelusuri progres fisik dan performa seluruh designator pekerjaannya.
              </p>
            </div>

            <div className="flex items-center gap-2 text-[12px]">
              <div className="bg-muted/40 px-3.5 py-1.5 rounded-lg border border-border/60 flex items-center gap-2">
                <span className="text-muted-foreground">Total Project Site:</span>
                <span className="font-bold text-foreground">{projects.length}</span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari ID, nama proyek, atau klien..."
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                className="pl-9 h-9 text-[12px] bg-background"
              />
            </div>
          </div>

          {/* List Projects */}
          {filteredProjects.length === 0 ? (
            <div className="p-12 text-center border border-dashed rounded-xl bg-card flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-muted/60 flex items-center justify-center mb-3">
                <FolderX className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">Belum Ada Proyek Aktif</h3>
              <p className="text-muted-foreground text-xs max-w-sm">
                Saat ini belum ada data project site yang sedang berjalan atau ditemukan untuk dipantau.
              </p>
            </div>
          ) : (
            <>
              {/* Tampilan Desktop & Tablet (sm ke atas) */}
              <div className="hidden sm:block space-y-3">
                {filteredProjects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedProject(p);
                      setSelectedDesignator(null);
                    }}
                    className="w-full py-5 px-6 bg-card hover:bg-neutral-50 dark:hover:bg-muted/30 border border-border/70 rounded-xl flex items-center justify-between gap-5 transition-all cursor-pointer group shadow-xs hover:border-primary/40"
                  >
                    {/* Info Proyek */}
                    <div className="flex-1 min-w-0 space-y-2 py-0.5">
                      <div className="flex items-center gap-2.5">
                        <span className="font-semibold text-neutral-900 dark:text-foreground text-sm group-hover:text-primary transition-colors">
                          {p.name}
                        </span>
                        <Badge variant="outline" className="text-[10px] font-mono uppercase bg-muted/40">
                          {getProjectDisplayId(p)}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-[11px]">
                        <span>Klien: <strong className="text-foreground font-medium">{p.customer}</strong></span>
                        {p.location && <span>• Lokasi: <strong className="text-foreground font-medium">{p.location}</strong></span>}
                        {p.manager && <span>• PM: <strong className="text-foreground font-medium">{p.manager}</strong></span>}
                      </div>
                    </div>

                    {/* Jadwal & Status */}
                    <div className="flex items-center gap-4 shrink-0 text-[11px]">
                      <div className="text-right">
                        <div className="text-muted-foreground">Mulai: {p.startDate || '-'}</div>
                        <div className="text-muted-foreground">Target: <span className="font-medium text-foreground">{p.targetDate || '-'}</span></div>
                      </div>
                      <Badge variant="secondary" className="text-[11px] px-2.5 py-1 font-medium">
                        {p.status || 'Active'}
                      </Badge>
                      <div className="flex items-center text-primary font-medium text-xs gap-1 group-hover:translate-x-0.5 transition-transform">
                        <span>Pilih Proyek</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tampilan Mobile (~390px): Clean List Item sesuai referensi gambar tanpa icon */}
              <div className="block sm:hidden bg-card border border-border/70 rounded-2xl divide-y divide-border/60 overflow-hidden shadow-xs">
                {filteredProjects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedProject(p);
                      setSelectedDesignator(null);
                    }}
                    className="w-full py-3.5 px-4 flex items-center justify-between gap-3 active:bg-neutral-100 dark:active:bg-muted/60 transition-colors cursor-pointer"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="font-semibold text-[15px] text-neutral-900 dark:text-neutral-100 truncate">
                        {p.name}
                      </div>
                      <div className="text-[13px] text-muted-foreground truncate mt-0.5">
                        {p.customer}{p.location ? ` • ${p.location}` : ''}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-400 dark:text-neutral-500 shrink-0" />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 2: DAFTAR SELURUH DESIGNATOR UNTUK PROYEK TERPILIH */}
      {/* ========================================================================= */}
      {selectedProject && !selectedDesignator && (
        <div className="space-y-6">
          {/* Tombol Kembali & Breadcrumb */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedProject(null);
                  setSelectedDesignator(null);
                }}
                className="h-8 gap-1.5 text-xs cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Daftar Proyek</span>
              </Button>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-2">
                <span>Dashboard</span>
                <span>/</span>
                <span className="font-semibold text-foreground">{selectedProject.name}</span>
                <span>/</span>
                <span className="text-primary font-medium">Pilih Designator</span>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Total Designator: <strong className="text-foreground">{projectDesignators.length} item</strong>
            </div>
          </div>

          {/* Ringkasan Proyek Terpilih */}
          <div className="p-4 bg-muted/20 border rounded-xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground">{selectedProject.name}</h2>
                <Badge variant="outline" className="font-mono text-xs">{getProjectDisplayId(selectedProject)}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Klien: {selectedProject.customer} | Lokasi: {selectedProject.location || '-'} | Periode: {selectedProject.startDate || '-'} s/d {selectedProject.targetDate || '-'}
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari kode atau nama pekerjaan..."
                value={designatorSearch}
                onChange={(e) => setDesignatorSearch(e.target.value)}
                className="pl-8 h-8 text-[12px] bg-background"
              />
            </div>
          </div>

          {/* List Designator */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Daftar Designator Pekerjaan (Klik untuk melihat grafik & perkembangan data)
            </h3>

            {filteredDesignators.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-card">
                Tidak ada designator yang cocok dengan pencarian.
              </div>
            ) : (
              filteredDesignators.map((d) => {
                const total = getVolumeTotal(d);
                const target = d.volumeTarget || d.boqVolume || 0;
                const pct = getProgressPercent(d);

                return (
                  <div
                    key={d.idVolume || d.designator}
                    onClick={() => setSelectedDesignator(d)}
                    className="p-4 bg-card hover:bg-neutral-50 dark:hover:bg-muted/30 border border-border/70 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group transition-all shadow-xs hover:border-primary/40"
                  >
                    {/* Deskripsi & Kode Designator */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                          {d.namaDeskripsi}
                        </span>
                        <Badge variant="outline" className="font-mono text-[10px] bg-muted/30">
                          {d.designator}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {d.jenis}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-3">
                        <span>Bobot: <strong>{d.bobotPersen}%</strong></span>
                        <span>• Satuan: <strong>{d.satuan}</strong></span>
                      </div>
                    </div>

                    {/* Target & Realisasi Volume */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                      <div className="text-left sm:text-right">
                        <div className="text-[11px] sm:text-xs text-muted-foreground">
                          Realisasi: <strong className="text-foreground font-medium">{total.toLocaleString('id-ID')}</strong> / {target.toLocaleString('id-ID')} {d.satuan}
                        </div>
                        <div className="w-28 sm:w-32 bg-muted rounded-full h-1.5 mt-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right min-w-[45px]">
                          <span className={`font-bold text-sm ${pct >= 100 ? 'text-emerald-600' : 'text-foreground'}`}>
                            {pct}%
                          </span>
                        </div>

                        <ChevronRight className="w-4 h-4 text-neutral-400 dark:text-neutral-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 3: GRAFIK & TABEL PERKEMBANGAN DATA DESIGNATOR TERKAIT */}
      {/* ========================================================================= */}
      {selectedProject && selectedDesignator && (
        <div className="space-y-6">
          {/* Tombol Kembali & Breadcrumb */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDesignator(null)}
                className="h-8 gap-1.5 text-xs cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Daftar Designator</span>
              </Button>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-2">
                <button
                  onClick={() => {
                    setSelectedProject(null);
                    setSelectedDesignator(null);
                  }}
                  className="hover:underline"
                >
                  Dashboard
                </button>
                <span>/</span>
                <button
                  onClick={() => setSelectedDesignator(null)}
                  className="hover:underline"
                >
                  {selectedProject.name}
                </button>
                <span>/</span>
                <span className="font-semibold text-foreground">{selectedDesignator.designator}</span>
              </div>
            </div>

            <Badge variant="secondary" className="text-xs px-2.5 py-1">
              Fokus Pekerjaan: {selectedDesignator.jenis}
            </Badge>
          </div>

          {/* Info Header Designator Terpilih */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-foreground">
                  {selectedDesignator.namaDeskripsi}
                </h1>
                <Badge variant="outline" className="font-mono text-xs">
                  {selectedDesignator.designator}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Proyek: {selectedProject.name} ({getProjectDisplayId(selectedProject)}) | Bobot Pekerjaan Proyek: {selectedDesignator.bobotPersen}%
              </p>
            </div>

            {/* Kartu Ringkasan Metrik */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-card border rounded-xl">
                <div className="text-xs text-muted-foreground">Target Volume</div>
                <div className="text-lg font-bold text-foreground mt-1">
                  {targetVol.toLocaleString('id-ID')} <span className="text-xs font-normal text-muted-foreground">{selectedDesignator.satuan}</span>
                </div>
              </div>

              <div className="p-3.5 bg-card border rounded-xl">
                <div className="text-xs text-muted-foreground">Realisasi Aktual</div>
                <div className="text-lg font-bold text-emerald-600 mt-1">
                  {currentActualVol.toLocaleString('id-ID')} <span className="text-xs font-normal text-muted-foreground">{selectedDesignator.satuan}</span>
                </div>
              </div>

              <div className="p-3.5 bg-card border rounded-xl">
                <div className="text-xs text-muted-foreground">Capaian Fisik</div>
                <div className="text-lg font-bold text-foreground mt-1">
                  {currentPct}%
                </div>
              </div>

              <div className="p-3.5 bg-card border rounded-xl">
                <div className="text-xs text-muted-foreground">Sisa Volume</div>
                <div className="text-lg font-bold text-neutral-600 dark:text-neutral-300 mt-1">
                  {remainingVol.toLocaleString('id-ID')} <span className="text-xs font-normal text-muted-foreground">{selectedDesignator.satuan}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* GRAFIK PERKEMBANGAN DATA DESIGNATOR */}
          {/* ===================================================================== */}
          <Card className="border rounded-xl shadow-xs overflow-hidden">
            <CardHeader className="p-4 border-b bg-muted/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Grafik Perkembangan Volume & Capaian Designator
                  </CardTitle>
                  <CardDescription className="text-[11px] mt-0.5">
                    Grafik kumulatif per hari menunjukkan perbandingan target rencana vs realisasi aktual pekerjaan {selectedDesignator.designator}.
                  </CardDescription>
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  Satuan: {selectedDesignator.satuan}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-6">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={designatorProgressionData}
                    margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      tickLine={false}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickFormatter={(val) => formatDisplayDate(val).label}
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      tickLine={false}
                      axisLine={{ stroke: '#cbd5e1' }}
                      label={{
                        value: `Volume (${selectedDesignator.satuan})`,
                        angle: -90,
                        position: 'insideLeft',
                        fontSize: 10,
                        fill: '#64748b'
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '11px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                      }}
                      formatter={(val: any, name: any) => {
                        const num = Number(val) || 0;
                        if (name === 'Target Kumulatif') return [`${num.toLocaleString('id-ID')} ${selectedDesignator.satuan}`, name];
                        if (name === 'Realisasi Kumulatif') return [`${num.toLocaleString('id-ID')} ${selectedDesignator.satuan}`, name];
                        if (name === 'Volume Harian') return [`${num.toLocaleString('id-ID')} ${selectedDesignator.satuan}`, name];
                        return [val, name];
                      }}
                      labelFormatter={(label) => `Tanggal: ${formatDisplayDate(String(label)).fullDate}`}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

                    {/* Bar Volume Harian */}
                    <Bar
                      yAxisId="left"
                      dataKey="dailyVolume"
                      name="Volume Harian"
                      fill="#93c5fd"
                      opacity={0.8}
                      radius={[4, 4, 0, 0]}
                    />

                    {/* Area & Garis Target Rencana */}
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="targetCumulative"
                      name="Target Kumulatif"
                      stroke="#2563eb"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      fill="#dbeafe"
                      fillOpacity={0.2}
                    />

                    {/* Garis Realisasi Aktual */}
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="actualCumulative"
                      name="Realisasi Kumulatif"
                      stroke="#059669"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#059669' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* ===================================================================== */}
          {/* TABEL PERKEMBANGAN DATA PROGRESS DESIGNATOR */}
          {/* ===================================================================== */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-primary" />
                <span className="hidden sm:inline">Tabel Progres Pekerjaan Designator</span>
                <span className="inline sm:hidden">Daftar Progres Pekerjaan Designator</span>
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Data terperinci perkembangan volume harian dan akumulasi per tanggal untuk designator {selectedDesignator.designator}.
              </p>
            </div>

            {/* Tabel untuk Layar Desktop / Tablet */}
            <div className="hidden sm:block border rounded-xl overflow-hidden bg-card shadow-xs">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="w-12 text-center text-xs">No</TableHead>
                    <TableHead className="text-xs">Tanggal</TableHead>
                    <TableHead className="text-right text-xs">Target Kumulatif ({selectedDesignator.satuan})</TableHead>
                    <TableHead className="text-right text-xs">Volume Harian ({selectedDesignator.satuan})</TableHead>
                    <TableHead className="text-right text-xs">Realisasi Kumulatif ({selectedDesignator.satuan})</TableHead>
                    <TableHead className="text-right text-xs">% Capaian</TableHead>
                    <TableHead className="text-xs">Keterangan / Catatan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {designatorProgressionData.map((row) => (
                    <TableRow key={row.date} className="hover:bg-muted/10 transition-colors">
                      <TableCell className="text-center font-mono text-xs text-muted-foreground">
                        {row.no}
                      </TableCell>
                      <TableCell className="font-medium text-xs">
                        {formatDisplayDate(row.date).fullDate}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">
                        {row.targetCumulative.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {row.dailyVolume > 0 ? (
                          <span className="font-semibold text-primary">+{row.dailyVolume.toLocaleString('id-ID')}</span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-semibold text-emerald-600">
                        {row.actualCumulative.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        <span className={row.actualPercent >= row.targetPercent ? 'text-emerald-600 font-semibold' : 'text-neutral-700 dark:text-neutral-300'}>
                          {row.actualPercent}%
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                        {row.notes}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter className="bg-muted/40 font-semibold text-xs">
                  <TableRow>
                    <TableCell colSpan={2} className="text-foreground">Total Rekapitulasi</TableCell>
                    <TableCell className="text-right font-mono text-foreground">
                      {targetVol.toLocaleString('id-ID')} {selectedDesignator.satuan}
                    </TableCell>
                    <TableCell className="text-right font-mono text-foreground">-</TableCell>
                    <TableCell className="text-right font-mono text-emerald-600">
                      {currentActualVol.toLocaleString('id-ID')} {selectedDesignator.satuan}
                    </TableCell>
                    <TableCell className="text-right font-mono text-emerald-600">
                      {currentPct}%
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {currentActualVol >= targetVol ? 'Pekerjaan Selesai 100%' : `Sisa ${remainingVol.toLocaleString('id-ID')} ${selectedDesignator.satuan}`}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>

            {/* Tampilan List untuk Layar Mobile (~390px) */}
            <div className="block sm:hidden space-y-2.5">
              {designatorProgressionData.map((row) => (
                <div
                  key={row.date}
                  className="p-3.5 bg-card border border-border/70 rounded-xl space-y-2.5 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                        #{row.no}
                      </span>
                      <span className="font-semibold text-xs text-foreground">
                        {formatDisplayDate(row.date).fullDate}
                      </span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      row.actualPercent >= row.targetPercent
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : 'bg-muted text-foreground'
                    }`}>
                      {row.actualPercent}% Capaian
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border/50 text-[11px]">
                    <div>
                      <div className="text-muted-foreground text-[10px]">Harian</div>
                      <div className="font-semibold text-foreground mt-0.5 font-mono">
                        {row.dailyVolume > 0 ? (
                          <span className="text-primary">+{row.dailyVolume.toLocaleString('id-ID')}</span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-[10px]">Realisasi Kum.</div>
                      <div className="font-semibold text-emerald-600 mt-0.5 font-mono">
                        {row.actualCumulative.toLocaleString('id-ID')}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-[10px]">Target Kum.</div>
                      <div className="font-medium text-muted-foreground mt-0.5 font-mono">
                        {row.targetCumulative.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>

                  {row.notes && (
                    <div className="text-[10px] text-muted-foreground bg-muted/20 px-2 py-1 rounded border border-border/30">
                      {row.notes}
                    </div>
                  )}
                </div>
              ))}

              {/* Rekapitulasi Total Mobile */}
              <div className="p-3.5 bg-muted/30 border border-border rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between font-semibold text-foreground">
                  <span>Total Rekapitulasi</span>
                  <span className="text-emerald-600 font-bold">{currentPct}%</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Total Realisasi: </span>
                    <strong className="text-emerald-600 font-mono">{currentActualVol.toLocaleString('id-ID')} {selectedDesignator.satuan}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Target: </span>
                    <strong className="text-foreground font-mono">{targetVol.toLocaleString('id-ID')} {selectedDesignator.satuan}</strong>
                  </div>
                </div>
                <div className="text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                  {currentActualVol >= targetVol ? 'Pekerjaan Selesai 100%' : `Sisa ${remainingVol.toLocaleString('id-ID')} ${selectedDesignator.satuan}`}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
