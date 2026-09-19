'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FolderKanban,
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit,
  FolderX,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import StatusBadge from '@/components/shared/StatusBadge';
import { useProject, Project } from '@/context/ProjectContext';
import { useBowheer, Bowheer } from '@/context/BowheerContext';
import { toast } from 'sonner';
import { getStatusLabel } from '@/lib/utils';
import { getUsersAction } from '@/app/actions/masterData';

export default function ProjectsPage() {
  const router = useRouter();
  const { projects, addProject, updateProject, deleteProject } = useProject();
  const { bowheers } = useBowheer();
  const activeBowheers = useMemo(() => bowheers.filter((b: Bowheer) => b.status === 'ACTIVE'), [bowheers]);
  const [managers, setManagers] = useState<Array<{ name: string; role: string }>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  // Fetch real system users as managers
  useEffect(() => {
    getUsersAction().then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        setManagers(res.data.map((u) => ({ name: u.fullName || u.username, role: u.role || 'Member' })));
      } else {
        setManagers([]);
      }
    }).catch((err) => {
      console.warn('Failed to load users for project managers:', err);
      setManagers([]);
    });
  }, []);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  // Form states
  const [newProjectData, setNewProjectData] = useState<Partial<Project>>({
    id: '',
    name: '',
    customer: '',
    type: 'Backbone Fiber',
    location: '',
    contractNo: '',
    startDate: new Date().toISOString().split('T')[0],
    targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    manager: '',
  });
  const [editProjectData, setEditProjectData] = useState<Partial<Project>>({});

  // Synchronize default customer/manager when modal opens or lists load
  useEffect(() => {
    if (!newProjectData.customer && activeBowheers.length > 0) {
      setNewProjectData((prev) => ({ ...prev, customer: activeBowheers[0].name }));
    }
  }, [activeBowheers, newProjectData.customer]);

  useEffect(() => {
    if (!newProjectData.manager && managers.length > 0) {
      setNewProjectData((prev) => ({ ...prev, manager: managers[0].name }));
    }
  }, [managers, newProjectData.manager]);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectData.name) {
      toast.error('Nama proyek wajib diisi');
      return;
    }

    const autoId = newProjectData.id?.trim()
      ? newProjectData.id.trim()
      : `PRJ-2026-00${projects.length + 1}`;

    const newUuid = crypto.randomUUID();
    const createdProj: Project = {
      id: newUuid,
      name: newProjectData.name.trim(),
      customer: newProjectData.customer || (activeBowheers[0]?.name || '-'),
      type: newProjectData.type || 'Backbone Fiber',
      location: newProjectData.location?.trim() || 'Indonesia',
      contractNo: newProjectData.contractNo?.trim() || autoId,
      startDate: newProjectData.startDate || new Date().toISOString().split('T')[0],
      targetDate: newProjectData.targetDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      manager: newProjectData.manager || (managers[0]?.name || '-'),
      status: 'Planning',
    };

    // Inisialisasi item designator kosong agar pengguna dapat mengisi designator sendiri dari nol
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`proper_project_designators_${newUuid}`, JSON.stringify([]));
      } catch (err) {
        console.warn('Failed to set initial designators', err);
      }
    }

    addProject(createdProj);
    toast.success(`Proyek ${createdProj.contractNo || autoId} (${createdProj.name}) berhasil dibuat!`);
    setIsCreateModalOpen(false);

    // Reset Form
    setNewProjectData({
      id: '',
      name: '',
      customer: activeBowheers[0]?.name || '',
      type: 'Backbone Fiber',
      location: '',
      contractNo: '',
      startDate: new Date().toISOString().split('T')[0],
      targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      manager: managers[0]?.name || '',
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeProject) {
      updateProject(activeProject.id, editProjectData);
      toast.success(`Project ${activeProject.id} berhasil diupdate!`);
      setIsEditModalOpen(false);
    }
  };

  const handleDelete = async (id: string, name?: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus proyek "${name || id}"?`)) {
      await deleteProject(id);
      toast.success(`Proyek berhasil dihapus.`);
    }
  };

  const openDetail = (project: Project) => {
    router.push(`/projects/${project.id}`);
  };

  const openEdit = (project: Project) => {
    setActiveProject(project);
    setEditProjectData(project);
    setIsEditModalOpen(true);
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.contractNo && p.contractNo.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' ||
      (p.status && p.status.toLowerCase() === statusFilter.toLowerCase());

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Project Master Lists</h1>
          <p className="text-muted-foreground text-[13px] mt-1">
            Buat, kelola, dan pantau proyek Fiber Optic Anda
          </p>
        </div>
      </div>

      {/* Projects Table & Filters */}
      <Card className="border-0 shadow-none ring-0 bg-transparent py-0 gap-0">
        <CardHeader className="px-0 pb-3 flex flex-row items-center justify-between">
          <div className="flex-1"></div>
          <div className="flex items-center gap-2 w-full max-w-xl justify-end flex-wrap sm:flex-nowrap">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Cari disini" 
                className="pl-8 pr-[8px] py-[6px] text-[13px] h-auto bg-card"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Status */}
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || 'ALL')}>
              <SelectTrigger className="w-auto min-w-[110px] px-[8px] py-[6px] text-[13px] h-auto bg-card cursor-pointer shrink-0">
                <SelectValue placeholder="Status">
                  {statusFilter === 'ALL' ? 'Status' : getStatusLabel(statusFilter)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-[13px]">Semua Status</SelectItem>
                <SelectItem value="Planning" className="text-[13px]">Planning</SelectItem>
                <SelectItem value="Survey" className="text-[13px]">Survey</SelectItem>
                <SelectItem value="Implementation" className="text-[13px]">Implementation</SelectItem>
                <SelectItem value="Active" className="text-[13px]">Active</SelectItem>
                <SelectItem value="Completed" className="text-[13px]">Completed</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Dialog Buat Proyek */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger render={<Button className="gap-2 text-[13px] px-[8px] py-[6px] h-auto shadow-none cursor-pointer whitespace-nowrap shrink-0" />}>
                <Plus className="w-4 h-4" />
                Tambah Proyek
              </DialogTrigger>
              <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Tambah Proyek</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateProject} className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 py-4">
                    <div className="space-y-2 col-span-2 md:col-span-3">
                      <Label htmlFor="projId" className="text-[13px]">Project ID <span className="text-xs text-muted-foreground">(Opsional / Custom)</span></Label>
                      <Input
                        id="projId"
                        placeholder={`misal: PRJ-2026-00${projects.length + 1}`}
                        value={newProjectData.id}
                        onChange={(e) => setNewProjectData({ ...newProjectData, id: e.target.value })}
                        className="px-[8px] py-[6px] text-[13px] h-auto"
                      />
                    </div>
                    <div className="space-y-2 col-span-2 md:col-span-3">
                      <Label htmlFor="projName" className="text-[13px]">Nama Proyek <span className="text-destructive">*</span></Label>
                      <Input
                        id="projName"
                        placeholder="e.g. Backbone Fiber Semarang - Solo"
                        value={newProjectData.name}
                        onChange={(e) => setNewProjectData({ ...newProjectData, name: e.target.value })}
                        required
                        className="px-[8px] py-[6px] text-[13px] h-auto"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="projCustomer" className="text-[13px]">Customer / Client (Bowheer)</Label>
                        <span className="text-[11px] text-muted-foreground">Master Bowheer</span>
                      </div>
                      <Select
                        value={newProjectData.customer}
                        onValueChange={(val) => setNewProjectData({ ...newProjectData, customer: val || undefined })}
                      >
                        <SelectTrigger id="projCustomer" className="px-[8px] py-[6px] text-[13px] h-auto"><SelectValue placeholder="Pilih Client / Bowheer" /></SelectTrigger>
                        <SelectContent>
                          {activeBowheers.map((b: Bowheer) => (
                            <SelectItem key={b.id} value={b.name} className="text-[13px]">
                              {b.name} {b.code ? `(${b.code})` : ''}
                            </SelectItem>
                          ))}
                          {newProjectData.customer && !activeBowheers.some((b: Bowheer) => b.name === newProjectData.customer) && (
                            <SelectItem value={newProjectData.customer} className="text-[13px]">{newProjectData.customer}</SelectItem>
                          )}
                          <SelectItem value="Lainnya" className="text-[13px]">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="projType" className="text-[13px]">Tipe Proyek</Label>
                      <Select
                        value={newProjectData.type}
                        onValueChange={(val) => setNewProjectData({ ...newProjectData, type: val || undefined })}
                      >
                        <SelectTrigger id="projType" className="px-[8px] py-[6px] text-[13px] h-auto"><SelectValue placeholder="Pilih Tipe" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Backbone Fiber" className="text-[13px]">Backbone Fiber</SelectItem>
                          <SelectItem value="Metro Fiber" className="text-[13px]">Metro Fiber</SelectItem>
                          <SelectItem value="FTTx" className="text-[13px]">FTTx Access</SelectItem>
                          <SelectItem value="Enterprise Fiber" className="text-[13px]">Enterprise Fiber</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="projLocation" className="text-[13px]">Lokasi Pekerjaan</Label>
                      <Input
                        id="projLocation"
                        placeholder="e.g. Jawa Tengah"
                        value={newProjectData.location}
                        onChange={(e) => setNewProjectData({ ...newProjectData, location: e.target.value })}
                        className="px-[8px] py-[6px] text-[13px] h-auto"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="projContract" className="text-[13px]">Nomor Kontrak</Label>
                      <Input
                        id="projContract"
                        placeholder="e.g. CTR/2026/099"
                        value={newProjectData.contractNo}
                        onChange={(e) => setNewProjectData({ ...newProjectData, contractNo: e.target.value })}
                        className="px-[8px] py-[6px] text-[13px] h-auto"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="projStartDate" className="text-[13px]">Start Date</Label>
                      <Input
                        id="projStartDate"
                        type="date"
                        value={newProjectData.startDate}
                        onChange={(e) => setNewProjectData({ ...newProjectData, startDate: e.target.value })}
                        className="px-[8px] py-[6px] text-[13px] h-auto"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="projTargetDate" className="text-[13px]">Target Completion Date</Label>
                      <Input
                        id="projTargetDate"
                        type="date"
                        value={newProjectData.targetDate}
                        onChange={(e) => setNewProjectData({ ...newProjectData, targetDate: e.target.value })}
                        className="px-[8px] py-[6px] text-[13px] h-auto"
                      />
                    </div>
                    
                    <div className="space-y-2 col-span-2 md:col-span-3">
                      <Label htmlFor="projManager" className="text-[13px]">Project Manager (PIC)</Label>
                      <Select
                        value={newProjectData.manager}
                        onValueChange={(val) => setNewProjectData({ ...newProjectData, manager: val || undefined })}
                      >
                        <SelectTrigger id="projManager" className="px-[8px] py-[6px] text-[13px] h-auto">
                          <SelectValue placeholder="Pilih Project Manager / PIC" />
                        </SelectTrigger>
                        <SelectContent>
                          {managers.map((pm) => (
                            <SelectItem key={pm.name} value={pm.name} className="text-[13px]">
                              {pm.name} ({pm.role})
                            </SelectItem>
                          ))}
                          {newProjectData.manager && !managers.some((pm) => pm.name === newProjectData.manager) && (
                            <SelectItem value={newProjectData.manager} className="text-[13px]">{newProjectData.manager}</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter className="pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)} className="px-[8px] py-[6px] text-[13px] h-auto cursor-pointer">Batal</Button>
                    <Button type="submit" className="px-[8px] py-[6px] text-[13px] h-auto cursor-pointer">Simpan Proyek</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <Table className="table-fixed w-full text-[13px]">
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-b border-border/60">
                  <TableHead className="font-semibold text-foreground py-3 px-3 text-[13px] w-[35%]">Project Name</TableHead>
                  <TableHead className="font-semibold text-foreground px-3 text-[13px] w-[15%]">Manager</TableHead>
                  <TableHead className="font-semibold text-foreground px-3 text-[13px] w-[15%]">Schedule</TableHead>
                  <TableHead className="font-semibold text-foreground px-3 text-[13px] w-[15%]">Details</TableHead>
                  <TableHead className="font-semibold text-foreground px-3 text-[13px] w-[10%]">Status</TableHead>
                  <TableHead className="font-semibold text-foreground text-right pr-4 px-3 text-[13px] w-[10%]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={6} className="h-[400px] text-center text-[13px]">
                      <div className="flex flex-col items-center justify-center h-full">
                        <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                          <FolderX className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">Belum ada proyek</h3>
                        <p className="text-muted-foreground text-[13px] max-w-sm mb-6">Silakan tambah proyek baru atau sesuaikan kata kunci pencarian Anda.</p>
                        <Button onClick={() => setIsCreateModalOpen(true)} className="text-[13px] px-[8px] py-[6px] h-auto cursor-pointer">
                          <Plus className="w-4 h-4 mr-2" />
                          Tambah Proyek Baru
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProjects.map((p) => {
                    return (
                    <TableRow 
                      key={p.id} 
                      className="hover:bg-muted/30 transition-colors cursor-pointer border-b border-border/60 text-[13px]"
                      onClick={() => openDetail(p)}
                    >
                      <TableCell className="py-2.5 px-3">
                        <div>
                          <div className="font-medium text-foreground text-[13px]">{p.name}</div>
                          <div className="text-[13px] text-muted-foreground mt-0.5">{p.contractNo ? p.contractNo.split(' | ')[0] : p.id.substring(0, 8).toUpperCase()}</div>
                        </div>
                      </TableCell>
                      <TableCell className="px-3">
                        <div className="font-medium text-foreground text-[13px]">{p.manager || 'No Manager'}</div>
                        <div className="text-[13px] text-muted-foreground mt-0.5">{p.customer}</div>
                      </TableCell>
                      <TableCell className="px-3">
                        <div className="font-medium text-foreground text-[13px]">{p.startDate}</div>
                        <div className="text-[13px] text-muted-foreground mt-0.5">Target: {p.targetDate || '-'}</div>
                      </TableCell>
                      <TableCell className="px-3">
                        <div className="font-medium text-foreground text-[13px]">{p.type || 'Backbone'}</div>
                        <div className="text-[13px] text-muted-foreground mt-0.5">{p.location || '-'}</div>
                      </TableCell>
                      <TableCell className="px-3">
                        <StatusBadge status={p.status || 'Active'} className="text-[13px]" />
                      </TableCell>
                      <TableCell className="text-right pr-4 px-3">
                        <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer" />}>
                              <MoreVertical className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40 text-[13px]">
                              <DropdownMenuItem onClick={() => openDetail(p)} className="cursor-pointer text-[13px]">
                                <Eye className="w-4 h-4 mr-2" />
                                Lihat Detil
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEdit(p)} className="cursor-pointer text-[13px]">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Detil
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                variant="destructive" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(p.id, p.name);
                                }} 
                                className="cursor-pointer text-[13px]"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Hapus Proyek
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      

      {/* Modal Edit */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Proyek</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="space-y-2 col-span-2">
                <Label className="text-[13px]">Project ID</Label>
                <Input disabled value={editProjectData.id || ''} className="px-[8px] py-[6px] text-[13px] h-auto bg-muted" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="editProjName" className="text-[13px]">Nama Proyek <span className="text-destructive">*</span></Label>
                <Input
                  id="editProjName"
                  value={editProjectData.name || ''}
                  onChange={(e) => setEditProjectData({ ...editProjectData, name: e.target.value })}
                  required
                  className="px-[8px] py-[6px] text-[13px] h-auto"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="editCustomer" className="text-[13px]">Customer / Client (Bowheer)</Label>
                  <span className="text-[11px] text-muted-foreground">Master Bowheer</span>
                </div>
                <Select
                  value={editProjectData.customer || ''}
                  onValueChange={(val) => setEditProjectData({ ...editProjectData, customer: val || undefined })}
                >
                  <SelectTrigger id="editCustomer" className="px-[8px] py-[6px] text-[13px] h-auto"><SelectValue placeholder="Pilih Client / Bowheer" /></SelectTrigger>
                  <SelectContent>
                    {activeBowheers.map((b: Bowheer) => (
                      <SelectItem key={b.id} value={b.name} className="text-[13px]">
                        {b.name} {b.code ? `(${b.code})` : ''}
                      </SelectItem>
                    ))}
                    {editProjectData.customer && !activeBowheers.some((b: Bowheer) => b.name === editProjectData.customer) && (
                      <SelectItem value={editProjectData.customer} className="text-[13px]">{editProjectData.customer}</SelectItem>
                    )}
                    <SelectItem value="Lainnya" className="text-[13px]">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editType" className="text-[13px]">Tipe Proyek</Label>
                <Select
                  value={editProjectData.type || ''}
                  onValueChange={(val) => setEditProjectData({ ...editProjectData, type: val || undefined })}
                >
                  <SelectTrigger id="editType" className="px-[8px] py-[6px] text-[13px] h-auto"><SelectValue placeholder="Pilih Tipe" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Backbone Fiber" className="text-[13px]">Backbone Fiber</SelectItem>
                    <SelectItem value="Metro Fiber" className="text-[13px]">Metro Fiber</SelectItem>
                    <SelectItem value="FTTx" className="text-[13px]">FTTx Access</SelectItem>
                    <SelectItem value="Enterprise Fiber" className="text-[13px]">Enterprise Fiber</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editLocation" className="text-[13px]">Lokasi Pekerjaan</Label>
                <Input
                  id="editLocation"
                  value={editProjectData.location || ''}
                  onChange={(e) => setEditProjectData({ ...editProjectData, location: e.target.value })}
                  className="px-[8px] py-[6px] text-[13px] h-auto"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editContract" className="text-[13px]">Nomor Kontrak</Label>
                <Input
                  id="editContract"
                  value={editProjectData.contractNo || ''}
                  onChange={(e) => setEditProjectData({ ...editProjectData, contractNo: e.target.value })}
                  className="px-[8px] py-[6px] text-[13px] h-auto"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editManager" className="text-[13px]">Project Manager (PIC)</Label>
                <Select
                  value={editProjectData.manager || ''}
                  onValueChange={(val) => setEditProjectData({ ...editProjectData, manager: val || undefined })}
                >
                  <SelectTrigger id="editManager" className="px-[8px] py-[6px] text-[13px] h-auto">
                    <SelectValue placeholder="Pilih Project Manager / PIC" />
                  </SelectTrigger>
                  <SelectContent>
                    {managers.map((pm) => (
                      <SelectItem key={pm.name} value={pm.name} className="text-[13px]">
                        {pm.name} ({pm.role})
                      </SelectItem>
                    ))}
                    {editProjectData.manager && !managers.some((pm) => pm.name === editProjectData.manager) && (
                      <SelectItem value={editProjectData.manager} className="text-[13px]">{editProjectData.manager}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editStatus" className="text-[13px]">Status</Label>
                <Select
                  value={editProjectData.status || ''}
                  onValueChange={(val) => setEditProjectData({ ...editProjectData, status: val || undefined })}
                >
                  <SelectTrigger id="editStatus" className="px-[8px] py-[6px] text-[13px] h-auto"><SelectValue placeholder="Pilih Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planning" className="text-[13px]">Planning</SelectItem>
                    <SelectItem value="Survey" className="text-[13px]">Survey</SelectItem>
                    <SelectItem value="Implementation" className="text-[13px]">Implementation</SelectItem>
                    <SelectItem value="Completed" className="text-[13px]">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} className="px-[8px] py-[6px] text-[13px] h-auto cursor-pointer">Batal</Button>
              <Button type="submit" className="px-[8px] py-[6px] text-[13px] h-auto cursor-pointer">Simpan Perubahan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
