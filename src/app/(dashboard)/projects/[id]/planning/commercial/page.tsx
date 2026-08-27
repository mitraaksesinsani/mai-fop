'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function CommercialPlanningPage() {
  const items = [
    { name: 'Fiber Cable 48 Core SM (45 KM)', internalCost: 30000000, sellingPrice: 45000000, qty: 45, totalCost: 1350000000, revenue: 2025000000, margin: '33.3%' },
    { name: 'HDPE Subduct 32/26 (45 KM)', internalCost: 12000000, sellingPrice: 18000000, qty: 45, totalCost: 540000000, revenue: 810000000, margin: '33.3%' },
    { name: 'Galian Soil & HDD (21.5 KM)', internalCost: 50000000, sellingPrice: 70000000, qty: 21.5, totalCost: 1075000000, revenue: 1505000000, margin: '28.5%' },
    { name: 'Splicing & OTDR Testing (432 Joint)', internalCost: 150000, sellingPrice: 250000, qty: 432, totalCost: 64800000, revenue: 108000000, margin: '40.0%' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Commercial BOQ & Margin Simulation</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Internal Cost vs Selling Price vs Profitability Threshold (PRD Module 2 Section 13-15)
          </p>
        </div>
      </div>

      {/* Margin Simulation Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border shadow-sm bg-card">
          <CardContent className="pt-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Total Contract Value</p>
            <p className="text-2xl font-bold mt-1">Rp 4.448.000.000</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-card">
          <CardContent className="pt-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Total Internal Cost</p>
            <p className="text-2xl font-bold mt-1 text-slate-700 dark:text-slate-300">Rp 3.029.800.000</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-card">
          <CardContent className="pt-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Estimated Profit</p>
            <p className="text-2xl font-bold mt-1 text-emerald-600">Rp 1.418.200.000</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-emerald-500/10 border-emerald-500/30">
          <CardContent className="pt-6">
            <p className="text-xs font-semibold text-emerald-600 uppercase flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Margin Threshold Status
            </p>
            <p className="text-2xl font-bold mt-1 text-emerald-600">31.8% (Green Status)</p>
          </CardContent>
        </Card>
      </div>

      {/* Commercial Breakdown Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Commercial Pricing Breakdown</CardTitle>
          <CardDescription className="text-xs">PRJ-2026-001 Indicative Commercial BOQ</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Scope</TableHead>
                <TableHead className="text-right">Internal Cost (Unit)</TableHead>
                <TableHead className="text-right">Client Selling Price</TableHead>
                <TableHead className="text-right">Total Internal Cost</TableHead>
                <TableHead className="text-right">Total Revenue</TableHead>
                <TableHead className="text-right">Margin %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((it, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium text-xs">{it.name}</TableCell>
                  <TableCell className="text-right text-xs">Rp {it.internalCost.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-xs">Rp {it.sellingPrice.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-xs font-semibold">Rp {it.totalCost.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-xs font-bold text-primary">Rp {it.revenue.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="text-emerald-600 bg-emerald-50 text-xs font-bold">
                      {it.margin}
                    </Badge>
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
