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
  'Kabel',
  'Tiang',
  'Jembatan',
  'Handhole',
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

// Helper kalkulasi persen total proyek tertimbang (weighted progress)
export function calculateOverallProjectProgress(items: DesignatorItem[]): {
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

  items.forEach((item) => {
    const pct = getProgressPercent(item);
    totalWeightedActual += (pct * item.bobotPersen) / 100;
    totalBobot += item.bobotPersen;
  });

  const actualPercent = totalBobot > 0 ? (totalWeightedActual / totalBobot) * 100 : 0;
  const targetPercent = 68.5;
  const roundedActual = parseFloat(actualPercent.toFixed(2));
  const deviation = parseFloat((roundedActual - targetPercent).toFixed(2));

  return {
    targetPercent,
    actualPercent: roundedActual,
    deviation,
  };
}

// Generator data Kurva S harian (14 hari pemantauan)
export function generateSCurveData(items: DesignatorItem[], progressDates: string[]): SCurvePoint[] {
  if (!items || items.length === 0 || !progressDates || progressDates.length === 0) {
    return [];
  }

  const totalBobot = items.reduce((sum, item) => sum + item.bobotPersen, 0);
  const curvePoints: SCurvePoint[] = [];

  const N = progressDates.length;
  const todayISO = toISODateString(new Date());
  const todayLocal = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' });

  let foundToday = false;
  for (let i = 0; i < N; i++) {
    const dateLabel = progressDates[i];
    const display = formatDisplayDate(dateLabel);
    
    // Day Label
    let dayLabel = 'Day ' + (i + 1);
    if (dateLabel === todayISO || dateLabel === todayLocal) {
       dayLabel += ' (Hari Ini)';
       foundToday = true;
    } else if (i === N - 1) {
       dayLabel += ' (TOC)';
    }

    const isFuture = foundToday && dateLabel !== todayISO && dateLabel !== todayLocal;

    // Target S-Curve Sinusoidal
    const x = i / (N - 1 || 1);
    const targetPercent = parseFloat((((Math.sin(x * Math.PI - Math.PI / 2) + 1) / 2) * 100).toFixed(2));

    let actualCumulativeForDay = 0;
    
    if (!isFuture || !foundToday) {
      items.forEach(item => {
        const target = item.volumeTarget || item.boqVolume || 0;
        if (target > 0) {
          let accumulatedVol = 0;
          for (let j = 0; j <= i; j++) {
            accumulatedVol += getItemDailyVolume(item, progressDates[j]);
          }
          const pct = Math.min(100, (accumulatedVol / target) * 100);
          actualCumulativeForDay += (pct * item.bobotPersen) / 100;
        }
      });
    }

    const actualPercent = totalBobot > 0 && (!isFuture || !foundToday)
      ? parseFloat(((actualCumulativeForDay / totalBobot) * 100).toFixed(2))
      : null;

    curvePoints.push({
      dayLabel,
      date: display.fullDate || dateLabel,
      targetPercent: i === N - 1 ? 100 : targetPercent,
      actualPercent: actualPercent,
    });
  }

  return curvePoints;
}
