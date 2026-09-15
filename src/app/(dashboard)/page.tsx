'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProject } from '@/context/ProjectContext';

export default function DashboardPage() {
  const router = useRouter();
  const { projects } = useProject();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const matchSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.manager && project.manager.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (project.location && project.location.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && project.status !== 'Closed' && project.status !== 'Completed') ||
      (statusFilter === 'closed' && (project.status === 'Closed' || project.status === 'Completed'));

    return matchSearch && matchStatus;
  });

  const totalProjects = projects.length;
  const activeProjects = projects.filter(
    (p) => p.status !== 'Closed' && p.status !== 'Completed'
  ).length;

  return (
    <div className="space-y-6 animate-fade-in text-[12px]">
      {/* Header Dashboard (Tanpa Icon) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          {/* Judul: Dashboard Perfomansi Proyek */}
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Dashboard Perfomansi Proyek
          </h1>
          {/* Subtitle */}
          <p className="text-muted-foreground text-[12px] mt-1">
            Daftar proyek untuk melihat perkembangan actual kumulatif progress designator pekerjaan dan pemantauan Kurva S
          </p>
        </div>

        {/* Ringkasan Jumlah Proyek */}
        <div className="flex items-center gap-2 text-[12px]">
          <div className="bg-muted/40 px-3.5 py-1.5 rounded-lg border border-border/60 flex items-center gap-2 text-[12px]">
            <span className="text-muted-foreground text-[12px]">Total Proyek:</span>
            <span className="font-bold text-foreground text-[12px]">{totalProjects}</span>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/30 px-3.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-[12px]">
            <span className="text-emerald-700 dark:text-emerald-400 font-medium text-[12px]">Aktif Berjalan:</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400 text-[12px]">{activeProjects}</span>
          </div>
        </div>
      </div>

      {/* Kontrol & Pencarian */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12px]">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Daftar Proyek
          </h2>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto text-[12px]">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari ID, nama proyek, klien, lokasi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 text-[12px] bg-background"
            />
          </div>
        </div>
      </div>

      {/* List per Card / Blocks (Web Mode: format ramping horizontal 1 baris, font 10pt) */}
      <div className="space-y-2.5 text-[10pt]">
        {filteredProjects.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground border border-border/60 rounded-xl bg-card text-[10pt]">
            Tidak ada proyek yang ditemukan sesuai pencarian.
          </div>
        ) : (
          filteredProjects.map((p) => {
            return (
              <div
                key={p.id}
                onClick={() => router.push(`/preview/project-preview/${encodeURIComponent(p.id)}`)}
                className="w-full max-w-[1262px] h-[68px] px-5 bg-neutral-100/30 dark:bg-muted/20 rounded-2xl outline outline-[0.80px] outline-offset-[-0.80px] outline-neutral-200/60 dark:outline-border/60 flex items-center justify-between gap-4 hover:bg-neutral-100/60 dark:hover:bg-muted/40 transition-colors cursor-pointer group"
              >
                {/* 1. Sisi Kiri: Nama Project & Project ID */}
                <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                  <div className="font-semibold text-neutral-950 dark:text-foreground text-[10pt] leading-tight truncate group-hover:text-primary transition-colors">
                    {p.name}
                  </div>
                  <div className="text-[10pt] leading-tight truncate">
                    <span className="text-neutral-500 dark:text-muted-foreground font-normal">
                      Project ID:{' '}
                    </span>
                    <span className="text-neutral-950 dark:text-foreground font-medium">
                      {p.contractNo ? p.contractNo.split(' | ')[0] : p.id}
                    </span>
                  </div>
                </div>

                {/* 2. Sisi Tengah: Jadwal & Target Tanggal */}
                <div className="min-w-[180px] shrink-0 flex flex-col justify-center gap-1 whitespace-nowrap">
                  <div className="text-[10pt] leading-tight">
                    <span className="text-neutral-500 dark:text-muted-foreground font-normal">Mulai: </span>
                    <span className="font-medium text-neutral-950 dark:text-foreground">{p.startDate || '-'}</span>
                  </div>
                  <div className="text-[10pt] leading-tight">
                    <span className="text-neutral-500 dark:text-muted-foreground font-normal">Target: </span>
                    <span className="font-medium text-neutral-950 dark:text-foreground">{p.targetDate || '-'}</span>
                  </div>
                </div>

                {/* 3. Sisi Kanan: Tombol Lihat Detil */}
                <div className="shrink-0 flex items-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/preview/project-preview/${encodeURIComponent(p.id)}`);
                    }}
                    className="h-8 px-3.5 bg-white dark:bg-card rounded-lg outline outline-[0.80px] outline-offset-[-0.80px] outline-neutral-200 dark:outline-border inline-flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-muted/50 group-hover:border-primary/40 active:scale-[0.98] cursor-pointer transition-all shadow-xs"
                  >
                    <span className="text-center text-neutral-950 dark:text-foreground text-[10pt] font-medium leading-none">
                      Lihat Detil
                    </span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
