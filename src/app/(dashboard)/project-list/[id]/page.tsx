'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  Clock,
} from 'lucide-react';

// Fallback null component untuk menangani stale browser cache / Turbopack HMR transitions
const ArrowLeft = () => null;
const FolderKanban = () => null;
const Search = () => null;
const Plus = () => null;
const CheckCircle2 = () => null;
const AlertCircle = () => null;
const ArrowRight = () => null;
const Sparkles = () => null;
const List = () => null;
const LayoutGrid = () => null;
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import StatusBadge from '@/components/shared/StatusBadge';
import SCurveChart from '@/components/projects/SCurveChart';
import { useProject, Project } from '@/context/ProjectContext';
import {
  DesignatorItem,
  SatuanPekerjaan,
  JenisPekerjaan,
  DEFAULT_DESIGNATOR_ITEMS,
  getGroupSummaryList,
  calculateGroupProgress,
  generateGroupSCurveData,
  calculateOverallProjectProgress,
  generateSCurveData,
  generateProgressDates,
  getProgressPercent,
  getVolumeTotal,
  getItemDailyVolume,
  toISODateString,
} from '@/lib/designatorProgress';
import { MASTER_ALAT_KERJA_DATA } from '@/lib/constants/masterData';
import { toast } from 'sonner';

const SATUAN_OPTIONS: SatuanPekerjaan[] = [
  'Meter',
  'pcs',
  'core',
  'set',
  'unit',
  'node',
  'track',
  'm3',
  'titik',
  'lumpsum',
  'batang',
  'link',
  'dokumen',
];

export default function ProjectDetailPreviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { projects } = useProject();

  const decodedId = decodeURIComponent(params?.id || '');
  const selectedGroup = searchParams.get('group') || null;

  // Cari data proyek
  const foundProject = projects.find((p) => p.id === decodedId);
  const project: Project = foundProject || {
    id: decodedId,
    name: `Proyek Fiber Optik (${decodedId.slice(0, 8)})`,
    customer: 'PT Telkomsel Tbk',
    type: 'Backbone Fiber',
    location: 'Wilayah Operasional',
    contractNo: `CTR/FO/${decodedId.slice(0, 8).toUpperCase()}/2026`,
    startDate: '2026-09-01',
    targetDate: '2026-09-30',
    manager: 'Budi Santoso, S.T.',
    status: 'Implementation',
  };

  // State designator items dengan fallback DEFAULT_DESIGNATOR_ITEMS
  const [designatorItems, setDesignatorItems] = useState<DesignatorItem[]>(() => {
    return (foundProject as any)?.designatorItems?.length
      ? (foundProject as any).designatorItems
      : DEFAULT_DESIGNATOR_ITEMS;
  });

  useEffect(() => {
    if (!decodedId) return;
    try {
      const saved = localStorage.getItem(`proper_project_designators_${decodedId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDesignatorItems(parsed);
          return;
        }
      }
      const projItems = (foundProject as any)?.designatorItems;
      if (Array.isArray(projItems) && projItems.length > 0) {
        setDesignatorItems(projItems);
      } else {
        setDesignatorItems(DEFAULT_DESIGNATOR_ITEMS);
      }
    } catch (err) {
      console.error('Failed to load project designators', err);
      setDesignatorItems(DEFAULT_DESIGNATOR_ITEMS);
    }
  }, [decodedId, foundProject]);

  const handleUpdateItems = (updated: DesignatorItem[]) => {
    setDesignatorItems(updated);
    try {
      localStorage.setItem(`proper_project_designators_${decodedId}`, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save designator items', err);
    }
  };

  // Switch / Query param untuk group terpilih
  const handleSelectGroup = (groupName: string | null) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (groupName) {
      newParams.set('group', groupName);
    } else {
      newParams.delete('group');
    }
    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  // Kalkulasi tanggal progress proyek
  const progressDates = useMemo(() => {
    return generateProgressDates(project?.startDate, project?.targetDate);
  }, [project?.startDate, project?.targetDate]);

  // Kalkulasi metrik keseluruhan proyek
  const overallMetrics = useMemo(() => {
    return calculateOverallProjectProgress(designatorItems);
  }, [designatorItems]);

  const overallSCurveData = useMemo(() => {
    return generateSCurveData(designatorItems, progressDates);
  }, [designatorItems, progressDates]);

  // Daftar Group Summary (Galian, Handhole, Kabel, Tiang, dsb.)
  const groupSummaries = useMemo(() => {
    return getGroupSummaryList(designatorItems);
  }, [designatorItems]);

  // Filter pencarian group di Level 2
  const [groupSearch, setGroupSearch] = useState('');
  const filteredGroups = useMemo(() => {
    if (!groupSearch.trim()) return groupSummaries;
    const term = groupSearch.toLowerCase();
    return groupSummaries.filter(
      (g) =>
        g.name.toLowerCase().includes(term) ||
        g.items.some(
          (i) =>
            i.designator.toLowerCase().includes(term) ||
            i.namaDeskripsi.toLowerCase().includes(term)
        )
    );
  }, [groupSummaries, groupSearch]);

  // View Mode: 'list' (default sesuai permintaan user) atau 'grid'
  const [groupViewMode, setGroupViewMode] = useState<'list' | 'grid'>('list');

  // State khusus saat di dalam Group Terpilih (Level 3 / Detail Group)
  const [itemSearch, setItemSearch] = useState('');
  const [activeItem, setActiveItem] = useState<DesignatorItem | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isAddDesignatorOpen, setIsAddDesignatorOpen] = useState(false);

  // Form State Update Progress Harian
  const [updateDate, setUpdateDate] = useState<string>(() => toISODateString(new Date()));
  const [dailyVolumeInput, setDailyVolumeInput] = useState<number>(0);
  const [selectedAlatKerja, setSelectedAlatKerja] = useState<string>('');
  const [selectedMandor, setSelectedMandor] = useState<string>('');
  const [inputSpan, setInputSpan] = useState<string>('');
  const [inputEvidence, setInputEvidence] = useState<string>('');

  // Form State Tambah Designator Baru dalam Group
  const [newDesignatorForm, setNewDesignatorForm] = useState({
    idVolume: `VOL-00${designatorItems.length + 1}`,
    designator: '',
    namaDeskripsi: '',
    satuan: 'Meter' as SatuanPekerjaan,
    bobotPersen: 5,
    volumeTarget: 1000,
  });

  // Items dan Kurva S untuk Group Terpilih
  const activeGroupItems = useMemo(() => {
    if (!selectedGroup) return [];
    return designatorItems.filter(
      (i) => (i.jenis || i.type || '').trim().toLowerCase() === selectedGroup.trim().toLowerCase()
    );
  }, [designatorItems, selectedGroup]);

  const displayedGroupItems = useMemo(() => {
    if (!itemSearch.trim()) return activeGroupItems;
    const q = itemSearch.toLowerCase();
    return activeGroupItems.filter(
      (i) =>
        i.designator.toLowerCase().includes(q) ||
        i.namaDeskripsi.toLowerCase().includes(q) ||
        i.idVolume.toLowerCase().includes(q)
    );
  }, [activeGroupItems, itemSearch]);

  const activeGroupMetrics = useMemo(() => {
    if (!selectedGroup) return { targetPercent: 0, actualPercent: 0, deviation: 0, totalBobot: 0 };
    return calculateGroupProgress(designatorItems, selectedGroup);
  }, [designatorItems, selectedGroup]);

  const activeGroupSCurve = useMemo(() => {
    if (!selectedGroup) return [];
    return generateGroupSCurveData(designatorItems, progressDates, selectedGroup);
  }, [designatorItems, progressDates, selectedGroup]);

  // Open modal update progress
  const handleOpenUpdate = (item: DesignatorItem) => {
    setActiveItem(item);
    const today = toISODateString(new Date());
    setUpdateDate(today);
    setDailyVolumeInput(getItemDailyVolume(item, today));

    const rec = item.dailyRecords?.[today]?.[0];
    setSelectedAlatKerja(rec?.alatKerja || '');
    setSelectedMandor(rec?.mandor || '');
    setInputSpan(rec?.span || '');
    setInputEvidence(rec?.evidence || '');

    setIsUpdateModalOpen(true);
  };

  const handleDateSelect = (d: string) => {
    setUpdateDate(d);
    if (!activeItem) return;
    setDailyVolumeInput(getItemDailyVolume(activeItem, d));
    const rec = activeItem.dailyRecords?.[d]?.[0];
    setSelectedAlatKerja(rec?.alatKerja || '');
    setSelectedMandor(rec?.mandor || '');
    setInputSpan(rec?.span || '');
    setInputEvidence(rec?.evidence || '');
  };

  // Simpan Update Harian
  const handleSaveDailyVolume = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;

    const newDailyVols = { ...(activeItem.dailyVolumes || {}) };
    newDailyVols[updateDate] = Number(dailyVolumeInput) || 0;

    const newDailyRecords = { ...(activeItem.dailyRecords || {}) };
    newDailyRecords[updateDate] = [
      {
        volume: Number(dailyVolumeInput) || 0,
        alatKerja: selectedAlatKerja,
        mandor: selectedMandor,
        span: inputSpan,
        evidence: inputEvidence,
      },
    ];

    const updated = designatorItems.map((item) => {
      if (item.idVolume === activeItem.idVolume) {
        return {
          ...item,
          dailyVolumes: newDailyVols,
          dailyRecords: newDailyRecords,
        };
      }
      return item;
    });

    handleUpdateItems(updated);
    toast.success(`Progres ${activeItem.designator} tanggal ${updateDate} berhasil disimpan!`);
    setIsUpdateModalOpen(false);
  };

  // Simpan Tambah Designator Baru
  const handleSaveNewDesignator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) return;

    const cleanCode = newDesignatorForm.designator.trim();
    if (!cleanCode) {
      toast.error('Kode designator wajib diisi');
      return;
    }

    const cleanId = newDesignatorForm.idVolume.trim() || `VOL-00${designatorItems.length + 1}`;
    if (designatorItems.some((i) => i.idVolume.toLowerCase() === cleanId.toLowerCase())) {
      toast.error(`ID Volume ${cleanId} sudah terdaftar`);
      return;
    }

    const newItem: DesignatorItem = {
      idVolume: cleanId,
      designator: cleanCode,
      namaDeskripsi: newDesignatorForm.namaDeskripsi.trim() || cleanCode,
      jenis: selectedGroup as JenisPekerjaan,
      satuan: newDesignatorForm.satuan,
      bobotPersen: Number(newDesignatorForm.bobotPersen) || 0,
      volumeTarget: Number(newDesignatorForm.volumeTarget) || 0,
      dailyVolumes: {},
    };

    handleUpdateItems([...designatorItems, newItem]);
    toast.success(`Designator ${cleanCode} berhasil ditambahkan ke grup ${selectedGroup}`);
    setIsAddDesignatorOpen(false);
    setNewDesignatorForm({
      idVolume: `VOL-00${designatorItems.length + 2}`,
      designator: '',
      namaDeskripsi: '',
      satuan: 'Meter',
      bobotPersen: 5,
      volumeTarget: 1000,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in text-[13px] pb-12">
      {/* Navigasi Ringkas Satu Baris (Hanya tampil saat di Group List level di desktop, sembunyikan di mobile < sm dan saat di detail group) */}
      {!selectedGroup && (
        <div className="hidden sm:flex items-center justify-between gap-3 border-b pb-3 text-[13px]">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/project-list')}
              className="py-[6px] px-[8px] text-[13px] cursor-pointer hover:text-foreground h-auto"
            >
              <span>Kembali ke Project List</span>
            </Button>
            <span className="text-muted-foreground">/</span>
            <span className="font-semibold text-foreground text-[14px]">{project.name}</span>
            <StatusBadge status={project.status || 'Implementation'} />
          </div>

          <div className="text-[13px] text-muted-foreground font-mono">
            ID: {project.contractNo ? project.contractNo.split(' | ')[0] : project.id}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. GROUP LIST DESIGNATOR vs 3. DETAIL GROUP TERPILIH */}
      {/* ========================================================================= */}
      {!selectedGroup ? (
        /* LEVEL 2: GROUP LIST DESIGNATOR (Galian, Handhole, Kabel, Tiang, dsb.) */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Daftar Designator {project.name}
              </h2>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                Pilih salah satu group pekerjaan (misal: <strong>Galian</strong>, <strong>Handhole</strong>, <strong>Kabel</strong>, dsb) untuk melihat kurva pengerjaan grup secara keseluruhan dan detail per-designator.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-full sm:w-64">
                <Input
                  placeholder="Cari group designator..."
                  value={groupSearch}
                  onChange={(e) => setGroupSearch(e.target.value)}
                  className="px-[8px] py-[6px] text-[13px] h-auto bg-card"
                />
              </div>

              {/* View Mode Toggle: List (Default) / Grid (Disembunyikan di mobile layar sentuh/lebar ~390px) */}
              <div className="hidden sm:flex items-center border rounded-lg p-0.5 bg-muted/30 shrink-0">
                <Button
                  type="button"
                  variant={groupViewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setGroupViewMode('list')}
                  className="py-[6px] px-[8px] text-[13px] h-auto cursor-pointer"
                  title="Tampilan List"
                >
                  List
                </Button>
                <Button
                  type="button"
                  variant={groupViewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setGroupViewMode('grid')}
                  className="py-[6px] px-[8px] text-[13px] h-auto cursor-pointer"
                  title="Tampilan Grid Card"
                >
                  Grid
                </Button>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TAMPILAN LIST (DEFAULT SESUAI PERMINTAAN USER) */}
          {/* ========================================================================= */}
          {groupViewMode === 'list' ? (
            <div className="space-y-3">
              {filteredGroups.map((group) => {
                const isCompleted = group.actualPercent >= 100;
                const isAhead = group.deviation >= 0;
                const isNotStarted = group.actualPercent === 0;

                return (
                  <div
                    key={group.name}
                    onClick={() => handleSelectGroup(group.name)}
                    className="w-full p-4 sm:p-5 bg-card hover:bg-neutral-50 dark:hover:bg-muted/30 border border-border/80 hover:border-primary/50 rounded-xl transition-all duration-200 cursor-pointer group shadow-2xs hover:shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Sisi Kiri: Info Group (Lebar Tetap 350px agar Target BOQ selalu sejajar) */}
                    <div className="w-full md:w-[350px] shrink-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-[14.5px] text-foreground group-hover:text-primary transition-colors truncate">
                          {group.name}
                        </h3>
                        <Badge variant="outline" className="text-[11px] py-[2px] px-[6px] my-[6px] font-medium bg-muted/30 shrink-0">
                          Bobot {group.totalBobot}%
                        </Badge>
                      </div>
                      <p className="text-[13px] text-muted-foreground mt-0.5">
                        {group.itemCount} Item Designator
                      </p>
                    </div>

                    {/* Sisi Tengah 1: Target BOQ vs Realisasi (Lebar Tetap 260px agar selalu sejajar) */}
                    <div className="grid grid-cols-2 gap-4 text-[13px] w-full md:w-[260px] shrink-0">
                      <div>
                        <span className="text-[12px] text-muted-foreground block">Target BOQ</span>
                        <span className="font-semibold text-foreground">
                          {group.totalVolumeTarget.toLocaleString('id-ID')} {group.primaryUnit}
                        </span>
                      </div>
                      <div>
                        <span className="text-[12px] text-muted-foreground block">Realisasi Fisik</span>
                        <span className="font-semibold text-foreground">
                          {group.totalVolumeActual.toLocaleString('id-ID')} {group.primaryUnit}
                        </span>
                      </div>
                    </div>

                    {/* Sisi Tengah 2: Status Pekerjaan (Lebar Tetap 160px) */}
                    <div className="w-full md:w-[160px] shrink-0">
                      {isCompleted ? (
                        <span className="inline-flex items-center text-[13px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 py-[6px] px-[8px] rounded-md border border-emerald-500/20">
                          Selesai 100%
                        </span>
                      ) : isNotStarted ? (
                        <span className="inline-flex items-center gap-1 text-[13px] font-medium text-muted-foreground bg-muted/50 py-[6px] px-[8px] rounded-md border">
                          <Clock className="w-3.5 h-3.5" /> Belum Dimulai
                        </span>
                      ) : isAhead ? (
                        <span className="inline-flex items-center text-[13px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 py-[6px] px-[8px] rounded-md border border-emerald-500/20">
                          On Track (+{group.deviation}%)
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[13px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 py-[6px] px-[8px] rounded-md border border-amber-500/20">
                          Deviasi ({group.deviation}%)
                        </span>
                      )}
                    </div>

                    {/* Sisi Kanan: Progres Bar */}
                    <div className="flex items-center justify-between md:justify-end gap-5 flex-1 min-w-[200px] pt-2 md:pt-0 border-t md:border-t-0 border-border/60">
                      <div className="text-right w-full md:w-32">
                        <div className="flex items-center justify-between md:justify-end gap-2 text-[13px] mb-1">
                          <span className="text-muted-foreground text-[12px]">Progres:</span>
                          <span className="font-bold text-foreground">{group.actualPercent}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isCompleted ? 'bg-emerald-500' : isAhead ? 'bg-primary' : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(100, group.actualPercent)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ========================================================================= */
            /* TAMPILAN GRID CARD */
            /* ========================================================================= */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGroups.map((group) => {
                const isCompleted = group.actualPercent >= 100;
                const isAhead = group.deviation >= 0;
                const isNotStarted = group.actualPercent === 0;

                return (
                  <div
                    key={group.name}
                    onClick={() => handleSelectGroup(group.name)}
                    className="group relative flex flex-col justify-between rounded-xl border bg-card p-5 hover:border-primary/60 hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden ring-1 ring-border/50 hover:ring-primary/30"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/80 to-primary/20 opacity-80 group-hover:opacity-100 transition-opacity" />

                    <div>
                      {/* Header Group */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors">
                            {group.name}
                          </h3>
                          <p className="text-[11px] text-muted-foreground">
                            {group.itemCount} Item Designator
                          </p>
                        </div>

                        <Badge variant="secondary" className="shrink-0 text-[10px] font-semibold px-2 py-0.5">
                          Bobot: {group.totalBobot}%
                        </Badge>
                      </div>

                      {/* Volume Targets */}
                      <div className="grid grid-cols-2 gap-2 my-3 py-2 px-3 bg-muted/25 rounded-lg border border-border/40 text-xs">
                        <div>
                          <span className="text-[10px] text-muted-foreground block">Target BOQ</span>
                          <span className="font-semibold text-foreground">
                            {group.totalVolumeTarget.toLocaleString('id-ID')} {group.primaryUnit}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground block">Realisasi Fisik</span>
                          <span className="font-semibold text-foreground">
                            {group.totalVolumeActual.toLocaleString('id-ID')} {group.primaryUnit}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1 mt-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground text-[11px]">Progres Pekerjaan</span>
                          <span className="font-bold text-foreground">{group.actualPercent}%</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isCompleted ? 'bg-emerald-500' : isAhead ? 'bg-primary' : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(100, group.actualPercent)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Footer & CTA */}
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/40 text-xs">
                      <div>
                        {isCompleted ? (
                          <span className="inline-flex items-center text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                            Selesai 100%
                          </span>
                        ) : isNotStarted ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" /> Belum Dimulai
                          </span>
                        ) : isAhead ? (
                          <span className="inline-flex items-center text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                            On Track (+{group.deviation}%)
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[11px] font-medium text-amber-600 dark:text-amber-400">
                            Deviasi ({group.deviation}%)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* LEVEL 3: DETAIL GROUP TERPILIH (Contoh: Kabel) */
        <div className="space-y-6">
          {/* Header Kembali & Info Group */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectGroup(null)}
                className="py-[6px] px-[8px] text-[13px] cursor-pointer h-auto"
              >
                <span>Kembali ke Group List</span>
              </Button>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    Group Pekerjaan: {selectedGroup}
                  </h2>
                  <Badge variant="outline" className="text-[13px] py-[6px] px-[8px]">
                    {activeGroupItems.length} Designator
                  </Badge>
                  <Badge variant="secondary" className="text-[13px] font-semibold py-[6px] px-[8px]">
                    Bobot Grup: {activeGroupMetrics.totalBobot}%
                  </Badge>
                </div>
                <p className="text-[13px] text-muted-foreground mt-0.5">
                  Menampilkan kurva pengerjaan grup {selectedGroup} secara keseluruhan dan daftar pembaruan progres per-designator.
                </p>
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => setIsAddDesignatorOpen(true)}
              className="py-[6px] px-[8px] text-[13px] shrink-0 h-auto cursor-pointer"
            >
              Tambah Designator ({selectedGroup})
            </Button>
          </div>

          {/* 1. Detil Kurva Pengerjaan Designator Group Secara Keseluruhan */}
          <div>
            <SCurveChart
              data={activeGroupSCurve}
              targetPercent={activeGroupMetrics.targetPercent}
              actualPercent={activeGroupMetrics.actualPercent}
              deviation={activeGroupMetrics.deviation}
              projectName={`${project.name} - Group ${selectedGroup}`}
            />
          </div>

          {/* 2. List Semua Designator yang Masuk ke dalam Group Tersebut */}
          <Card className="border-0 shadow-none ring-1 ring-border/50 bg-card overflow-hidden">
            <CardHeader className="bg-muted/10 p-4 border-b">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base">
                    Daftar Designator dalam Group {selectedGroup}
                  </CardTitle>
                  <CardDescription className="text-[13px] mt-0.5">
                    Klik tombol <strong>Update Progress</strong> di masing-masing baris untuk memperbarui volume pekerjaan fisik harian.
                  </CardDescription>
                </div>

                <div className="w-full sm:w-64">
                  <Input
                    placeholder="Cari kode atau deskripsi..."
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                    className="px-[8px] py-[6px] text-[13px] h-auto bg-card"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="text-[13px]">
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="font-semibold text-foreground px-4 py-3 text-[13px]">ID Vol</TableHead>
                      <TableHead className="font-semibold text-foreground px-4 py-3 min-w-[220px] text-[13px]">
                        Kode & Deskripsi Designator
                      </TableHead>
                      <TableHead className="font-semibold text-foreground px-4 py-3 text-center text-[13px]">
                        Satuan
                      </TableHead>
                      <TableHead className="font-semibold text-foreground px-4 py-3 text-right text-[13px]">
                        Bobot (%)
                      </TableHead>
                      <TableHead className="font-semibold text-foreground px-4 py-3 text-right text-[13px]">
                        Target BOQ
                      </TableHead>
                      <TableHead className="font-semibold text-foreground px-4 py-3 text-right text-[13px]">
                        Realisasi Fisik
                      </TableHead>
                      <TableHead className="font-semibold text-foreground px-4 py-3 text-center min-w-[140px] text-[13px]">
                        Capaian (%)
                      </TableHead>
                      <TableHead className="font-semibold text-foreground px-4 py-3 text-right pr-4 text-[13px]">
                        Aksi
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {displayedGroupItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-10 text-muted-foreground text-[13px]">
                          {itemSearch
                            ? `Tidak ada designator yang cocok dengan "${itemSearch}".`
                            : `Belum ada designator yang terdaftar dalam grup ${selectedGroup}.`}
                        </TableCell>
                      </TableRow>
                    ) : (
                      displayedGroupItems.map((item) => {
                        const totalAct = getVolumeTotal(item);
                        const targetVol = item.volumeTarget || item.boqVolume || 0;
                        const pct = getProgressPercent(item);
                        const isDone = pct >= 100;

                        return (
                          <TableRow
                            key={item.idVolume}
                            className="border-b hover:bg-muted/20 transition-colors text-[13px]"
                          >
                            <TableCell className="px-4 py-3 font-mono text-[12px] text-muted-foreground">
                              {item.idVolume}
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <div className="font-semibold text-foreground text-[13px]">
                                {item.designator}
                              </div>
                              <div className="text-[12px] text-muted-foreground mt-0.5 line-clamp-1">
                                {item.namaDeskripsi}
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-center text-muted-foreground font-medium text-[13px]">
                              {item.satuan || item.unit || '-'}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-right font-semibold text-foreground text-[13px]">
                              {item.bobotPersen}%
                            </TableCell>
                            <TableCell className="px-4 py-3 text-right font-medium text-foreground text-[13px]">
                              {targetVol.toLocaleString('id-ID')}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-right font-bold text-foreground text-[13px]">
                              {totalAct.toLocaleString('id-ID')}
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-[13px]">
                                  <span className="font-semibold">{pct}%</span>
                                  {isDone && (
                                    <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">
                                      Done
                                    </span>
                                  )}
                                </div>
                                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-300 ${
                                      isDone ? 'bg-emerald-500' : 'bg-primary'
                                    }`}
                                    style={{ width: `${Math.min(100, pct)}%` }}
                                  />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-right pr-4">
                              <Button
                                size="sm"
                                onClick={() => handleOpenUpdate(item)}
                                className="py-[6px] px-[8px] text-[13px] h-auto rounded-md cursor-pointer"
                              >
                                Update Progress
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DIALOG UPDATE PROGRESS PER DESIGNATOR */}
      {/* ========================================================================= */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Update Progress Designator
            </DialogTitle>
            <DialogDescription className="text-[13px]">
              Masukkan volume pengerjaan fisik harian untuk <strong>{activeItem?.designator}</strong>.
            </DialogDescription>
          </DialogHeader>

          {activeItem && (
            <form onSubmit={handleSaveDailyVolume} className="space-y-4 py-2 text-[13px]">
              <div className="bg-muted/30 p-3 rounded-lg border space-y-1">
                <div className="font-semibold text-foreground text-[13px]">{activeItem.designator}</div>
                <div className="text-muted-foreground text-[12px]">{activeItem.namaDeskripsi}</div>
                <div className="flex items-center gap-3 pt-1 text-[12px] flex-wrap">
                  <span>Satuan: <strong>{activeItem.satuan}</strong></span>
                  <span>Target BOQ: <strong>{activeItem.volumeTarget?.toLocaleString('id-ID')}</strong></span>
                  <span>Realisasi Total: <strong>{getVolumeTotal(activeItem).toLocaleString('id-ID')}</strong></span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="prog-date" className="text-[13px]">Tanggal Pengerjaan *</Label>
                  <Input
                    id="prog-date"
                    type="date"
                    value={updateDate}
                    onChange={(e) => handleDateSelect(e.target.value)}
                    required
                    className="py-[6px] px-[8px] text-[13px] h-auto"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prog-vol" className="text-[13px]">
                    Volume Hari Ini ({activeItem.satuan}) *
                  </Label>
                  <Input
                    id="prog-vol"
                    type="number"
                    step="any"
                    value={dailyVolumeInput || ''}
                    onChange={(e) => setDailyVolumeInput(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    required
                    className="py-[6px] px-[8px] text-[13px] font-semibold h-auto"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="prog-alat" className="text-[13px]">Alat Kerja</Label>
                  <Select
                    value={selectedAlatKerja}
                    onValueChange={(val) => setSelectedAlatKerja(val || '')}
                  >
                    <SelectTrigger id="prog-alat" className="py-[6px] px-[8px] text-[13px] h-auto">
                      <SelectValue placeholder="Pilih Alat Kerja" />
                    </SelectTrigger>
                    <SelectContent>
                      {MASTER_ALAT_KERJA_DATA.map((alat) => (
                        <SelectItem key={alat.id} value={alat.name} className="text-[13px]">
                          {alat.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="Manual" className="text-[13px]">Manual</SelectItem>
                      <SelectItem value="Lainnya" className="text-[13px]">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prog-mandor" className="text-[13px]">Mandor / Tim</Label>
                  <Input
                    id="prog-mandor"
                    value={selectedMandor}
                    onChange={(e) => setSelectedMandor(e.target.value)}
                    placeholder="Nama Mandor / Tim Lapangan"
                    className="py-[6px] px-[8px] text-[13px] h-auto"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="prog-span" className="text-[13px]">Ruas / Span / Titik STA</Label>
                <Input
                  id="prog-span"
                  value={inputSpan}
                  onChange={(e) => setInputSpan(e.target.value)}
                  placeholder="Contoh: Pole 01 s/d Pole 08"
                  className="py-[6px] px-[8px] text-[13px] h-auto"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="prog-evidence" className="text-[13px]">Link Evidence / Catatan</Label>
                <Input
                  id="prog-evidence"
                  value={inputEvidence}
                  onChange={(e) => setInputEvidence(e.target.value)}
                  placeholder="Link Google Drive foto pengerjaan atau catatan"
                  className="py-[6px] px-[8px] text-[13px] h-auto"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="py-[6px] px-[8px] text-[13px] h-auto"
                >
                  Batal
                </Button>
                <Button type="submit" size="sm" className="py-[6px] px-[8px] text-[13px] h-auto">
                  Simpan Progres
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* DIALOG TAMBAH DESIGNATOR BARU KE GROUP */}
      {/* ========================================================================= */}
      <Dialog open={isAddDesignatorOpen} onOpenChange={setIsAddDesignatorOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Tambah Designator ({selectedGroup})
            </DialogTitle>
            <DialogDescription className="text-[13px]">
              Item baru otomatis dimasukkan ke dalam group <strong>{selectedGroup}</strong>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveNewDesignator} className="space-y-3 py-2 text-[13px]">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="new-id" className="text-[13px]">ID Volume</Label>
                <Input
                  id="new-id"
                  value={newDesignatorForm.idVolume}
                  onChange={(e) => setNewDesignatorForm({ ...newDesignatorForm, idVolume: e.target.value })}
                  className="py-[6px] px-[8px] text-[13px] h-auto font-mono"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-sat" className="text-[13px]">Satuan</Label>
                <Select
                  value={newDesignatorForm.satuan}
                  onValueChange={(val) => setNewDesignatorForm({ ...newDesignatorForm, satuan: (val as SatuanPekerjaan) || 'Meter' })}
                >
                  <SelectTrigger id="new-sat" className="py-[6px] px-[8px] text-[13px] h-auto">
                    <SelectValue placeholder="Pilih Satuan" />
                  </SelectTrigger>
                  <SelectContent>
                    {SATUAN_OPTIONS.map((sat) => (
                      <SelectItem key={sat} value={sat} className="text-[13px]">
                        {sat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new-designator" className="text-[13px]">Kode Designator *</Label>
              <Input
                id="new-designator"
                placeholder="Misal: AC-OF-SM-ADSS-48D"
                value={newDesignatorForm.designator}
                onChange={(e) => setNewDesignatorForm({ ...newDesignatorForm, designator: e.target.value })}
                className="py-[6px] px-[8px] text-[13px] h-auto"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new-nama" className="text-[13px]">Deskripsi Pekerjaan</Label>
              <Input
                id="new-nama"
                placeholder="Deskripsi pekerjaan"
                value={newDesignatorForm.namaDeskripsi}
                onChange={(e) => setNewDesignatorForm({ ...newDesignatorForm, namaDeskripsi: e.target.value })}
                className="py-[6px] px-[8px] text-[13px] h-auto"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="new-target" className="text-[13px]">Volume Target</Label>
                <Input
                  id="new-target"
                  type="number"
                  value={newDesignatorForm.volumeTarget}
                  onChange={(e) => setNewDesignatorForm({ ...newDesignatorForm, volumeTarget: parseFloat(e.target.value) || 0 })}
                  className="py-[6px] px-[8px] text-[13px] h-auto"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-bobot" className="text-[13px]">Bobot (%) Proyek</Label>
                <Input
                  id="new-bobot"
                  type="number"
                  step="0.1"
                  value={newDesignatorForm.bobotPersen}
                  onChange={(e) => setNewDesignatorForm({ ...newDesignatorForm, bobotPersen: parseFloat(e.target.value) || 0 })}
                  className="py-[6px] px-[8px] text-[13px] h-auto"
                  required
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddDesignatorOpen(false)}
                className="py-[6px] px-[8px] text-[13px] h-auto"
              >
                Batal
              </Button>
              <Button type="submit" size="sm" className="py-[6px] px-[8px] text-[13px] h-auto">
                Tambahkan Designator
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
