'use client';

import { useState } from 'react';
import {
  FolderKanban,
  MapPin,
  FileCheck2,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  DollarSign,
  Activity,
  Map,
  ShieldAlert,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import StatusBadge from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardPage() {
  // Metric Cards
  const metrics = [
    { title: 'Active Projects', value: '14 Projects', icon: FolderKanban, change: '+2 this month', positive: true },
    { title: 'Total Route Length', value: '148.5 KM', icon: MapPin, change: '12 Segments', positive: true },
    { title: 'Total Contract Value', value: 'Rp 18.4 B', icon: DollarSign, change: '14 Active Contracts', positive: true },
    { title: 'Avg Project Margin', value: '26.8%', icon: TrendingUp, change: '-3.2% vs target', positive: false },
    { title: 'Pending DRM Approval', value: '3 Projects', icon: FileCheck2, change: 'Action Required', positive: false },
    { title: 'Active Issues', value: '5 Critical', icon: ShieldAlert, change: 'Permit & Civil', positive: false },
  ];

  // Lifecycle Pipeline Stages matching exact user HTML
  const lifecycleStages = [
    { name: 'Initiation', count: 2 },
    { name: 'Planning', count: 3 },
    { name: 'Survey', count: 2 },
    { name: 'DRM', count: 3 },
    { name: 'Implementation', count: 2 },
    { name: 'Commissioning', count: 1 },
    { name: 'Closing', count: 1 },
  ];

  // Recent Active Projects Table
  const recentProjects = [
    { id: 'PRJ-2026-001', name: 'Backbone Fiber Jakarta - Bandung', customer: 'Telkomsel', type: 'Backbone', distance: '45.0 KM', cost: 'Rp 5.2 B', margin: '31.2%', status: 'Implementation' },
    { id: 'PRJ-2026-002', name: 'Metro Ring Surabaya East', customer: 'Indosat Ooredoo', type: 'Metro', distance: '28.5 KM', cost: 'Rp 3.1 B', margin: '24.5%', status: 'Survey' },
    { id: 'PRJ-2026-003', name: 'FTTx Access Cluster Medan', customer: 'XL Axiata', type: 'FTTx', distance: '18.2 KM', cost: 'Rp 1.8 B', margin: '28.0%', status: 'DRM' },
    { id: 'PRJ-2026-004', name: 'Enterprise Link Bank Mandiri HQ', customer: 'Bank Mandiri', type: 'Enterprise', distance: '6.4 KM', cost: 'Rp 950 M', margin: '38.4%', status: 'Commissioning' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">FOPLP Executive Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Fiber Optic Project Lifecycle &amp; Profitability Control Center
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/gis">
            <Button className="gap-2 shadow-none cursor-pointer">
              <Map className="w-4 h-4" />
              Open GIS Map View
            </Button>
          </Link>
        </div>
      </div>

      {/* Project Lifecycle Pipeline Distribution Card */}
      <Card className="border border-border shadow-none ring-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Project Lifecycle Pipeline Distribution
          </CardTitle>
          <CardDescription>Real-time status of 14 active projects across lifecycle phases</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {lifecycleStages.map((stage) => (
              <div key={stage.name} className="p-3 rounded-xl border border-border bg-muted/30 flex flex-col justify-between">
                <span className="text-xs font-medium text-muted-foreground truncate">{stage.name}</span>
                <div className="flex items-baseline justify-between mt-3">
                  <span className="text-2xl font-bold text-foreground">{stage.count}</span>
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-0 font-semibold text-[10px]">
                    Active
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 6 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {metrics.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="border border-border shadow-none ring-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider truncate">
                  {card.title}
                </CardTitle>
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="pt-1">
                <div className="text-xl font-bold tracking-tight">{card.value}</div>
                <div className="flex items-center gap-1 mt-1">
                  {card.positive ? (
                    <ArrowUpRight className="w-3 h-3 text-emerald-500 shrink-0" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 text-destructive shrink-0" />
                  )}
                  <p className={cn("text-xs font-medium truncate", card.positive ? "text-emerald-500" : "text-destructive")}>
                    {card.change}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Financial & Engineering Summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial & Margin Control */}
        <Card className="border border-border shadow-none ring-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Financial &amp; Margin Control</CardTitle>
              <CardDescription className="text-xs">Contract Value vs Estimated Cost vs Actual Margin</CardDescription>
            </div>
            <Link href="/financial">
              <Button variant="outline" size="sm" className="text-xs h-8 shadow-none cursor-pointer">
                Financial Details &rarr;
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="grid grid-cols-3 gap-3 p-3 bg-muted/40 rounded-xl border border-border">
              <div>
                <p className="text-[11px] text-muted-foreground">Contract Revenue</p>
                <p className="text-sm font-bold text-foreground mt-0.5">Rp 18.400.000.000</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Estimated Cost</p>
                <p className="text-sm font-bold text-foreground mt-0.5">Rp 13.468.800.000</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Target Profit</p>
                <p className="text-sm font-bold text-emerald-600 mt-0.5">Rp 4.931.200.000</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span>Overall Target Margin: 30%</span>
                <span className="text-amber-600 font-bold">Current Actual: 26.8% (Yellow Alert)</span>
              </div>
              <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full" style={{ width: '26.8%' }} />
                <div className="bg-amber-400 h-full" style={{ width: '3.2%' }} />
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                Deviations caused by +3.5 KM aerial route change &amp; permit escalation on Surabaya East project.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Engineering & Route Summary */}
        <Card className="border border-border shadow-none ring-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Engineering &amp; Route Summary</CardTitle>
              <CardDescription className="text-xs">BOQ, Catuan Fiber &amp; Installation Types</CardDescription>
            </div>
            <Link href="/planning/route">
              <Button variant="outline" size="sm" className="text-xs h-8 shadow-none cursor-pointer">
                Route Planning &rarr;
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-border bg-card">
                <p className="text-xs font-medium text-muted-foreground">Underground Cable (Duct/Blowing)</p>
                <p className="text-lg font-bold mt-1">
                  62.4 KM <span className="text-xs text-muted-foreground font-normal">(42%)</span>
                </p>
              </div>
              <div className="p-3 rounded-xl border border-border bg-card">
                <p className="text-xs font-medium text-muted-foreground">Aerial Cable (Pole Attachment)</p>
                <p className="text-lg font-bold mt-1">
                  86.1 KM <span className="text-xs text-muted-foreground font-normal">(58%)</span>
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-border bg-muted/40 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Active Fiber Capacity:</span>
                <span className="font-semibold text-foreground">48 Core &amp; 96 Core SM</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total Splice Closures:</span>
                <span className="font-semibold text-foreground">142 Units Installed</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">ODF Endpoints:</span>
                <span className="font-semibold text-foreground">28 POP Sites Connected</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Projects Overview Table */}
      <Card className="border border-border shadow-none ring-0">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-semibold">Active Projects Overview</CardTitle>
            <CardDescription className="text-xs">Projects undergoing FOPLP lifecycle stages</CardDescription>
          </div>
          <Link href="/projects">
            <Button size="sm" variant="default" className="text-xs shadow-none cursor-pointer">
              View All Projects
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project ID &amp; Name</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Contract Value</TableHead>
                <TableHead>Margin</TableHead>
                <TableHead className="text-right">Current Phase</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentProjects.map((prj) => (
                <TableRow key={prj.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">
                    <div className="text-sm font-semibold">{prj.name}</div>
                    <div className="text-[11px] text-muted-foreground font-mono mt-0.5">{prj.id}</div>
                  </TableCell>
                  <TableCell className="text-sm">{prj.customer}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-semibold">{prj.type}</Badge>
                  </TableCell>
                  <TableCell className="text-sm font-mono">{prj.distance}</TableCell>
                  <TableCell className="text-sm font-semibold">{prj.cost}</TableCell>
                  <TableCell>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200">
                      {prj.margin}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <StatusBadge status={prj.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
