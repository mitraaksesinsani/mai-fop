'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  FolderKanban,
  FolderX,
  Layers,
  Calendar,
  Building2,
  MapPin,
  User,
  CheckCircle2,
  Clock,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

export default function ProjectListPage() {
  const router = useRouter();
  const { projects } = useProject();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Filter list proyek
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.customer.toLowerCase().includes(q) ||
        (p.location && p.location.toLowerCase().includes(q)) ||
        (p.contractNo && p.contractNo.toLowerCase().includes(q));

      const matchStatus =
        statusFilter === 'ALL' ||
        (p.status && p.status.toLowerCase() === statusFilter.toLowerCase());

      return matchSearch && matchStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  // Statistik Ringkas
  const stats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter(
      (p) =>
        (p.status || '').toLowerCase() === 'active' ||
        (p.status || '').toLowerCase() === 'implementation'
    ).length;
    const planning = projects.filter((p) => (p.status || '').toLowerCase() === 'planning').length;
    const completed = projects.filter((p) => (p.status || '').toLowerCase() === 'completed').length;
    return { total, active, planning, completed };
  }, [projects]);

  return (
    <div className="space-y-6 animate-fade-in text-[13px] pb-12">
      {/* Header & Navigasi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2 mb-2 text-[13px] text-muted-foreground">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="h-7 px-2 text-[13px] gap-1 cursor-pointer hover:text-foreground"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Button>
            <span>/</span>
            <span className="text-foreground font-medium">Project List</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <FolderKanban className="w-6 h-6 text-primary" />
            Project List
          </h1>
          <p className="text-muted-foreground text-[13px] mt-1">
            Daftar seluruh project site. Klik salah satu proyek untuk melihat <strong>Project Detil</strong> dan <strong>Group List Designator</strong>.
          </p>
        </div>

        {/* Counter Badge */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-card py-[6px] px-[8px] rounded-lg border flex items-center gap-2 shadow-2xs text-[13px]">
            <span className="text-muted-foreground">Total:</span>
            <span className="font-bold text-foreground">{stats.total}</span>
          </div>
          <div className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 py-[6px] px-[8px] rounded-lg border border-emerald-500/20 flex items-center gap-2 text-[13px] font-medium">
            <span>Aktif / Implementasi:</span>
            <span className="font-bold">{stats.active}</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar - Margin/Padding: Atas Bawah 6px, Kanan 8px, Kiri 8px */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nama proyek, klien, lokasi, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-[8px] py-[6px] text-[13px] bg-card h-auto"
            style={{
              paddingTop: '6px',
              paddingBottom: '6px',
              paddingRight: '8px',
            }}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 text-[13px]">
          <button
            onClick={() => setStatusFilter('ALL')}
            style={{
              paddingTop: '6px',
              paddingBottom: '6px',
              paddingLeft: '8px',
              paddingRight: '8px',
            }}
            className={`rounded-md border text-[13px] font-medium transition-colors cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground hover:bg-muted border-border'
            }`}
          >
            Semua ({stats.total})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            style={{
              paddingTop: '6px',
              paddingBottom: '6px',
              paddingLeft: '8px',
              paddingRight: '8px',
            }}
            className={`rounded-md border text-[13px] font-medium transition-colors cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground hover:bg-muted border-border'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setStatusFilter('implementation')}
            style={{
              paddingTop: '6px',
              paddingBottom: '6px',
              paddingLeft: '8px',
              paddingRight: '8px',
            }}
            className={`rounded-md border text-[13px] font-medium transition-colors cursor-pointer ${
              statusFilter === 'implementation'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground hover:bg-muted border-border'
            }`}
          >
            Implementation
          </button>
          <button
            onClick={() => setStatusFilter('planning')}
            style={{
              paddingTop: '6px',
              paddingBottom: '6px',
              paddingLeft: '8px',
              paddingRight: '8px',
            }}
            className={`rounded-md border text-[13px] font-medium transition-colors cursor-pointer ${
              statusFilter === 'planning'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground hover:bg-muted border-border'
            }`}
          >
            Planning
          </button>
        </div>
      </div>

      {/* List Projects */}
      {filteredProjects.length === 0 ? (
        <div className="p-12 text-center border border-dashed rounded-xl bg-card flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-muted/60 flex items-center justify-center mb-3">
            <FolderX className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">Tidak Ada Proyek Ditemukan</h3>
          <p className="text-muted-foreground text-[13px] max-w-sm">
            Tidak ada proyek yang sesuai dengan kriteria pencarian &ldquo;{searchQuery}&rdquo;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredProjects.map((p) => {
            // Ambil saved designators jika ada untuk kalkulasi progress
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
                className="w-full p-5 bg-card hover:bg-neutral-50/80 dark:hover:bg-muted/30 border border-border/80 hover:border-primary/50 rounded-xl transition-all duration-200 cursor-pointer group shadow-2xs hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Info Proyek Utama */}
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

                {/* Progress & Aksi */}
                <div className="flex items-center justify-between md:justify-end gap-5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border/60">
                  <div className="text-right min-w-[120px]">
                    <div className="flex items-center justify-between md:justify-end gap-2 text-[13px] mb-1">
                      <span className="text-muted-foreground text-[12px]">Progres Fisik:</span>
                      <span className="font-bold text-foreground">{metrics.actualPercent}%</span>
                    </div>
                    <div className="w-full md:w-32 bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.max(0, metrics.actualPercent))}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center text-primary font-medium text-[13px] gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Lihat Detil</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
