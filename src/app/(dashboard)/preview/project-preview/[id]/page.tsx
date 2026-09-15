'use client';

import { useParams, useRouter } from 'next/navigation';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Building2,
  MapPin,
  FileCheck,
  TrendingUp,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/shared/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import SCurveChart from '@/components/projects/SCurveChart';
import CumulativeProgressTable from '@/components/projects/CumulativeProgressTable';
import {
  DEFAULT_DESIGNATOR_ITEMS,
  DesignatorItem,
  calculateOverallProjectProgress,
  generateSCurveData,
} from '@/lib/designatorProgress';
import { useProject, Project } from '@/context/ProjectContext';

export default function ProjectPreviewProgressPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { projects } = useProject();

  const decodedId = decodeURIComponent(params?.id || '');

  // Cari proyek dari context, atau sediakan fallback dinamis jika UUID baru
  const foundProject = projects.find((p) => p.id === decodedId);
  const project: Project = foundProject || {
    id: decodedId,
    name: `Proyek Fiber Optik (${decodedId.slice(0, 8)})`,
    customer: 'PT Telkomsel Tbk',
    type: 'Backbone Fiber',
    location: 'Wilayah Operasional Indonesia',
    contractNo: `CTR/FO/${decodedId.slice(0, 8).toUpperCase()}/2026`,
    startDate: '2026-09-01',
    targetDate: '2026-09-14',
    status: 'Implementation',
  };

  const [designatorItems, setDesignatorItems] = useState<DesignatorItem[]>(DEFAULT_DESIGNATOR_ITEMS);

  // Kalkulasi dinamis Kurva S dan Progress Kumulatif
  const progressMetrics = calculateOverallProjectProgress(designatorItems);
  const progressDates = React.useMemo(() => {
    if (project?.startDate && project?.targetDate) {
      const start = new Date(project.startDate);
      const end = new Date(project.targetDate);
      const dates = [];
      let current = new Date(start);
      let count = 0;
      while (current <= end && count < 1000) {
        dates.push(current.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' }));
        current.setDate(current.getDate() + 1);
        count++;
      }
      if (dates.length > 0) return dates;
    }
    const fallback = [];
    const current = new Date();
    for (let i = 0; i < 14; i++) {
      fallback.push(current.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' }));
      current.setDate(current.getDate() + 1);
    }
    return fallback;
  }, [project?.startDate, project?.targetDate]);

  const sCurveData = generateSCurveData(designatorItems, progressDates);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header: Navigasi Kembali & Info Proyek */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {project.name}
            </h1>
            <StatusBadge status={project.status || 'Implementation'} />
          </div>

          <div className="flex items-center gap-3 text-[10pt] text-muted-foreground mt-1 flex-wrap">
            <span>
              Project ID: <span className="font-medium text-foreground">{project.contractNo ? project.contractNo.split(' | ')[0] : project.id}</span>
            </span>
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              {project.customer}
            </span>
            {project.contractNo && (
              <span className="flex items-center gap-1">
                {project.contractNo}
              </span>
            )}
            {project.targetDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Target: {project.targetDate}
              </span>
            )}
          </div>
        </div>

        {/* Tombol Kembali ke Daftar Proyek */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/')}
            className="text-[10pt] h-8"
          >
            &lt; Kembali ke Daftar Proyek
          </Button>
        </div>
      </div>

      {/* 1. Kurva S (Bisa di-collapse / expand) */}
      <SCurveChart
        data={sCurveData}
        projectName={project.name}
        targetPercent={progressMetrics.targetPercent}
        actualPercent={progressMetrics.actualPercent}
        deviation={progressMetrics.deviation}
      />

      {/* 2. Tabel Actual Kumulatif Progress (Kolom ID s/d Jenis Freeze, scroll kanan per tanggal, filter dropdown) */}
      <CumulativeProgressTable
        items={designatorItems}
        onUpdateItems={setDesignatorItems}
        projectName={project.name}
        contractNo={project.contractNo}
      />
    </div>
  );
}
