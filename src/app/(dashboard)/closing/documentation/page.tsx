'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileCheck2, Download, FolderArchive, Search, Filter } from 'lucide-react';

export default function ClosingDocumentationPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const docs = [
    { name: 'As-Built Drawing Route JKT-BDG.pdf', category: 'Engineering', size: '14.2 MB', date: '2026-03-20', status: 'Final Verified' },
    { name: 'Final KML Route Realization.kml', category: 'GIS Spatial', size: '2.8 MB', date: '2026-03-20', status: 'Final Verified' },
    { name: 'Fiber Core Splice Mapping.pdf', category: 'Engineering', size: '4.5 MB', date: '2026-03-20', status: 'Final Verified' },
    { name: 'OTDR Trace Master Report.pdf', category: 'Testing', size: '8.1 MB', date: '2026-03-22', status: 'Final Verified' },
    { name: 'BAUT Signed Copy.pdf', category: 'Acceptance', size: '3.0 MB', date: '2026-03-25', status: 'Customer Signed' },
  ];

  const filteredDocs = docs.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === 'ALL' || d.category.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">As-Built Documentation Repository</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Project Completion Package &amp; Final Documentation Repository (PRD Module 7 Section 5-6)
          </p>
        </div>
        <Button className="gap-2 text-xs shadow-none cursor-pointer">
          <FolderArchive className="w-4 h-4" /> Download Complete ZIP Package
        </Button>
      </div>

      <Card className="border-0 shadow-none ring-0">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold">Final Project Repository (PRJ-2026-001)</CardTitle>
            <CardDescription className="text-xs">Search as-built drawing, KML, or testing documentation files</CardDescription>
          </div>
          <div className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search document name, format..."
                className="pl-8 text-xs h-9 border-border bg-background shadow-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={(val) => val && setCategoryFilter(val)}>
              <SelectTrigger className="w-36 text-xs h-9 border-border bg-background shadow-none">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="shadow-none border-border">
                <SelectItem value="ALL">All Categories</SelectItem>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="gis spatial">GIS Spatial</SelectItem>
                <SelectItem value="testing">Testing</SelectItem>
                <SelectItem value="acceptance">Acceptance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document File Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>File Size</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead className="text-right">Verification Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-xs text-muted-foreground">
                    No matching documentation files found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDocs.map((d) => (
                  <TableRow key={d.name}>
                    <TableCell className="font-medium text-xs font-mono text-primary flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-muted-foreground" />
                      {d.name}
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{d.category}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{d.size}</TableCell>
                    <TableCell className="text-xs">{d.date}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 border-emerald-300">
                        {d.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
