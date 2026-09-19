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
  DesignatorItem,
  calculateOverallProjectProgress,
  generateSCurveData,
} from '@/lib/designatorProgress';
import { useProject, Project } from '@/context/ProjectContext';
import { getDesignatorProgressAction } from '@/app/actions/projects';

export default function ProjectPreviewProgressPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { projects } = useProject();

  const decodedId = decodeURIComponent(params?.id || '');

  // Cari proyek dari context / database
  const project = projects.find((p) => p.id === decodedId);

  const [designatorItems, setDesignatorItems] = useState<DesignatorItem[]>([]);

  React.useEffect(() => {
    if (!decodedId) return;
    getDesignatorProgressAction(decodedId).then((res) => {
      if (res.success && Array.isArray(res.data)) {
        setDesignatorItems(res.data);
      } else {
        const saved = localStorage.getItem(`proper_project_designators_${decodedId}`);
        if (saved) {
          try {
            setDesignatorItems(JSON.parse(saved));
          } catch (e) {}
        }
      }
    }).catch(() => {
      const saved = localStorage.getItem(`proper_project_designators_${decodedId}`);
      if (saved) {
        try {
          setDesignatorItems(JSON.parse(saved));
        } catch (e) {}
      }
    });
  }, [decodedId]);

  if (!project) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-foreground">Proyek Tidak Ditemukan</h2>
        <p className="text-sm text-muted-foreground">Proyek dengan ID &quot;{decodedId}&quot; tidak ditemukan.</p>
        <Button onClick={() => router.push('/')} variant="outline" className="text-[13px] px-3 py-1.5 h-auto">
          Kembali ke Daftar Proyek
        </Button>
      </div>
    );
  }

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
              Project ID: <span className="font-medium text-foreground">{project.projectCode || (project.contractNo ? project.contractNo.split(' | ')[0] : project.id)}</span>
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
