'use client';

import { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, AlertCircle, CheckCircle2, Calendar, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { SCurvePoint } from '@/lib/designatorProgress';

interface SCurveChartProps {
  data: SCurvePoint[];
  projectName?: string;
  targetPercent: number;
  actualPercent: number;
  deviation: number;
}

export default function SCurveChart({
  data,
  projectName = 'Proyek Fiber Optik',
  targetPercent,
  actualPercent,
  deviation,
}: SCurveChartProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isAhead = deviation >= 0;

  return (
    <Card className="py-0 gap-0 border-0 shadow-none ring-1 ring-border/50 bg-card overflow-hidden transition-all duration-300">
      <CardHeader className={`bg-muted/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${!isCollapsed ? 'border-b' : ''}`}>
        <div>
          <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold">Kurva S (S-Curve Progress Monitoring)</CardTitle>
              {isCollapsed && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 m-[6px]">
                  Disembunyikan
                </Badge>
              )}
            </div>
            <CardDescription className="text-[10pt] mt-0.5">
              Visualisasi Target Rencana Kumulatif vs Realisasi Aktual Harian
            </CardDescription>
          </div>

        {/* Ringkasan Metrik Cepat & Tombol Collapse/Expand */}
        <div className="flex items-center flex-wrap">
          <div className="bg-muted/40 px-[8px] py-[6px] my-[6px] mx-[8px] rounded-[7px] border border-border/50 text-[10pt]">
            <span className="text-muted-foreground mr-1.5">Target:</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">{targetPercent}%</span>
          </div>
          <div className="bg-muted/40 px-[8px] py-[6px] my-[6px] mx-[8px] rounded-[7px] border border-border/50 text-[10pt]">
            <span className="text-muted-foreground mr-1.5">Aktual:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{actualPercent}%</span>
          </div>
          {targetPercent === 0 && actualPercent === 0 ? (
            <Badge variant="outline" className="text-[10pt] px-[8px] py-[6px] my-[6px] mx-[8px] rounded-[7px] h-auto font-medium bg-muted text-muted-foreground border-border">
              Belum Dimulai (0%)
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className={`text-[10pt] px-[8px] py-[6px] my-[6px] mx-[8px] rounded-[7px] h-auto font-medium flex items-center gap-1 ${
                isAhead
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800'
                  : 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800'
              }`}
            >
              {isAhead ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Deviasi: +{deviation}% (Ahead)
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5" />
                  Deviasi: {deviation}% (Behind)
                </>
              )}
            </Badge>
          )}

          {/* Tombol Collapse / Expand */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-auto text-[10pt] px-[8px] py-[6px] my-[6px] mx-[8px] rounded-[7px] gap-1.5 font-medium"
          >
            {isCollapsed ? (
              <>
                <Eye className="w-3.5 h-3.5 text-primary" />
                <span>Tampilkan Kurva S</span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-0.5" />
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Sembunyikan</span>
                <ChevronUp className="w-3.5 h-3.5 text-muted-foreground ml-0.5" />
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {/* Konten Grafik Kurva S (Bisa di-collapse/expand) */}
      {!isCollapsed && (
        <CardContent className="p-4 sm:p-6 animate-fade-in">
          <div className="h-[320px] w-full">
            {!data || data.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center bg-muted/10 rounded-xl border border-dashed border-border/80 p-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-1">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-foreground">Grafik Kurva S Belum Tersedia</h4>
              </div>
            ) : isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={data}
                  margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                  <XAxis
                    dataKey="dayLabel"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 20, 40, 60, 80, 100]}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(val) => `${val}%`}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value: any, name: any) => {
                      if (value === null || value === undefined) return ['Belum Berjalan', name];
                      return [`${value}%`, name];
                    }}
                    labelFormatter={(label, payload) => {
                      const item = payload?.[0]?.payload;
                      return item ? `${label} (${item.date})` : label;
                    }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    wrapperStyle={{ fontSize: '12px', paddingBottom: '8px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="actualPercent"
                    name="Realisasi Aktual Kumulatif"
                    fill="url(#actualGradient)"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    connectNulls={false}
                    activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="targetPercent"
                    name="Rencana Kumulatif (Baseline)"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 3, fill: '#3b82f6' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center bg-muted/10 rounded-lg animate-pulse">
                <span className="text-[10pt] text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 animate-spin" /> Memuat visualisasi Kurva S...
                </span>
              </div>
            )}
          </div>
          <div className="mt-2 text-center text-[11px] text-muted-foreground">
            * Garis putus-putus biru = Target Rencana Kumulatif (Baseline S-Curve). Garis hijau solid = Realisasi Aktual Kumulatif di lapangan.
          </div>
        </CardContent>
      )}
    </Card>
  );
}
