'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Network, Server, Home, Building2, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ProjectClassificationPage() {
  const classifications = [
    {
      title: 'Backbone Fiber',
      icon: Network,
      color: 'bg-blue-500/10 text-blue-600 border-blue-200',
      description: 'Infrastruktur jalur antar-kota / inter-POP dengan jarak panjang dan kapasitas core besar.',
      characteristics: ['Long Distance (>30 KM)', 'High Core Capacity (48-144 Core)', 'Inter-City & Inter-POP', 'High Protection Direct Buried'],
      activeProjects: 4,
    },
    {
      title: 'Metro Fiber',
      icon: Server,
      color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200',
      description: 'Jaringan Fiber Optic area perkotaan dengan ketersediaan node padat dan arsitektur ring.',
      characteristics: ['Urban Dense Area', 'Ring Topology Architecture', 'Multiple POP & Substation Access', 'Aerial & Duct Installation'],
      activeProjects: 5,
    },
    {
      title: 'FTTx Access',
      icon: Home,
      color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
      description: 'Jaringan distribusi akses pelanggan akhir (Last Mile / ODP Distribution).',
      characteristics: ['Last Mile Customer Access', 'ODP & Feeder Distribution', 'High Pole & Pole Attachment', 'Mass Cluster Deployment'],
      activeProjects: 3,
    },
    {
      title: 'Enterprise Fiber',
      icon: Building2,
      color: 'bg-purple-500/10 text-purple-600 border-purple-200',
      description: 'Jaringan fiber khusus pelanggan korporasi/Dedicated dengan requirement SLA tinggi.',
      characteristics: ['Dedicated Customer Connection', 'High SLA & Redundancy', 'Custom Route & Site Termination', 'Fast Deployment Milestone'],
      activeProjects: 2,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Project Classification</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Categorization of Fiber Optic projects according to PRD Module 1
          </p>
        </div>
        <Link href="/projects">
          <Button variant="outline" className="text-xs">
            &larr; Back to Project Master
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {classifications.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="border shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold">{item.title}</CardTitle>
                      <Badge variant="secondary" className="text-[10px] mt-0.5">
                        {item.activeProjects} Active Projects
                      </Badge>
                    </div>
                  </div>
                </div>
                <CardDescription className="text-xs mt-2">{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5 pt-2 border-t">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase">Key Characteristics:</span>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {item.characteristics.map((char, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span>{char}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
