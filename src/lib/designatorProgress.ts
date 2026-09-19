export type JenisPekerjaan = 
  | 'Galian'
  | 'Kabel'
  | 'Tiang'
  | 'Jembatan'
  | 'Handhole'
  | 'Terminasi'
  | 'Uji Terima (UT)'
  | 'Commisioning Test (CT)'
  | 'BA Rekon'
  | 'Jointing'
  | 'Manhole'
  | 'Aksesoris';

export const JENIS_PEKERJAAN_LIST: readonly JenisPekerjaan[] = [
  'Galian',
  'Handhole',
  'Kabel',
  'Tiang',
  'Jembatan',
  'Terminasi',
  'Uji Terima (UT)',
  'Commisioning Test (CT)',
  'BA Rekon',
] as const;

export type SatuanPekerjaan = 
  | 'Meter' 
  | 'pcs' 
  | 'core' 
  | 'set' 
  | 'unit' 
  | 'node' 
  | 'track' 
  | 'm3' 
  | 'titik' 
  | 'lumpsum' 
  | 'batang'
  | 'link'
  | 'dokumen';

// Helper format tanggal ISO YYYY-MM-DD
export function toISODateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Helper display tanggal ramah pengguna (misal: '16 Sep', subLabel '2026', fullDate '16/09/2026')
export function formatDisplayDate(dateStr: string): { label: string; subLabel?: string; fullDate: string } {
  if (!dateStr) return { label: '-', fullDate: '-' };
  if (dateStr.includes('-')) {
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts;
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const mIdx = parseInt(m, 10) - 1;
      return {
        label: `${parseInt(d, 10)} ${monthNames[mIdx] || m}`,
        subLabel: y,
        fullDate: `${d}/${m}/${y}`,
      };
    }
  }
  return { label: dateStr, fullDate: dateStr };
}

// Generator array tanggal berurutan dari Start Date sampai Target Date (Plan ke Progress)
export function generateProgressDates(startDate?: string, endDate?: string): string[] {
  if (startDate && endDate) {
    const start = new Date(startDate.split('T')[0]);
    const end = new Date(endDate.split('T')[0]);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= end) {
      const dates: string[] = [];
      const current = new Date(start);
      let count = 0;
      while (current <= end && count < 1000) {
        dates.push(toISODateString(current));
        current.setDate(current.getDate() + 1);
        count++;
      }
      if (dates.length > 0) return dates;
    }
  }
  // Fallback jika tidak ada range proyek: 14 hari dari hari ini
  const fallback: string[] = [];
  const current = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(current);
    d.setDate(current.getDate() + i);
    fallback.push(toISODateString(d));
  }
  return fallback;
}

// Helper membaca nilai volume harian item dengan support key YYYY-MM-DD maupun DD/MM lama
export function getItemDailyVolume(item: DesignatorItem, dateKey: string): number {
  if (!item?.dailyVolumes) return 0;
  if (item.dailyVolumes[dateKey] !== undefined) {
    return Number(item.dailyVolumes[dateKey]);
  }
  // Jika dateKey YYYY-MM-DD tapi item disimpan dengan DD/MM
  if (dateKey.includes('-')) {
    const parts = dateKey.split('T')[0].split('-');
    if (parts.length === 3) {
      const altKey = `${parts[2]}/${parts[1]}`;
      if (item.dailyVolumes[altKey] !== undefined) {
        return Number(item.dailyVolumes[altKey]);
      }
    }
  }
  // Jika dateKey DD/MM tapi item disimpan dengan YYYY-MM-DD
  if (dateKey.includes('/')) {
    const [d, m] = dateKey.split('/');
    for (const k of Object.keys(item.dailyVolumes)) {
      if (k.endsWith(`-${m.padStart(2, '0')}-${d.padStart(2, '0')}`)) {
        return Number(item.dailyVolumes[k]);
      }
    }
  }
  return 0;
}

// Daftar kolom tanggal default ISO (14 hari)
export const PROGRESS_DATES: string[] = generateProgressDates();

export interface ChangeLogEntry {
  id: string;
  action: 'add' | 'edit' | 'delete';
  reason: string;
  role: 'PMO' | 'Site Manager';
  timestamp: string;
  details?: string;
}

export interface DailyProgressRecord {
  volume: number;
  alatKerja?: string;
  mandor?: string;
  span?: string;
  evidence?: string;
  kendala?: string;
  solusi?: string;
  cuaca?: string;
}


export interface DesignatorItem {
  idVolume: string; // contoh: VOL-001
  designator: string; // kode spesifikasi/nama pekerjaan teknis
  namaDeskripsi: string;
  jenis: JenisPekerjaan;
  satuan: SatuanPekerjaan;
  bobotPersen: number; // bobot pekerjaan dalam keseluruhan proyek (%)
  volumeTarget: number;
  // Volume harian per tanggal: key adalah label tanggal (contoh: '01/09': 800)
  dailyVolumes: Record<string, number>;
  // Rincian progress harian: key adalah label tanggal
  dailyRecords?: Record<string, DailyProgressRecord[]>;

  // Field kompatibilitas antarmuka
  id?: string;
  volumeId?: string;
  code?: string;
  description?: string;
  type?: string;
  unit?: string;
  weightPercent?: number;
  boqVolume?: number;
  prevVolume?: number;
  todayVolume?: number;
  totalVolume?: number;
  realizationPercent?: number;

  changeHistory?: ChangeLogEntry[];
}

export interface SCurvePoint {
  dayLabel: string; // misal 'Day 1', 'Day 2', dll
  date: string;
  targetPercent: number; // Rencana kumulatif (%)
  actualPercent: number | null; // Aktual kumulatif (%)
}

// Initial default designator items untuk proyek fiber optik sesuai 9 Jenis Pekerjaan
export const DEFAULT_DESIGNATOR_ITEMS: DesignatorItem[] = [
  {
    idVolume: 'VOL-001',
    designator: 'GL-OPEN-TRENCH-1M',
    namaDeskripsi: 'Galian Tanah Manual Kedalaman 1 Meter',
    jenis: 'Galian',
    satuan: 'Meter',
    bobotPersen: 15.0,
    volumeTarget: 4500,
    dailyVolumes: {},
  },
  {
    idVolume: 'VOL-002',
    designator: 'AC-OF-SM-ADSS-24D',
    namaDeskripsi: 'Penarikan Kabel Fiber Optik ADSS 24 Core',
    jenis: 'Kabel',
    satuan: 'Meter',
    bobotPersen: 25.0,
    volumeTarget: 15000,
    dailyVolumes: {},
  },
  {
    idVolume: 'VOL-003',
    designator: 'PU-S7.0-140',
    namaDeskripsi: 'Pendirian Tiang Besi 7 Meter 140 daN',
    jenis: 'Tiang',
    satuan: 'batang',
    bobotPersen: 15.0,
    volumeTarget: 180,
    dailyVolumes: {},
  },
  {
    idVolume: 'VOL-004',
    designator: 'JB-SPAN-TRAYS-FO',
    namaDeskripsi: 'Konstruksi Jembatan Kabel & Trays FO',
    jenis: 'Jembatan',
    satuan: 'Meter',
    bobotPersen: 8.0,
    volumeTarget: 250,
    dailyVolumes: {},
  },
  {
    idVolume: 'VOL-005',
    designator: 'HH-PRECAST-TYPE-B',
    namaDeskripsi: 'Pemasangan Precast Handhole Type B',
    jenis: 'Handhole',
    satuan: 'unit',
    bobotPersen: 7.0,
    volumeTarget: 24,
    dailyVolumes: {},
  },
  {
    idVolume: 'VOL-006',
    designator: 'TM-ODC-144C',
    namaDeskripsi: 'Terminasi ODC 144 Core',
    jenis: 'Terminasi',
    satuan: 'core',
    bobotPersen: 10.0,
    volumeTarget: 144,
    dailyVolumes: {},
  },
  {
    idVolume: 'VOL-007',
    designator: 'UT-OTDR-OPM-TEST',
    namaDeskripsi: 'Uji Terima (UT) Pengukuran OTDR & OPM End-to-End',
    jenis: 'Uji Terima (UT)',
    satuan: 'link',
    bobotPersen: 8.0,
    volumeTarget: 12,
    dailyVolumes: {},
  },
  {
    idVolume: 'VOL-008',
    designator: 'CT-COMM-BER-TEST',
    namaDeskripsi: 'Commisioning Test (CT) & Bit Error Rate Test',
    jenis: 'Commisioning Test (CT)',
    satuan: 'link',
    bobotPersen: 7.0,
    volumeTarget: 12,
    dailyVolumes: {},
  },
  {
    idVolume: 'VOL-009',
    designator: 'BA-REKON-ASBUILT',
    namaDeskripsi: 'Penyusunan Dokumen BA Rekon & As-Built Drawing',
    jenis: 'BA Rekon',
    satuan: 'dokumen',
    bobotPersen: 5.0,
    volumeTarget: 1,
    dailyVolumes: {},
  },
];

// Helper kalkulasi total kumulatif volume dari seluruh hari
export function getVolumeTotal(item: DesignatorItem): number {
  if (item.totalVolume !== undefined && item.totalVolume > 0) {
    return item.totalVolume;
  }
  if (!item.dailyVolumes) return 0;
  return Object.values(item.dailyVolumes).reduce((sum, val) => sum + (Number(val) || 0), 0);
}

// Helper kalkulasi persen capaian designator item
export function getProgressPercent(item: DesignatorItem): number {
  const target = item.volumeTarget || item.boqVolume || 0;
  if (target <= 0) return 0;
  const total = getVolumeTotal(item);
  const pct = (total / target) * 100;
  return Math.min(100, parseFloat(pct.toFixed(1)));
}

// Helper kalkulasi persen total proyek tertimbang (weighted progress) murni berdasarkan data
export function calculateOverallProjectProgress(
  items: DesignatorItem[],
  startDate?: string,
  targetDate?: string
): {
  targetPercent: number;
  actualPercent: number;
  deviation: number;
} {
  if (!items || items.length === 0) {
    return {
      targetPercent: 0,
      actualPercent: 0,
      deviation: 0,
    };
  }

  let totalWeightedActual = 0;
  let totalBobot = 0;
  let hasAnyInput = false;

  items.forEach((item) => {
    const target = item.volumeTarget || item.boqVolume || 0;
    const totalVol = getVolumeTotal(item);
    if (totalVol > 0) hasAnyInput = true;
    if (target > 0) {
      const pct = (totalVol / target) * 100;
      totalWeightedActual += (pct * item.bobotPersen) / 100;
    }
    totalBobot += item.bobotPersen;
  });

  // Jika belum ada satupun progres volume yang diinputkan
  if (!hasAnyInput) {
    return {
      targetPercent: 0,
      actualPercent: 0,
      deviation: 0,
    };
  }

  const actualPercent = totalBobot > 0 ? parseFloat(((totalWeightedActual / totalBobot) * 100).toFixed(2)) : 0;
  
  // Target proporsional riil berdasarkan waktu kalender yang telah berlalu
  let targetPercent = 0;
  if (startDate && targetDate) {
    const start = new Date(startDate.split('T')[0]).getTime();
    const end = new Date(targetDate.split('T')[0]).getTime();
    const now = new Date().getTime();
    if (end > start) {
      if (now <= start) {
        targetPercent = 0;
      } else if (now >= end) {
        targetPercent = 100;
      } else {
        targetPercent = parseFloat((((now - start) / (end - start)) * 100).toFixed(2));
      }
    }
  }

  const deviation = parseFloat((actualPercent - targetPercent).toFixed(2));

  return {
    targetPercent,
    actualPercent,
    deviation,
  };
}

// Generator data Kurva S harian (100% based on data riil)
export function generateSCurveData(items: DesignatorItem[], progressDates: string[]): SCurvePoint[] {
  if (!items || items.length === 0) {
    return [];
  }

  // Kumpulkan semua tanggal yang benar-benar memiliki input volume
  const recordedDatesSet = new Set<string>();
  items.forEach((item) => {
    if (item.dailyVolumes) {
      Object.entries(item.dailyVolumes).forEach(([dKey, vol]) => {
        if (Number(vol) > 0) {
          recordedDatesSet.add(dKey);
        }
      });
    }
    if (item.dailyRecords) {
      Object.entries(item.dailyRecords).forEach(([dKey, recs]) => {
        if (recs && recs.length > 0) {
          recordedDatesSet.add(dKey);
        }
      });
    }
  });

  // JIKA TIDAK ADA DATA SAMA SEKALI, JANGAN TAMPILKAN GRAFIK FIKTIF
  if (recordedDatesSet.size === 0) {
    return [];
  }

  const sortedDates = Array.from(recordedDatesSet).sort();
  const totalBobot = items.reduce((sum, item) => sum + item.bobotPersen, 0);
  const totalDays = progressDates.length || sortedDates.length || 1;

  // Ambil rentang tanggal dari tanggal mulai sampai tanggal terakhir yang memiliki input data
  const lastRecordedDate = sortedDates[sortedDates.length - 1];
  let activeDates = progressDates.filter((d) => d <= lastRecordedDate);
  if (activeDates.length === 0) {
    activeDates = sortedDates;
  }

  const curvePoints: SCurvePoint[] = [];

  for (let i = 0; i < activeDates.length; i++) {
    const dateLabel = activeDates[i];
    const display = formatDisplayDate(dateLabel);
    const dayLabel = `Day ${i + 1} (${display.fullDate || dateLabel})`;

    let accumulatedWeightedActual = 0;

    items.forEach((item) => {
      const target = item.volumeTarget || item.boqVolume || 0;
      if (target > 0) {
        let accumulatedVol = 0;
        for (let j = 0; j <= i; j++) {
          accumulatedVol += getItemDailyVolume(item, activeDates[j]);
        }
        const pct = Math.min(100, (accumulatedVol / target) * 100);
        accumulatedWeightedActual += (pct * item.bobotPersen) / 100;
      }
    });

    const actualPercent = totalBobot > 0
      ? parseFloat(((accumulatedWeightedActual / totalBobot) * 100).toFixed(2))
      : 0;

    // Target proporsional riil hari tersebut
    const targetPercent = parseFloat((((i + 1) / totalDays) * 100).toFixed(2));

    curvePoints.push({
      dayLabel,
      date: display.fullDate || dateLabel,
      targetPercent,
      actualPercent,
    });
  }

  return curvePoints;
}

export interface GroupSummaryItem {
  name: string; // misal 'Galian', 'Handhole', 'Kabel'
  itemCount: number;
  totalBobot: number; // total bobot (%) grup terhadap proyek
  totalVolumeTarget: number;
  totalVolumeActual: number;
  primaryUnit: string;
  actualPercent: number; // realisasi progres grup (0 - 100%)
  targetPercent: number;
  deviation: number;
  items: DesignatorItem[];
}

export const STANDARD_GROUP_DEFAULTS: Record<string, { primaryUnit: string; defaultBobot: number }> = {
  'Galian': { primaryUnit: 'Meter', defaultBobot: 15 },
  'Handhole': { primaryUnit: 'unit', defaultBobot: 7 },
  'Kabel': { primaryUnit: 'Meter', defaultBobot: 25 },
  'Tiang': { primaryUnit: 'batang', defaultBobot: 15 },
  'Jembatan': { primaryUnit: 'Meter', defaultBobot: 8 },
  'Terminasi': { primaryUnit: 'core', defaultBobot: 10 },
  'Uji Terima (UT)': { primaryUnit: 'link', defaultBobot: 8 },
  'Commisioning Test (CT)': { primaryUnit: 'link', defaultBobot: 7 },
  'BA Rekon': { primaryUnit: 'dokumen', defaultBobot: 5 },
};

// Helper kalkulasi ringkasan semua grup pekerjaan dari daftar designator
export function getGroupSummaryList(items: DesignatorItem[]): GroupSummaryItem[] {
  const groupMap = new Map<string, DesignatorItem[]>();

  // Selalu inisialisasi semua grup standar terlebih dahulu
  JENIS_PEKERJAAN_LIST.forEach((g) => {
    groupMap.set(g, []);
  });

  // Masukkan item-item yang ada ke grup yang sesuai
  items.forEach((item) => {
    const rawKey = (item.jenis || item.type || '').trim();
    // Cocokkan ke standard jika ada
    const matchedStandard = (JENIS_PEKERJAAN_LIST as readonly string[]).find(
      (g) => g.toLowerCase() === rawKey.toLowerCase()
    );
    const key = matchedStandard || rawKey || 'Lainnya';
    if (!groupMap.has(key)) {
      groupMap.set(key, []);
    }
    groupMap.get(key)!.push(item);
  });

  const summaryList: GroupSummaryItem[] = [];

  groupMap.forEach((groupItems, groupName) => {
    if (groupItems.length === 0) {
      const def = STANDARD_GROUP_DEFAULTS[groupName];
      summaryList.push({
        name: groupName,
        itemCount: 0,
        totalBobot: def?.defaultBobot || 0,
        totalVolumeTarget: 0,
        totalVolumeActual: 0,
        primaryUnit: def?.primaryUnit || 'Meter',
        actualPercent: 0,
        targetPercent: 68.5,
        deviation: -68.5,
        items: [],
      });
      return;
    }

    let totalBobot = 0;
    let totalWeightedActual = 0;
    let totalVolumeTarget = 0;
    let totalVolumeActual = 0;
    const unitCounts: Record<string, number> = {};

    groupItems.forEach((item) => {
      totalBobot += item.bobotPersen || 0;
      const targetVol = item.volumeTarget || item.boqVolume || 0;
      const actVol = getVolumeTotal(item);
      totalVolumeTarget += targetVol;
      totalVolumeActual += actVol;

      const pct = getProgressPercent(item);
      totalWeightedActual += (pct * (item.bobotPersen || 0));

      const u = item.satuan || item.unit || 'Meter';
      unitCounts[u] = (unitCounts[u] || 0) + 1;
    });

    // Cari unit yang paling dominan di grup ini
    let primaryUnit = STANDARD_GROUP_DEFAULTS[groupName]?.primaryUnit || 'Meter';
    let maxCount = -1;
    Object.entries(unitCounts).forEach(([u, count]) => {
      if (count > maxCount) {
        maxCount = count;
        primaryUnit = u;
      }
    });

    const actualPercent = totalBobot > 0 
      ? parseFloat((totalWeightedActual / totalBobot).toFixed(2)) 
      : 0;
    const targetPercent = 68.5; // Baseline rata-rata
    const deviation = parseFloat((actualPercent - targetPercent).toFixed(2));

    summaryList.push({
      name: groupName,
      itemCount: groupItems.length,
      totalBobot: parseFloat(totalBobot.toFixed(2)),
      totalVolumeTarget,
      totalVolumeActual,
      primaryUnit,
      actualPercent,
      targetPercent,
      deviation,
      items: groupItems,
    });
  });

  // Urutkan grup berdasarkan urutan standar JENIS_PEKERJAAN_LIST
  return summaryList.sort((a, b) => {
    const idxA = (JENIS_PEKERJAAN_LIST as readonly string[]).indexOf(a.name);
    const idxB = (JENIS_PEKERJAAN_LIST as readonly string[]).indexOf(b.name);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.name.localeCompare(b.name);
  });
}

// Helper kalkulasi progres untuk satu grup pekerjaan tertentu
export function calculateGroupProgress(
  items: DesignatorItem[],
  groupName: string
): {
  targetPercent: number;
  actualPercent: number;
  deviation: number;
  totalBobot: number;
} {
  const groupItems = items.filter(
    (item) => (item.jenis || item.type || '').trim().toLowerCase() === groupName.trim().toLowerCase()
  );

  if (groupItems.length === 0) {
    const def = STANDARD_GROUP_DEFAULTS[groupName];
    return { targetPercent: 68.5, actualPercent: 0, deviation: -68.5, totalBobot: def?.defaultBobot || 0 };
  }

  let totalWeightedActual = 0;
  let totalBobot = 0;

  groupItems.forEach((item) => {
    const pct = getProgressPercent(item);
    totalWeightedActual += (pct * (item.bobotPersen || 0));
    totalBobot += item.bobotPersen || 0;
  });

  const actualPercent = totalBobot > 0 ? totalWeightedActual / totalBobot : 0;
  const targetPercent = 68.5;
  const roundedActual = parseFloat(actualPercent.toFixed(2));
  const deviation = parseFloat((roundedActual - targetPercent).toFixed(2));

  return {
    targetPercent,
    actualPercent: roundedActual,
    deviation,
    totalBobot: parseFloat(totalBobot.toFixed(2)),
  };
}

// Generator Kurva S khusus untuk satu grup pekerjaan
export function generateGroupSCurveData(
  items: DesignatorItem[],
  progressDates: string[],
  groupName: string
): SCurvePoint[] {
  const groupItems = items.filter(
    (item) => (item.jenis || item.type || '').trim().toLowerCase() === groupName.trim().toLowerCase()
  );

  if (groupItems.length === 0) return [];
  return generateSCurveData(groupItems, progressDates);
}

