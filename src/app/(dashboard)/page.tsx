'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  Calendar,
  MapPin,
  User,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import StatusBadge from '@/components/shared/StatusBadge';
import { useProject, Project } from '@/context/ProjectContext';
import { calculateOverallProjectProgress, DesignatorItem } from '@/lib/designatorProgress';

// Helper display ID ringkas
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
  const router = useRouter();
  const { projects } = useProject();
  const [searchQuery, setSearchQuery] = useState('');

  // Hitung metrik keseluruhan untuk preview dashboard
  const summaryMetrics = useMemo(() => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(
      (p) => (p.status || '').toLowerCase() === 'active' || (p.status || '').toLowerCase() === 'implementation'
    ).length;
    const planningProjects = projects.filter(
      (p) => (p.status || '').toLowerCase() === 'planning'
    ).length;
    const completedProjects = projects.filter(
      (p) => (p.status || '').toLowerCase() === 'completed'
    ).length;

    // Rata-rata progress
    let totalProgressSum = 0;
    projects.forEach((p) => {
      let designators: DesignatorItem[] = (p as any)?.designatorItems || [];
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem(`proper_project_designators_${p.id}`);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              designators = parsed;
            }
          }
        } catch (e) {}
      }
      const m = calculateOverallProjectProgress(designators);
      totalProgressSum += m.actualPercent;
    });

    const avgProgress = totalProjects > 0 ? parseFloat((totalProgressSum / totalProjects).toFixed(1)) : 0;

    return {
      totalProjects,
      activeProjects,
      planningProjects,
      completedProjects,
      avgProgress,
    };
  }, [projects]);

  // Filter daftar proyek di preview
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.customer.toLowerCase().includes(q) ||
        (p.location && p.location.toLowerCase().includes(q)) ||
        (p.contractNo && p.contractNo.toLowerCase().includes(q))
      );
    });
  }, [projects, searchQuery]);

  return (
    <div className="space-y-6 animate-fade-in text-[13px] pb-12">
      {/* ========================================================================= */}
      {/* HEADER DASHBOARD (FULL PREVIEW) */}
      {/* ========================================================================= */}
      <div className="border-b pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Dashboard Pemantauan Proyek
        </h1>
        <p className="text-muted-foreground text-[13px] mt-1">
          Monitoring seluruh project yang sedang berjalan
        </p>
      </div>

      {/* ========================================================================= */}
      {/* STATISTIK RINGKAS (TANPA ICON SESUAI PERMINTAAN) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Project */}
        <Card className="border shadow-2xs hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <p className="text-[13px] font-medium text-muted-foreground">Total Project Site</p>
            <h3 className="text-2xl font-bold tracking-tight mt-1 text-foreground">
              {summaryMetrics.totalProjects}
            </h3>
            <p className="text-[13px] text-muted-foreground mt-0.5">Semua site terdaftar</p>
          </CardContent>
        </Card>

        {/* Active & Implementation */}
        <Card className="border shadow-2xs hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <p className="text-[13px] font-medium text-muted-foreground">Sedang Berjalan</p>
            <h3 className="text-2xl font-bold tracking-tight mt-1 text-emerald-600 dark:text-emerald-400">
              {summaryMetrics.activeProjects}
            </h3>
            <p className="text-[13px] text-muted-foreground mt-0.5">Active & Implementation</p>
          </CardContent>
        </Card>

        {/* Planning */}
        <Card className="border shadow-2xs hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <p className="text-[13px] font-medium text-muted-foreground">Fase Perencanaan</p>
            <h3 className="text-2xl font-bold tracking-tight mt-1 text-amber-600 dark:text-amber-400">
              {summaryMetrics.planningProjects}
            </h3>
            <p className="text-[13px] text-muted-foreground mt-0.5">Dalam persiapan DRM/BOQ</p>
          </CardContent>
        </Card>

        {/* Average Progress */}
        <Card className="border shadow-2xs hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <p className="text-[13px] font-medium text-muted-foreground">Rata-Rata Progres</p>
            <h3 className="text-2xl font-bold tracking-tight mt-1 text-blue-600 dark:text-blue-400">
              {summaryMetrics.avgProgress}%
            </h3>
            <p className="text-[13px] text-muted-foreground mt-0.5">Akumulasi seluruh site</p>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* DAFTAR PROJECT PREVIEW (NAVIGASI KE /[X] /project-list/[id]) */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div>
            <h2 className="text-base font-bold text-foreground">
              Daftar Proyek
            </h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              Klik pada baris proyek di bawah untuk melihat detail pekerjaan dan progres grup designator.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Input
                placeholder="Cari ID, proyek, klien, lokasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="py-[6px] px-[8px] text-[13px] h-auto bg-card"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/project-list')}
              className="py-[6px] px-[8px] text-[13px] h-auto shrink-0 cursor-pointer"
            >
              Lihat Project List
            </Button>
          </div>
        </div>

        {/* List Projects */}
        {filteredProjects.length === 0 ? (
          <div className="p-10 text-center border border-dashed rounded-xl bg-card flex flex-col items-center justify-center">
            <h3 className="text-sm font-semibold text-foreground mb-0.5">Tidak Ada Proyek Ditemukan</h3>
            <p className="text-muted-foreground text-[13px]">
              Tidak ditemukan data proyek yang sesuai dengan kata kunci pencarian.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProjects.map((p) => {
              // Ambil saved designator items jika ada
              let designatorList: DesignatorItem[] = (p as any)?.designatorItems || [];
              if (typeof window !== 'undefined') {
                try {
                  const saved = localStorage.getItem(`proper_project_designators_${p.id}`);
                  if (saved) {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                      designatorList = parsed;
                    }
                  }
                } catch (e) {}
              }
              const metrics = calculateOverallProjectProgress(designatorList);

              return (
                <Link
                  key={p.id}
                  href={`/project-list/${encodeURIComponent(p.id)}`}
                  className="w-full p-4 sm:p-5 bg-card hover:bg-neutral-50 dark:hover:bg-muted/30 border border-border/80 hover:border-primary/50 rounded-xl transition-all duration-200 cursor-pointer group shadow-2xs hover:shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Info Proyek (Icon dipertahankan sesuai permintaan) */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-semibold text-neutral-900 dark:text-foreground text-sm group-hover:text-primary transition-colors">
                        {p.name}
                      </span>
                      <Badge variant="outline" className="text-[11px] font-mono uppercase bg-muted/40 py-[2px] px-[6px]">
                        {getProjectDisplayId(p)}
                      </Badge>
                      <StatusBadge status={p.status || 'Active'} />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[13px] text-muted-foreground">
                      <div className="flex items-center gap-1.5 truncate">
                        <Building2 className="w-4 h-4 shrink-0 text-muted-foreground/80" />
                        <span className="truncate">Klien: <strong className="text-foreground font-medium">{p.customer}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-4 h-4 shrink-0 text-muted-foreground/80" />
                        <span className="truncate">Lokasi: <strong className="text-foreground font-medium">{p.location || 'Indonesia'}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <Calendar className="w-4 h-4 shrink-0 text-muted-foreground/80" />
                        <span className="truncate">{p.startDate || '-'} s/d {p.targetDate || '-'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <User className="w-4 h-4 shrink-0 text-muted-foreground/80" />
                        <span className="truncate">PIC: <strong className="text-foreground font-medium">{p.manager || 'Site Manager'}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Progress & Quick Jump */}
                  <div className="flex items-center justify-between md:justify-end gap-5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border/60">
                    <div className="text-right min-w-[120px]">
                      <div className="flex items-center justify-between md:justify-end gap-2 text-[13px] mb-1">
                        <span className="text-muted-foreground text-[12px]">Progres Fisik:</span>
                        <span className="font-bold text-foreground">{metrics.actualPercent}%</span>
                      </div>
                      <div className="w-full md:w-28 bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${Math.min(100, Math.max(0, metrics.actualPercent))}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center text-primary font-medium text-[13px] gap-1 group-hover:translate-x-1 transition-transform">
                      <span className="hidden sm:inline">Lihat Detil</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
