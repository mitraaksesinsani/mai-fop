'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users } from 'lucide-react';

export default function UsersSettingsPage() {
  const users = [
    { id: 'USR-001', name: 'Admin FOPLP', email: 'admin@foplp.com', role: 'Project Owner', dept: 'Executive Management', status: 'Active' },
    { id: 'USR-002', name: 'Budi Santoso', email: 'budi@foplp.com', role: 'Project Manager', dept: 'Project Delivery', status: 'Active' },
    { id: 'USR-003', name: 'Ahmad Hidayat', email: 'ahmad@foplp.com', role: 'Engineering Team', dept: 'Network Design', status: 'Active' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">User Roles & Permissions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Stakeholder Access & System Roles (PRD Module 1 Section 8 & Module 15 Entity 3-4)
          </p>
        </div>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">User Role Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Email Address</TableHead>
                <TableHead>System Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-mono text-xs font-bold">{u.id}</TableCell>
                  <TableCell className="text-xs font-semibold">{u.name}</TableCell>
                  <TableCell className="text-xs text-primary">{u.email}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{u.role}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{u.dept}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 border-emerald-300">
                      {u.status}
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
