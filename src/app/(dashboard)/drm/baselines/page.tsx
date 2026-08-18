'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function DRMBaselinesPage() {
  const baselines = [
    { type: 'BOQ Baseline V1.0', status: 'LOCKED', date: '2026-02-10', approvedBy: 'Project Manager & Client', remark: 'Official BOQ for Construction Execution' },
    { type: 'Route KML Baseline V1.0', status: 'LOCKED', date: '2026-02-10', approvedBy: 'Lead GIS Engineer', remark: 'Official 45.0 KM Route Alignment' },
    { type: 'Fiber Catuan Allocation V1.0', status: 'LOCKED', date: '2026-02-10', approvedBy: 'Lead Network Engineer', remark: 'Core 01-48 End-to-End Mapping' },
    { type: 'Financial Margin Baseline (31.2%)', status: 'LOCKED', date: '2026-02-10', approvedBy: 'Commercial Director', remark: 'Target Profit Rp 1.41 B' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">DRM Baseline Lock Control</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Locked Design, BOQ, KML & Financial Baselines for Project Execution (PRD Module 4 Section 22)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {baselines.map((b) => (
          <Card key={b.type} className="border shadow-sm bg-card">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  {b.type}
                </CardTitle>
                <CardDescription className="text-xs mt-1">{b.remark}</CardDescription>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-300 font-mono text-xs">
                {b.status}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-1 text-xs text-muted-foreground border-t pt-3">
              <div className="flex justify-between">
                <span>Lock Date:</span>
                <span className="font-semibold text-foreground">{b.date}</span>
              </div>
              <div className="flex justify-between">
                <span>Authorized By:</span>
                <span className="font-semibold text-foreground">{b.approvedBy}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
