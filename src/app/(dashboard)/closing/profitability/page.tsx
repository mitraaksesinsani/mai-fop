'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, TrendingUp, AlertTriangle, ArrowDownRight, Search, Filter } from 'lucide-react';

export default function ClosingProfitabilityPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState('PRJ-2026-001');

  const rootCauses = [
    { id: 1, title: '1. Route Change & Additional Subduct Cable Length (+Rp 500.000.000)', desc: 'Field survey required 3.5 KM route detour around highway construction.', impact: 'High Cost Impact' },
    { id: 2, title: '2. National Road Permit Escalation (+Rp 400.000.000)', desc: 'Unexpected permit authority fees for HDD road crossing.', impact: 'High Cost Impact' },
    { id: 3, title: '3. Materials Price Inflation (+Rp 150.000.000)', desc: 'Copper and optical glass raw material cost adjustment.', impact: 'Moderate Impact' },
  ];

  const filteredCauses = rootCauses.filter((rc) =>
    rc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rc.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Final Profitability Report</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Contract Value vs Actual Cost Variance &amp; Root Cause Analysis (PRD Module 7 Section 11-13)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedProject} onValueChange={(val) => val && setSelectedProject(val)}>
            <SelectTrigger className="w-64 text-xs h-9 border-border bg-background shadow-none">
              <SelectValue placeholder="Select Project" />
            </SelectTrigger>
            <SelectContent className="shadow-none border-border">
              <SelectItem value="PRJ-2026-001">PRJ-2026-001: Jakarta-Bandung</SelectItem>
              <SelectItem value="PRJ-2026-002">PRJ-2026-002: Surabaya Metro</SelectItem>
              <SelectItem value="PRJ-2026-003">PRJ-2026-003: Medan FTTx</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Financial Comparison Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-none ring-0">
          <CardContent className="pt-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Final Contract Value</p>
            <p className="text-2xl font-bold mt-1">Rp 5.000.000.000</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-none ring-0">
          <CardContent className="pt-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Final Actual Cost</p>
            <p className="text-2xl font-bold mt-1 text-slate-700 dark:text-slate-300">Rp 4.100.000.000</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-none ring-0">
          <CardContent className="pt-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Final Actual Profit</p>
            <p className="text-2xl font-bold mt-1 text-emerald-600">Rp 900.000.000</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-none ring-0 border-amber-300 bg-amber-500/5">
          <CardContent className="pt-6">
            <p className="text-xs font-semibold text-amber-600 uppercase flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5" /> Margin Deviation
            </p>
            <p className="text-2xl font-bold mt-1 text-amber-600">18.0% <span className="text-xs font-normal text-muted-foreground">(Target: 30%)</span></p>
          </CardContent>
        </Card>
      </div>

      {/* Root Cause Analysis Card */}
      <Card className="border-0 shadow-none ring-0">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Profitability Root Cause Analysis (PRD Module 7 Section 13)
            </CardTitle>
            <CardDescription className="text-xs">Identified factors causing margin variance for {selectedProject}</CardDescription>
          </div>
          <div className="flex items-center gap-2 max-w-sm w-full">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search root cause factors..."
                className="pl-8 text-xs h-9 border-border bg-background shadow-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredCauses.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground">
              No matching profitability root cause factors found.
            </div>
          ) : (
            filteredCauses.map((rc) => (
              <div key={rc.id} className="p-3 border rounded-lg bg-destructive/10 border-destructive/20 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-destructive">{rc.title}</p>
                  <Badge variant="outline" className="text-[10px] border-destructive/30 text-destructive">{rc.impact}</Badge>
                </div>
                <p className="text-muted-foreground">{rc.desc}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
