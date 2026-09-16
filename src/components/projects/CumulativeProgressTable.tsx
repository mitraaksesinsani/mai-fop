"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  FileCheck2,
  Search,
  Plus,
  Filter,
  Layers,
  Sparkles,
  Calendar,
  Trash2,
  RotateCcw,
} from "lucide-react";
import {
  DesignatorItem,
  JenisPekerjaan,
  SatuanPekerjaan,
  DEFAULT_DESIGNATOR_ITEMS,
  getVolumeTotal,
  getProgressPercent,
  ChangeLogEntry,
  toISODateString,
  formatDisplayDate,
  getItemDailyVolume,
} from "@/lib/designatorProgress";
import { History, Pencil, User } from "lucide-react";
import { toast } from "sonner";

import { MASTER_DESIGNATOR_DATA, MASTER_ALAT_KERJA_DATA } from "@/lib/constants/masterData";

interface CumulativeProgressTableProps {
  items: DesignatorItem[];
  onUpdateItems: (newItems: DesignatorItem[]) => void;
  projectName?: string;
  contractNo?: string;
  projectStartDate?: string;
  projectEndDate?: string;
  requireReasonForAdd?: boolean;
}

const JENIS_OPTIONS: (JenisPekerjaan | "Semua Jenis")[] = [
  "Semua Jenis",
  "Galian",
  "Kabel",
  "Tiang",
  "Jembatan",
  "Handhole",
  "Terminasi",
  "Uji Terima (UT)",
  "Commisioning Test (CT)",
  "BA Rekon",
];

const SATUAN_OPTIONS: SatuanPekerjaan[] = [
  "Meter",
  "pcs",
  "core",
  "set",
  "unit",
  "node",
  "track",
  "m3",
  "titik",
  "lumpsum",
  "batang",
  "link",
  "dokumen",
];

export default function CumulativeProgressTable({
  items,
  onUpdateItems,
  projectName = "Proyek Fiber Optik",
  contractNo = "-",
  projectStartDate,
  projectEndDate,
  requireReasonForAdd = true,
}: CumulativeProgressTableProps) {
  const [selectedJenis, setSelectedJenis] = useState<string>("Semua Jenis");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDailyModalOpen, setIsAddDailyModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<
    "PMO" | "Site Manager"
  >("Site Manager");
  const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false);
  const [isDeleteItemModalOpen, setIsDeleteItemModalOpen] = useState(false);

  const progressDates = useMemo(() => {
    const datesSet = new Set<string>();

    if (projectStartDate && projectEndDate) {
      const start = new Date(projectStartDate.split('T')[0]);
      const end = new Date(projectEndDate.split('T')[0]);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= end) {
        let current = new Date(start);
        let count = 0;
        while (current <= end && count < 1000) {
          datesSet.add(toISODateString(current));
          current.setDate(current.getDate() + 1);
          count++;
        }
      }
    }

    // Sertakan juga tanggal-tanggal yang pernah tercatat di dailyVolumes
    items.forEach((item) => {
      if (item.dailyVolumes) {
        Object.keys(item.dailyVolumes).forEach((d) => {
          if (d.includes('-') && d.length === 10) {
            datesSet.add(d);
          }
        });
      }
    });

    if (datesSet.size === 0) {
      const current = new Date();
      for (let i = 0; i < 14; i++) {
        const d = new Date(current);
        d.setDate(current.getDate() + i);
        datesSet.add(toISODateString(d));
      }
    }

    return Array.from(datesSet).sort();
  }, [projectStartDate, projectEndDate, items]);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<DesignatorItem | null>(null);
  const [actionReason, setActionReason] = useState("");

  // Form input tambah item baru
  const [newItemForm, setNewItemForm] = useState<{
    idVolume: string;
    designator: string;
    namaDeskripsi: string;
    jenis: JenisPekerjaan;
    satuan: SatuanPekerjaan;
    bobotPersen: number;
    volumeTarget: number;
  }>({
    idVolume: `VOL-00${items.length + 1}`,
    designator: "",
    namaDeskripsi: "",
    jenis: "Galian",
    satuan: "Meter",
    bobotPersen: 15,
    volumeTarget: 1000,
  });

  // Form input update harian
  const [selectedIdVolume, setSelectedIdVolume] = useState<string>(
    items[0]?.idVolume || "",
  );
  const [selectedDate, setSelectedDate] = useState<string>(() => toISODateString(new Date()));
  const [inputVolume, setInputVolume] = useState<number>(0);
  const [selectedAlatKerja, setSelectedAlatKerja] = useState<string>("");
  const [selectedMandor, setSelectedMandor] = useState<string>("");
  const [inputSpan, setInputSpan] = useState<string>("");
  const [inputEvidence, setInputEvidence] = useState<string>("");

  // Sinkronkan selectedIdVolume jika items berubah
  useEffect(() => {
    if (
      items.length > 0 &&
      (!selectedIdVolume || !items.some((i) => i.idVolume === selectedIdVolume))
    ) {
      setSelectedIdVolume(items[0].idVolume);
    }
  }, [items, selectedIdVolume]);

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchJenis =
      selectedJenis === "Semua Jenis" || item.jenis === selectedJenis;
    const matchSearch =
      item.designator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.namaDeskripsi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.idVolume.toLowerCase().includes(searchQuery.toLowerCase());
    return matchJenis && matchSearch;
  });

  // Handler tambah item baru
  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDesignator = newItemForm.designator.trim();
    if (!cleanDesignator) {
      toast.error("Kode designator pekerjaan wajib diisi");
      return;
    }
    const cleanId = newItemForm.idVolume.trim() || `VOL-00${items.length + 1}`;
    if (items.some((i) => i.idVolume.toLowerCase() === cleanId.toLowerCase())) {
      toast.error(`ID Volume ${cleanId} sudah digunakan`);
      return;
    }

    if (requireReasonForAdd && !actionReason.trim()) {
      toast.error("Alasan penambahan wajib diisi");
      return;
    }

    const created: DesignatorItem = {
      idVolume: cleanId,
      designator: cleanDesignator,
      namaDeskripsi: newItemForm.namaDeskripsi.trim() || cleanDesignator,
      jenis: newItemForm.jenis,
      satuan: newItemForm.satuan,
      bobotPersen: Number(newItemForm.bobotPersen) || 0,
      volumeTarget: Number(newItemForm.volumeTarget) || 0,
      dailyVolumes: {},
      changeHistory: [
        {
          id: Math.random().toString(36).substring(2, 9),
          action: "add",
          reason: actionReason,
          role: currentUserRole,
          timestamp: new Date().toISOString(),
          details: `Menambahkan designator baru: ${cleanDesignator} (${cleanId})`,
        },
      ],
    };

    onUpdateItems([...items, created]);
    toast.success(
      `Item pekerjaan "${created.designator}" berhasil ditambahkan!`,
    );
    setIsAddItemModalOpen(false);
    setNewItemForm({
      idVolume: `VOL-00${items.length + 2}`,
      designator: "",
      namaDeskripsi: "",
      jenis: "Kabel",
      satuan: "Meter",
      bobotPersen: 15,
      volumeTarget: 1000,
    });
    setActionReason("");
  };

  // Handler hapus item
  // Handler Konfirmasi Hapus
  const handleConfirmDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;
    if (!actionReason.trim()) {
      toast.error("Alasan penghapusan wajib diisi");
      return;
    }

    // Instead of completely removing, maybe we just log it, but user asked to remove. We'll remove it completely.
    // If we remove it, the history is lost unless stored elsewhere. Let's just remove it as requested.
    const updated = items.filter((i) => i.idVolume !== activeItem.idVolume);
    onUpdateItems(updated);
    toast.success(`Item pekerjaan ${activeItem.idVolume} berhasil dihapus.`);
    setIsDeleteItemModalOpen(false);
    setActionReason("");
    setActiveItem(null);
  };

  // Handler Konfirmasi Edit
  const handleConfirmEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;
    if (!actionReason.trim()) {
      toast.error("Alasan perubahan wajib diisi");
      return;
    }

    const cleanDesignator = newItemForm.designator.trim();
    if (!cleanDesignator) {
      toast.error("Kode designator pekerjaan wajib diisi");
      return;
    }

    const updated = items.map((i) => {
      if (i.idVolume === activeItem.idVolume) {
        const history = i.changeHistory || [];
        return {
          ...i,
          designator: cleanDesignator,
          namaDeskripsi: newItemForm.namaDeskripsi,
          jenis: newItemForm.jenis,
          satuan: newItemForm.satuan,
          bobotPersen: Number(newItemForm.bobotPersen) || 0,
          volumeTarget: Number(newItemForm.volumeTarget) || 0,
          changeHistory: [
            ...history,
            {
              id: Math.random().toString(36).substring(2, 9),
              action: "edit",
              reason: actionReason,
              role: currentUserRole,
              timestamp: new Date().toISOString(),
              details: `Mengubah data designator ${cleanDesignator}`,
            } as ChangeLogEntry,
          ],
        };
      }
      return i;
    });

    onUpdateItems(updated);
    toast.success(`Item pekerjaan ${activeItem.idVolume} berhasil diperbarui.`);
    setIsEditItemModalOpen(false);
    setActionReason("");
    setActiveItem(null);
  };

  // Handler reset semua item ke kosong
  const handleResetAll = () => {
    if (
      confirm(
        "Apakah Anda yakin ingin mengosongkan seluruh item pekerjaan pada proyek ini?",
      )
    ) {
      onUpdateItems([]);
      toast.info("Seluruh item pekerjaan telah dikosongkan.");
    }
  };

  // Handler muat template contoh
  const handleLoadSampleTemplate = () => {
    onUpdateItems(DEFAULT_DESIGNATOR_ITEMS);
    toast.success("Template standar FO (6 item) berhasil dimuat!");
  };

  // Handler update volume harian
  const handleSaveDailyProgress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIdVolume) {
      toast.error("Pilih ID Volume / Pekerjaan terlebih dahulu");
      return;
    }
    if (inputVolume < 0) {
      toast.error("Volume tidak boleh negatif");
      return;
    }

    const updated = items.map((item) => {
      if (item.idVolume === selectedIdVolume) {
        const currentDaily = { ...(item.dailyVolumes || {}) };
        currentDaily[selectedDate] = Number(inputVolume);

        const currentRecords = { ...(item.dailyRecords || {}) };
        const dayRecords = currentRecords[selectedDate] || [];
        dayRecords.push({
          volume: Number(inputVolume),
          alatKerja: selectedAlatKerja,
          mandor: selectedMandor,
          span: inputSpan,
          evidence: inputEvidence,
        });
        currentRecords[selectedDate] = dayRecords;

        return {
          ...item,
          dailyVolumes: currentDaily,
          dailyRecords: currentRecords,
        };
      }
      return item;
    });

    onUpdateItems(updated);
    toast.success(
      `Progress harian untuk ${selectedIdVolume} berhasil disimpan!`,
    );
    setIsAddDailyModalOpen(false);
    setInputVolume(0);
    setSelectedAlatKerja("");
    setSelectedMandor("");
    setInputSpan("");
    setInputEvidence("");
  };

  // Badge warna untuk Jenis Pekerjaan
  const getJenisBadgeClass = (jenis: JenisPekerjaan) => {
    switch (jenis) {
      case "Galian":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800";
      case "Kabel":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800";
      case "Tiang":
        return "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-700";
      case "Jembatan":
        return "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/30 dark:text-cyan-400 dark:border-cyan-800";
      case "Handhole":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800";
      case "Terminasi":
        return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800";
      case "Uji Terima (UT)":
        return "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-800";
      case "Commisioning Test (CT)":
        return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-800";
      case "BA Rekon":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="border-0 shadow-none bg-transparent overflow-hidden">
      {/* Header Utama dengan Action Buttons */}
      <CardHeader className="p-0 pb-4 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold">
                Tabel Aktual Kumulatif Progress Pekerjaan
              </CardTitle>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10pt] text-muted-foreground flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Simulasi Role:
              </span>
              <div className="flex bg-muted/50 rounded-md p-0.5 border">
                <button
                  onClick={() => setCurrentUserRole("PMO")}
                  className={`text-[10pt] px-2 py-1 rounded-sm transition-colors ${currentUserRole === "PMO" ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:bg-background/50"}`}
                >
                  PMO
                </button>
                <button
                  onClick={() => setCurrentUserRole("Site Manager")}
                  className={`text-[10pt] px-2 py-1 rounded-sm transition-colors ${currentUserRole === "Site Manager" ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:bg-background/50"}`}
                >
                  Site Manager
                </button>
              </div>
            </div>
            <CardDescription className="text-[10pt] mt-0.5">
              Rekapitulasi volume aktual harian per tanggal dan akumulasi
              kumulatif terhadap target
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Tombol Tambah Item Pekerjaan Baru */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setNewItemForm({
                  idVolume: `VOL-00${items.length + 1}`,
                  designator: "",
                  namaDeskripsi: "",
                  jenis: "Kabel",
                  satuan: "Meter",
                  bobotPersen: 15,
                  volumeTarget: 1000,
                });
                setIsAddItemModalOpen(true);
              }}
              className="text-[10pt] font-medium flex items-center gap-1.5 h-10 px-3.5 rounded-lg border-primary/40 text-primary hover:bg-primary/5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Item Pekerjaan</span>
            </Button>

            {/* Tombol Update Progress Harian */}
            <Button
              className="text-[10pt] font-medium flex items-center gap-1.5 shadow-sm h-10 rounded-lg px-3.5"
              disabled={items.length === 0}
              onClick={() => setIsAddDailyModalOpen(true)}
              title={
                items.length === 0
                  ? "Tambahkan item pekerjaan terlebih dahulu"
                  : "Input progress harian"
              }
            >
              <Calendar className="w-4 h-4" />
              <span>Update Progress Harian</span>
            </Button>

            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetAll}
                className="text-[10pt] text-muted-foreground hover:text-destructive h-10 px-2.5"
                title="Kosongkan seluruh data pekerjaan"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Modal Tambah Item Pekerjaan Baru */}
        <Dialog open={isAddItemModalOpen} onOpenChange={setIsAddItemModalOpen}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <Plus className="w-4 h-4 text-primary" />
                Tambah Item Pekerjaan Fisik
              </DialogTitle>
              <DialogDescription className="text-[10pt]">
                Masukkan rincian spesifikasi pekerjaan, volume target BOQ, dan
                bobot pekerjaan untuk proyek ini.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAddNewItem} className="space-y-3.5 py-2">
              {requireReasonForAdd && (
                <div className="space-y-1.5 p-3 rounded-lg bg-muted/30 border border-border/50">
                  <Label className="text-[10pt] font-medium text-destructive">
                    Alasan Penambahan (Wajib)*
                  </Label>
                  <Input
                    required
                    placeholder="Contoh: Permintaan revisi dari klien"
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    className="text-[10pt] h-9"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-[10pt] font-medium">
                  Designator Master*
                </Label>
                <Select
                  required
                  value={newItemForm.designator}
                  onValueChange={(val) => {
                    if (!val) return;
                    const masterItem = MASTER_DESIGNATOR_DATA.find(
                      (d) => d.code === val,
                    );
                    if (masterItem) {
                      setNewItemForm({
                        ...newItemForm,
                        designator: masterItem.code,
                        namaDeskripsi: masterItem.description,
                        jenis: masterItem.type as any,
                        satuan: masterItem.unit as any,
                      });
                    }
                  }}
                >
                  <SelectTrigger className="text-[10pt] h-9">
                    <SelectValue placeholder="Pilih Designator..." />
                  </SelectTrigger>
                  <SelectContent>
                    {MASTER_DESIGNATOR_DATA.map((d) => (
                      <SelectItem
                        key={d.code}
                        value={d.code}
                        className="text-[10pt]"
                      >
                        {d.code} - {d.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10pt] font-medium">ID Volume*</Label>
                  <Input
                    required
                    placeholder="Contoh: VOL-001"
                    value={newItemForm.idVolume}
                    onChange={(e) =>
                      setNewItemForm({
                        ...newItemForm,
                        idVolume: e.target.value,
                      })
                    }
                    className="text-[10pt] h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10pt] font-medium">
                    Jenis Pekerjaan
                  </Label>
                  <Input
                    readOnly
                    value={newItemForm.jenis}
                    className="text-[10pt] h-9 bg-muted"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10pt] font-medium">
                  Deskripsi Pekerjaan
                </Label>
                <Input
                  readOnly
                  value={newItemForm.namaDeskripsi}
                  className="text-[10pt] h-9 bg-muted"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10pt] font-medium">Satuan</Label>
                  <Input
                    readOnly
                    value={newItemForm.satuan}
                    className="text-[10pt] h-9 bg-muted"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10pt] font-medium">Target BOQ*</Label>
                  <Input
                    type="number"
                    min="1"
                    required
                    placeholder="1000"
                    value={newItemForm.volumeTarget || ""}
                    onChange={(e) =>
                      setNewItemForm({
                        ...newItemForm,
                        volumeTarget: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="text-[10pt] h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10pt] font-medium">Bobot (%)*</Label>
                  <Input
                    type="number"
                    min="0.1"
                    max="100"
                    step="0.1"
                    required
                    placeholder="15"
                    value={newItemForm.bobotPersen || ""}
                    onChange={(e) =>
                      setNewItemForm({
                        ...newItemForm,
                        bobotPersen: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="text-[10pt] h-9"
                  />
                </div>
              </div>

              <DialogFooter className="pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddItemModalOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" size="sm">
                  Simpan Item
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isAddDailyModalOpen}
          onOpenChange={setIsAddDailyModalOpen}
        >
          <DialogContent className="sm:max-w-[460px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Input Realisasi Volume Harian
              </DialogTitle>
              <DialogDescription>
                Pilih pekerjaan dan tanggal untuk memasukkan angka realisasi
                volume pekerjaan.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveDailyProgress} className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-[10pt] font-medium">
                    Tanggal Progress
                  </Label>
                  <Input
                    id="date-progress"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    required
                    className="text-[10pt]"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="item-select"
                    className="text-[10pt] font-medium"
                  >
                    Pilih Designator
                  </Label>
                  <Select
                    value={selectedIdVolume}
                    onValueChange={(val) => setSelectedIdVolume(val || "")}
                  >
                    <SelectTrigger id="item-select" className="text-[10pt]">
                      <SelectValue placeholder="Pilih Designator" />
                    </SelectTrigger>
                    <SelectContent>
                      {items.map((item) => (
                        <SelectItem
                          key={item.idVolume}
                          value={item.idVolume}
                          className="text-[10pt]"
                        >
                          {item.idVolume} - {item.designator}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(() => {
                const selectedItem = items.find(
                  (i) => i.idVolume === selectedIdVolume,
                );
                return selectedItem ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10pt] font-medium">
                        Jenis Pekerjaan
                      </Label>
                      <Input
                        readOnly
                        value={selectedItem.jenis}
                        className="text-[10pt] h-9 bg-muted text-muted-foreground"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10pt] font-medium">Satuan</Label>
                      <Input
                        readOnly
                        value={selectedItem.satuan}
                        className="text-[10pt] h-9 bg-muted text-muted-foreground"
                      />
                    </div>
                  </div>
                ) : null;
              })()}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-[10pt] font-medium">Alat Kerja</Label>
                  <Select
                    value={selectedAlatKerja}
                    onValueChange={(val) => setSelectedAlatKerja(val || "")}
                  >
                    <SelectTrigger className="text-[10pt]">
                      <SelectValue placeholder="Pilih Alat Kerja" />
                    </SelectTrigger>
                    <SelectContent>
                      {MASTER_ALAT_KERJA_DATA.map((a) => (
                        <SelectItem
                          key={a.code}
                          value={a.name}
                          className="text-[10pt]"
                        >
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10pt] font-medium">Mandor</Label>
                  <Select
                    value={selectedMandor}
                    onValueChange={(val) => setSelectedMandor(val || "")}
                  >
                    <SelectTrigger className="text-[10pt]">
                      <SelectValue placeholder="Pilih Mandor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Budi Santoso" className="text-[10pt]">
                        Budi Santoso
                      </SelectItem>
                      <SelectItem
                        value="Agus Supriyadi"
                        className="text-[10pt]"
                      >
                        Agus Supriyadi
                      </SelectItem>
                      <SelectItem value="Joko Widodo" className="text-[10pt]">
                        Joko Anwar
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10pt] font-medium">Span</Label>
                <Input
                  placeholder="Contoh: STA 0+000 s.d STA 0+500"
                  value={inputSpan}
                  onChange={(e) => setInputSpan(e.target.value)}
                  className="text-[10pt]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-[10pt] font-medium">
                    Volume Progress Hari Ini
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Contoh: 150"
                    value={inputVolume || ""}
                    onChange={(e) =>
                      setInputVolume(parseFloat(e.target.value) || 0)
                    }
                    className="text-[10pt]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10pt] font-medium">
                    Evidence (Opsional)
                  </Label>
                  <Input
                    type="file"
                    className="text-[10pt] pt-1.5"
                    onChange={(e) => setInputEvidence(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddDailyModalOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" size="sm">
                  Simpan Volume
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Toolbar: Filter Dropdown & Search Box */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* Dropdown Filter Jenis Pekerjaan (Sesuai request: buat filternya menggunakan drop-down aja) */}
          <div className="flex items-center gap-2">
            <span className="text-[10pt] text-muted-foreground flex items-center gap-1.5 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Filter Jenis:
            </span>
            <Select
              value={selectedJenis}
              onValueChange={(val) => setSelectedJenis(val || "Semua Jenis")}
            >
              <SelectTrigger className="w-[180px] min-h-[44px] h-11 data-[size=default]:h-11 text-[10pt] bg-background rounded-lg px-3.5">
                <SelectValue placeholder="Pilih Jenis" />
              </SelectTrigger>
              <SelectContent>
                {JENIS_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt} className="text-[10pt]">
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="text-[10pt] text-muted-foreground ml-2">
              Menampilkan <b>{filteredItems.length}</b> dari {items.length} item
            </span>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari ID, Designator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 min-h-[44px] h-11 text-[10pt] bg-background rounded-lg"
            />
          </div>
        </div>
      </CardHeader>

      {/* Tabel dengan Freeze Columns (ID Volume s/d Jenis) dan scroll ke kanan per tanggal */}
      <CardContent className="p-0">
        {items.length === 0 ? (
          <div className="py-16 px-6 flex flex-col items-center justify-center text-center bg-muted/5 rounded-xl border border-dashed border-border/80 m-4 sm:m-6">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
              <Layers className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1.5">
              Belum Ada Item Pekerjaan (Designator)
            </h3>
            <p className="text-[10pt] text-muted-foreground max-w-md mb-6 leading-relaxed">
              Proyek ini baru dibuat dan belum memiliki daftar pekerjaan fisik.
              Tambahkan item pekerjaan (seperti penarikan kabel, jointing,
              galian, terminasi) untuk menetapkan target BOQ dan mulai memantau
              progres harian.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                onClick={() => {
                  setNewItemForm({
                    idVolume: "VOL-001",
                    designator: "",
                    namaDeskripsi: "",
                    jenis: "Kabel",
                    satuan: "Meter",
                    bobotPersen: 20,
                    volumeTarget: 1000,
                  });
                  setIsAddItemModalOpen(true);
                }}
                className="gap-2 text-[10pt] h-9 px-4 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Item Pekerjaan</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleLoadSampleTemplate}
                className="gap-2 text-[10pt] h-9 px-4 border-dashed"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Gunakan Template Contoh FO (6 Item)</span>
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* DESKTOP VIEW: Tabel dengan Freeze Columns (Layar >= 768px) */}
            <div className="hidden md:block relative overflow-x-auto w-full max-w-full">
              <Table className="text-[10pt] whitespace-nowrap border-collapse">
                <TableHeader className="bg-muted/40">
                  <TableRow className="border-b">
                    {/* FREEZE 1: ID Volume (Sticky Left: 0px) */}
                    <TableHead className="font-semibold text-foreground px-3 py-3 w-[85px] min-w-[85px] sticky left-0 z-30 bg-muted/95 backdrop-blur-xs border-r shadow-[1px_0_0_0_hsl(var(--border))]">
                      ID VOLUME
                    </TableHead>

                    {/* FREEZE 2: Designator (Sticky Left: 85px) */}
                    <TableHead className="font-semibold text-foreground px-3 py-3 w-[220px] min-w-[220px] sticky left-[85px] z-30 bg-muted/95 backdrop-blur-xs border-r shadow-[1px_0_0_0_hsl(var(--border))]">
                      DESIGNATOR
                    </TableHead>

                    {/* FREEZE 3: Jenis (Sticky Left: 305px) */}
                    <TableHead className="font-semibold text-foreground px-3 py-3 w-[100px] min-w-[100px] sticky left-[305px] z-30 bg-muted/95 backdrop-blur-xs border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)]">
                      JENIS
                    </TableHead>

                    {/* Kolom Satuan & Rekap Nilai */}
                    <TableHead className="font-semibold text-foreground px-2.5 py-3 text-center w-[65px] min-w-[65px] border-r">
                      SATUAN
                    </TableHead>
                    <TableHead className="font-semibold text-foreground px-3 py-3 text-right w-[95px] min-w-[95px] border-r">
                      TARGET BOQ
                    </TableHead>
                    <TableHead className="font-semibold text-foreground px-3 py-3 text-right w-[100px] min-w-[100px] border-r bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400">
                      TOTAL KUMULATIF
                    </TableHead>
                    <TableHead className="font-semibold text-foreground px-3 py-3 text-center w-[85px] min-w-[85px] border-r">
                      PROGRESS
                    </TableHead>

                    {/* KOLOM-KOLOM TANGGAL (Scroll ke kanan, isinya hanya angka) */}
                    {progressDates.map((dt) => {
                      const todayStr = toISODateString(new Date());
                      const isToday = dt === todayStr;
                      const formatted = formatDisplayDate(dt);
                      return (
                        <TableHead
                          key={dt}
                          className={`font-semibold px-2 py-2 text-center w-[75px] min-w-[75px] border-r ${
                            isToday
                              ? "bg-blue-100/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold"
                              : "text-foreground/80"
                          }`}
                        >
                          <div className="text-[10pt] leading-tight">{formatted.label}</div>
                          {formatted.subLabel && (
                            <div className="text-[8.5pt] font-normal text-muted-foreground leading-none mt-0.5">
                              {formatted.subLabel}
                            </div>
                          )}
                          {isToday && (
                            <div className="text-[8.5pt] font-medium text-blue-600 dark:text-blue-400 leading-none mt-0.5">
                              Hari Ini
                            </div>
                          )}
                        </TableHead>
                      );
                    })}

                    {/* Kolom Aksi Hapus */}
                    <TableHead className="font-semibold text-foreground px-2 py-3 text-center w-[100px] min-w-[100px] sticky right-0 bg-muted/95 backdrop-blur-xs border-l shadow-[-1px_0_0_0_hsl(var(--border))] z-30">
                      AKSI
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8 + progressDates.length}
                        className="text-center py-12 text-muted-foreground"
                      >
                        Tidak ditemukan data designator yang sesuai dengan
                        filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => {
                      const total = getVolumeTotal(item);
                      const progress = getProgressPercent(item);

                      return (
                        <TableRow
                          key={item.idVolume}
                          className="hover:bg-muted/20 transition-colors group"
                        >
                          {/* FREEZE 1: ID Volume */}
                          <TableCell className="px-3 py-2.5 font-semibold text-primary sticky left-0 z-20 bg-card border-r shadow-[1px_0_0_0_hsl(var(--border))]">
                            {item.idVolume}
                          </TableCell>

                          {/* FREEZE 2: Designator */}
                          <TableCell className="px-3 py-2.5 sticky left-[85px] z-20 bg-card border-r shadow-[1px_0_0_0_hsl(var(--border))]">
                            <div className="font-medium text-foreground">
                              {item.designator}
                            </div>
                            <div className="text-[10pt] text-muted-foreground truncate max-w-[200px]">
                              {item.namaDeskripsi}
                            </div>
                          </TableCell>

                          {/* FREEZE 3: Jenis */}
                          <TableCell className="px-3 py-2.5 sticky left-[305px] z-20 bg-card border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)]">
                            <Badge
                              variant="outline"
                              className={`text-[10pt] font-normal px-1.5 py-0 ${getJenisBadgeClass(item.jenis)}`}
                            >
                              {item.jenis}
                            </Badge>
                          </TableCell>

                          {/* Satuan */}
                          <TableCell className="px-2.5 py-2.5 text-center font-medium text-muted-foreground border-r">
                            {item.satuan}
                          </TableCell>

                          {/* Target BOQ */}
                          <TableCell className="px-3 py-2.5 text-right font-medium border-r">
                            {item.volumeTarget.toLocaleString()}
                          </TableCell>

                          {/* Total Kumulatif Aktual */}
                          <TableCell className="px-3 py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/20 dark:bg-emerald-950/10 border-r">
                            {total.toLocaleString()}
                          </TableCell>

                          {/* Progress % */}
                          <TableCell className="px-3 py-2.5 text-center border-r">
                            <span className="font-semibold text-[10pt] text-foreground">
                              {progress}%
                            </span>
                          </TableCell>

                          {/* KOLOM TANGGAL (Cuma angka volume harian) */}
                          {progressDates.map((dt) => {
                            const val = getItemDailyVolume(item, dt);
                            const todayStr = toISODateString(new Date());
                            const isToday = dt === todayStr;

                            return (
                              <TableCell
                                key={dt}
                                className={`px-2 py-2.5 text-center text-[10pt] border-r ${
                                  isToday
                                    ? "bg-blue-50/30 dark:bg-blue-950/20 font-semibold text-blue-700 dark:text-blue-400"
                                    : ""
                                }`}
                              >
                                {val > 0 ? (
                                  val.toLocaleString()
                                ) : (
                                  <span className="text-muted-foreground/40">
                                    -
                                  </span>
                                )}
                              </TableCell>
                            );
                          })}

                          {/* Aksi Hapus */}
                          <TableCell className="px-1 py-1 text-center sticky right-0 bg-card border-l shadow-[-1px_0_0_0_hsl(var(--border))] z-20">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setActiveItem(item);
                                  setIsHistoryModalOpen(true);
                                }}
                                className="h-7 w-7 text-muted-foreground hover:text-blue-500"
                                title="Lihat Riwayat"
                              >
                                <History className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setActiveItem(item);
                                  setNewItemForm({
                                    idVolume: item.idVolume,
                                    designator: item.designator,
                                    namaDeskripsi: item.namaDeskripsi,
                                    jenis: item.jenis,
                                    satuan: item.satuan,
                                    bobotPersen: item.bobotPersen,
                                    volumeTarget: item.volumeTarget,
                                  });
                                  setActionReason("");
                                  setIsEditItemModalOpen(true);
                                }}
                                className="h-7 w-7 text-muted-foreground hover:text-primary"
                                title="Edit Item"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setActiveItem(item);
                                  setActionReason("");
                                  setIsDeleteItemModalOpen(true);
                                }}
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                title="Hapus Item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* MOBILE VIEW: List per Card Pekerjaan (Optimal untuk ukuran layar mobile lebar 390px) */}
            <div className="md:hidden divide-y divide-border/60">
              {filteredItems.length === 0 ? (
                <div className="p-8 text-center text-[10pt] text-muted-foreground">
                  Tidak ditemukan data designator yang sesuai dengan filter.
                </div>
              ) : (
                filteredItems.map((item) => {
                  const total = getVolumeTotal(item);
                  const progress = getProgressPercent(item);

                  return (
                    <div
                      key={item.idVolume}
                      className="p-4 space-y-3 bg-card hover:bg-muted/10 transition-colors"
                    >
                      {/* Header Card: ID Volume, Jenis Badge, Progress & Tombol Hapus */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-primary text-[10pt]">
                              {item.idVolume}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-[10pt] font-normal px-1.5 py-0 ${getJenisBadgeClass(item.jenis)}`}
                            >
                              {item.jenis}
                            </Badge>
                          </div>
                          <div className="font-semibold text-foreground text-[10pt] mt-1">
                            {item.designator}
                          </div>
                          <div className="text-[10pt] text-muted-foreground mt-0.5 line-clamp-2">
                            {item.namaDeskripsi}
                          </div>
                        </div>

                        {/* Progress Badge & Tombol Hapus */}
                        <div className="text-right shrink-0 flex items-center gap-1.5">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-[10pt] font-bold ${
                              progress >= 100
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                : progress > 0
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {progress}%
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setActiveItem(item);
                              setIsHistoryModalOpen(true);
                            }}
                            className="h-7 w-7 text-muted-foreground hover:text-blue-500"
                          >
                            <History className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setActiveItem(item);
                              setNewItemForm({
                                idVolume: item.idVolume,
                                designator: item.designator,
                                namaDeskripsi: item.namaDeskripsi,
                                jenis: item.jenis,
                                satuan: item.satuan,
                                bobotPersen: item.bobotPersen,
                                volumeTarget: item.volumeTarget,
                              });
                              setActionReason("");
                              setIsEditItemModalOpen(true);
                            }}
                            className="h-7 w-7 text-muted-foreground hover:text-primary"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setActiveItem(item);
                              setActionReason("");
                              setIsDeleteItemModalOpen(true);
                            }}
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Progress Bar Visual */}
                      <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            progress >= 100 ? "bg-emerald-500" : "bg-primary"
                          }`}
                          style={{ width: `${Math.min(100, progress)}%` }}
                        />
                      </div>

                      {/* Grid Metrik: Target BOQ, Realisasi Aktual, Satuan */}
                      <div className="grid grid-cols-3 gap-2 bg-muted/30 p-2.5 rounded-lg text-[10pt] border border-border/50">
                        <div>
                          <div className="text-[10pt] text-muted-foreground">
                            Target BOQ
                          </div>
                          <div className="font-semibold text-foreground mt-0.5">
                            {item.volumeTarget.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10pt] text-muted-foreground">
                            Total Aktual
                          </div>
                          <div className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                            {total.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10pt] text-muted-foreground">
                            Satuan
                          </div>
                          <div className="font-medium text-foreground mt-0.5">
                            {item.satuan}
                          </div>
                        </div>
                      </div>

                      {/* Scroll Tanggal Harian di Mobile (Compact Chips) */}
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[10pt] font-medium text-muted-foreground flex items-center justify-between">
                          <span>Volume Harian:</span>
                          <button
                            type="button"
                            className="text-primary text-[10pt] font-medium hover:underline flex items-center gap-1 cursor-pointer"
                            onClick={() => {
                              setSelectedIdVolume(item.idVolume);
                              setIsAddDailyModalOpen(true);
                            }}
                          >
                            + Update
                          </button>
                        </div>
                        <div className="flex gap-1.5 overflow-x-auto pb-1 text-[10pt] no-scrollbar">
                          {progressDates.map((dt) => {
                            const val = getItemDailyVolume(item, dt);
                            const todayStr = toISODateString(new Date());
                            const isToday = dt === todayStr;
                            const formatted = formatDisplayDate(dt);
                            return (
                              <div
                                key={dt}
                                className={`shrink-0 px-2.5 py-1 rounded border text-center ${
                                  isToday
                                    ? "bg-blue-50/60 border-blue-300 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold"
                                    : val > 0
                                      ? "bg-card border-border/80 text-foreground font-medium"
                                      : "bg-muted/20 border-border/40 text-muted-foreground/50"
                                }`}
                              >
                                <div className="text-[9px] text-muted-foreground leading-none mb-0.5">
                                  {formatted.label}
                                </div>
                                <div className="text-[10pt] leading-none">
                                  {val > 0 ? val.toLocaleString() : "-"}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </CardContent>

      {/* Modal Edit Item */}
      <Dialog open={isEditItemModalOpen} onOpenChange={setIsEditItemModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Pencil className="w-4 h-4 text-primary" />
              Edit Item Pekerjaan
            </DialogTitle>
            <DialogDescription className="text-[10pt]">
              Ubah rincian spesifikasi pekerjaan. Anda harus menyertakan alasan
              perubahan.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmEdit} className="space-y-3.5 py-2">
            <div className="space-y-1.5 p-3 rounded-lg bg-muted/30 border border-border/50">
              <Label className="text-[10pt] font-medium text-destructive">
                Alasan Perubahan (Wajib)*
              </Label>
              <Input
                required
                placeholder="Contoh: Update spesifikasi tiang"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="text-[10pt] h-9"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10pt] font-medium">
                  ID Volume (Tidak bisa diubah)
                </Label>
                <Input
                  value={newItemForm.idVolume}
                  disabled
                  className="text-[10pt] h-9 opacity-50 bg-muted"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10pt] font-medium">
                  Jenis Pekerjaan*
                </Label>
                <Select
                  value={newItemForm.jenis}
                  onValueChange={(val: any) =>
                    setNewItemForm({ ...newItemForm, jenis: val })
                  }
                >
                  <SelectTrigger className="text-[10pt] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {JENIS_OPTIONS.filter((j) => j !== "Semua Jenis").map(
                      (opt) => (
                        <SelectItem
                          key={opt}
                          value={opt}
                          className="text-[10pt]"
                        >
                          {opt}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10pt] font-medium">
                Kode Designator*
              </Label>
              <Input
                required
                placeholder="Contoh: AC-OF-SM-ADSS-24D"
                value={newItemForm.designator}
                onChange={(e) =>
                  setNewItemForm({ ...newItemForm, designator: e.target.value })
                }
                className="text-[10pt] h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10pt] font-medium">
                Deskripsi Pekerjaan
              </Label>
              <Input
                placeholder="Contoh: Penarikan Kabel"
                value={newItemForm.namaDeskripsi}
                onChange={(e) =>
                  setNewItemForm({
                    ...newItemForm,
                    namaDeskripsi: e.target.value,
                  })
                }
                className="text-[10pt] h-9"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10pt] font-medium">Satuan</Label>
                <Select
                  value={newItemForm.satuan}
                  onValueChange={(val: any) =>
                    setNewItemForm({ ...newItemForm, satuan: val })
                  }
                >
                  <SelectTrigger className="text-[10pt] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SATUAN_OPTIONS.map((sat) => (
                      <SelectItem key={sat} value={sat} className="text-[10pt]">
                        {sat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10pt] font-medium">Target BOQ*</Label>
                <Input
                  type="number"
                  min="1"
                  required
                  value={newItemForm.volumeTarget || ""}
                  onChange={(e) =>
                    setNewItemForm({
                      ...newItemForm,
                      volumeTarget: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="text-[10pt] h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10pt] font-medium">Bobot (%)*</Label>
                <Input
                  type="number"
                  min="0.1"
                  max="100"
                  step="0.1"
                  required
                  value={newItemForm.bobotPersen || ""}
                  onChange={(e) =>
                    setNewItemForm({
                      ...newItemForm,
                      bobotPersen: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="text-[10pt] h-9"
                />
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditItemModalOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" size="sm">
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Hapus Item */}
      <Dialog
        open={isDeleteItemModalOpen}
        onOpenChange={setIsDeleteItemModalOpen}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base text-destructive">
              <Trash2 className="w-4 h-4" />
              Konfirmasi Hapus Designator
            </DialogTitle>
            <DialogDescription className="text-[10pt]">
              Apakah Anda yakin ingin menghapus {activeItem?.idVolume}? Aksi ini
              tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmDelete} className="space-y-3.5 py-2">
            <div className="space-y-1.5 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <Label className="text-[10pt] font-medium text-destructive">
                Alasan Penghapusan (Wajib)*
              </Label>
              <Input
                required
                placeholder="Contoh: Item dibatalkan dari kontrak"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="text-[10pt] h-9 border-destructive/30 focus-visible:ring-destructive"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteItemModalOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" size="sm" variant="destructive">
                Hapus Permanen
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal History */}
      <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <History className="w-4 h-4 text-primary" />
              Riwayat Perubahan: {activeItem?.idVolume}
            </DialogTitle>
            <DialogDescription className="text-[10pt]">
              Melihat daftar perubahan yang pernah dilakukan pada item ini
              beserta alasan dan pelakunya.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 max-h-[400px] overflow-y-auto pr-2">
            {!activeItem?.changeHistory ||
            activeItem.changeHistory.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-[10pt]">
                Belum ada riwayat perubahan pada item ini.
              </div>
            ) : (
              <div className="relative border-l border-muted ml-3 space-y-6">
                {activeItem.changeHistory.map((log) => (
                  <div key={log.id} className="relative pl-5">
                    <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-background" />
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10pt] font-medium">
                        {log.action === "add"
                          ? "Penambahan"
                          : log.action === "edit"
                            ? "Pembaruan Data"
                            : "Penghapusan"}
                      </span>
                      <span className="text-[10pt] text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="bg-muted/40 p-2.5 rounded-lg border text-[10pt] space-y-1.5 mt-1.5">
                      <div className="flex gap-2">
                        <span className="text-muted-foreground w-12 shrink-0">
                          Alasan:
                        </span>
                        <span className="font-medium">{log.reason}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-muted-foreground w-12 shrink-0">
                          Oleh:
                        </span>
                        <span className="font-medium text-primary">
                          {log.role}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-muted-foreground w-12 shrink-0">
                          Detail:
                        </span>
                        <span>{log.details || "-"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
