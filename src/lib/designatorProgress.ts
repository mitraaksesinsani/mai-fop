export type JenisPekerjaan = 
  | 'Kabel' 
  | 'Jointing' 
  | 'Manhole' 
  | 'Galian' 
  | 'Terminasi' 
  | 'Aksesoris';

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
  | 'batang';

// Daftar kolom tanggal harian
export const PROGRESS_DATES: string[] = [
  '01/09',
  '02/09',
  '03/09',
  '04/09',
  '05/09',
  '06/09',
  '07/09',
  '08/09',
  '09/09',
  '10/09',
  '11/09',
  '12/09',
  '13/09',
  '14/09',
];

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

// Initial default designator items untuk proyek fiber optik
export const DEFAULT_DESIGNATOR_ITEMS: DesignatorItem[] = [
  {
    idVolume: 'VOL-001',
    designator: 'AC-OF-SM-ADSS-24D',
    namaDeskripsi: 'Penarikan Kabel Fiber Optik ADSS 24 Core',
    jenis: 'Kabel',
    satuan: 'Meter',
    bobotPersen: 25.0,
    volumeTarget: 15000,
    dailyVolumes: {},
  },
  {
    idVolume: 'VOL-002',
    designator: 'AC-OF-SM-DUCT-48D',
    namaDeskripsi: 'Gelar Kabel Duct HDPE 48 Core',
    jenis: 'Kabel',
    satuan: 'Meter',
    bobotPersen: 20.0,
    volumeTarget: 8000,
    dailyVolumes: {},
  },
  {
    idVolume: 'VOL-003',
    designator: 'PU-S7.0-140',
    namaDeskripsi: 'Pendirian Tiang Besi 7 Meter 140 daN',
    jenis: 'Aksesoris',
    satuan: 'batang',
    bobotPersen: 12.0,
    volumeTarget: 180,
    dailyVolumes: {},
  },
  {
    idVolume: 'VOL-004',
    designator: 'PU-S9.0-200',
    namaDeskripsi: 'Pendirian Tiang Besi 9 Meter 200 daN',
    jenis: 'Aksesoris',
    satuan: 'batang',
    bobotPersen: 8.0,
    volumeTarget: 50,
    dailyVolumes: {},
  },
  {
    idVolume: 'VOL-005',
    designator: 'GL-OPEN-TRENCH-1M',
    namaDeskripsi: 'Galian Tanah Manual Kedalaman 1 Meter',
    jenis: 'Galian',
    satuan: 'Meter',
    bobotPersen: 10.0,
    volumeTarget: 4500,
    dailyVolumes: {},
  },
  {
    idVolume: 'VOL-006',
    designator: 'MH-PRECAST-TYPE-B',
    namaDeskripsi: 'Pemasangan Precast Manhole Type B',
    jenis: 'Manhole',
    satuan: 'unit',
    bobotPersen: 7.0,
    volumeTarget: 24,
    dailyVolumes: {},
  },
  {
    idVolume: 'VOL-007',
    designator: 'HH-COMPOSITE-40X60',
    namaDeskripsi: 'Pemasangan Handhole Composite 40x60',
    jenis: 'Manhole',
    satuan: 'unit',
    bobotPersen: 5.0,
    volumeTarget: 40,
    dailyVolumes: {},
  },
  {
    idVolume: 'VOL-008',
    designator: 'FOSC-48-CORE-INLINE',
    namaDeskripsi: 'Splicing & Jointing Closure FO 48 Core',
    jenis: 'Jointing',
    satuan: 'titik',
    bobotPersen: 5.0,
    volumeTarget: 32,
    dailyVolumes: {},
  },
  {
    idVolume: 'VOL-009',
    designator: 'FOSC-CORE-SPLICING',
    namaDeskripsi: 'Penyambungan Core Fiber (Fusion Splicing)',
    jenis: 'Jointing',
    satuan: 'core',
    bobotPersen: 4.0,
    volumeTarget: 384,
    dailyVolumes: {},
  },
  {
    idVolume: 'VOL-010',
    designator: 'OTB-RACK-48-SC',
    namaDeskripsi: 'Terminasi OTB Rackmount 48 Port SC-UPC',
    jenis: 'Terminasi',
    satuan: 'set',
    bobotPersen: 2.5,
    volumeTarget: 12,
    dailyVolumes: {},
  },
  {
    idVolume: 'VOL-011',
    designator: 'ACC-SUSPENSION-CLAMP',
    namaDeskripsi: 'Aksesoris Suspension Clamp & Hook',
    jenis: 'Aksesoris',
    satuan: 'set',
    bobotPersen: 1.5,
    volumeTarget: 230,
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
  const todayStr = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' });

  let foundToday = false;
  for (let i = 0; i < N; i++) {
    const dateLabel = progressDates[i];
    
    // Day Label
    let dayLabel = 'Day ' + (i + 1);
    if (dateLabel === todayStr) {
       dayLabel += ' (Hari Ini)';
       foundToday = true;
    } else if (i === N - 1) {
       dayLabel += ' (TOC)';
    }

    const isFuture = foundToday && dateLabel !== todayStr;

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
            accumulatedVol += Number(item.dailyVolumes?.[progressDates[j]] || 0);
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
      date: dateLabel,
      targetPercent: i === N - 1 ? 100 : targetPercent,
      actualPercent: actualPercent,
    });
  }

  return curvePoints;
}
