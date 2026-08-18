'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Building, Search } from 'lucide-react';

export default function CustomersSettingsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const customers = [
    { id: 'CUST-001', name: 'PT Telkomsel Tbk', company: 'Telkomsel', pic: 'Budi Prasetyo', email: 'budi@telkomsel.co.id', phone: '+62 811 0000 1111' },
    { id: 'CUST-002', name: 'PT Indosat Tbk', company: 'Indosat Ooredoo', pic: 'Hendra Setiawan', email: 'hendra@indosat.com', phone: '+62 815 0000 2222' },
    { id: 'CUST-003', name: 'PT XL Axiata Tbk', company: 'XL Axiata', pic: 'Siti Rahma', email: 'siti@xl.co.id', phone: '+62 817 0000 3333' },
    { id: 'CUST-004', name: 'Bank Mandiri HQ', company: 'Bank Mandiri', pic: 'Dewi Lestari', email: 'dewi@mandiri.co.id', phone: '+62 812 0000 4444' },
  ];

  const filteredCustomers = customers.filter((c) =>
    c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.pic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Customer Master Data</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Client &amp; Project Owner Profiles (PRD Module 15 Entity 2)
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-none ring-0">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Registered Client Directory
            </CardTitle>
            <CardDescription className="text-xs">Search client companies and PIC contact details</CardDescription>
          </div>
          <div className="flex items-center gap-2 max-w-sm w-full">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search customer name, company, email..."
                className="pl-8 text-xs h-9 border-border bg-background shadow-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer ID</TableHead>
                <TableHead>Customer Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Contact Person (PIC)</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Phone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-xs text-muted-foreground">
                    No matching customers found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs font-bold">{c.id}</TableCell>
                    <TableCell className="text-xs font-semibold">{c.name}</TableCell>
                    <TableCell className="text-xs">{c.company}</TableCell>
                    <TableCell className="text-xs">{c.pic}</TableCell>
                    <TableCell className="text-xs text-primary">{c.email}</TableCell>
                    <TableCell className="text-right text-xs font-mono">{c.phone}</TableCell>
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
