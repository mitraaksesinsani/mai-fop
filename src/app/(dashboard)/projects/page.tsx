'use client';

import { useState } from 'react';
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
import { toast } from 'sonner';

export default function ProjectsPage() {
  const { projects, addProject, updateProject, deleteProject, selectedProjectId, setSelectedProjectId } = useProject();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  // Form states
  const [newProjectData, setNewProjectData] = useState<Partial<Project>>({
    id: '',
    name: '',
    customer: 'PT Telkomsel Tbk',
    type: 'Backbone Fiber',
    location: '',
    contractNo: '',
    startDate: new Date().toISOString().split('T')[0],
    targetDate: '',
    manager: '',
  });
  const [editProjectData, setEditProjectData] = useState<Partial<Project>>({});

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectData.name) {
      toast.error('Nama proyek wajib diisi');
      return;
    }

    const autoId = newProjectData.id?.trim()
      ? newProjectData.id.trim()
      : `PRJ-2026-00${projects.length + 1}`;

    const createdProj: Project = {
      id: crypto.randomUUID(),
      name: newProjectData.name,
      customer: newProjectData.customer || 'PT Telkomsel Tbk',
      type: newProjectData.type || 'Backbone Fiber',
      location: newProjectData.location || 'Indonesia',
      contractNo: newProjectData.contractNo ? `${autoId} | ${newProjectData.contractNo}` : autoId,
      startDate: newProjectData.startDate,
      targetDate: newProjectData.targetDate || '2026-12-31',
      manager: newProjectData.manager || 'Project Manager',
      status: 'Planning',
    };

    addProject(createdProj);
    toast.success(`Project ${createdProj.id} (${createdProj.name}) berhasil dibuat!`);
    setIsCreateModalOpen(false);

    // Reset Form
    setNewProjectData({
      id: '',
      name: '',
      customer: 'PT Telkomsel Tbk',
      type: 'Backbone Fiber',
      location: '',
      contractNo: '',
      startDate: new Date().toISOString().split('T')[0],
      targetDate: '',
      manager: '',
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

  const handleDelete = (id: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus Project ID ${id}?`)) {
      deleteProject(id);
      toast.success(`Project ${id} berhasil dihapus.`);
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

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Project Master Lists</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Buat, kelola, dan pantau proyek Fiber Optic Anda
          </p>
        </div>
      </div>

      {/* Projects Table & Filters */}
      <Card className="border-0 shadow-none ring-0 bg-transparent">
        <CardHeader className="px-0 pb-3 flex flex-row items-center justify-between">
          <div className="flex-1"></div>
          <div className="flex items-center gap-2 w-full max-w-xl justify-end">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Cari Project ID atau Nama Proyek..." 
                className="pl-8 text-xs"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Dialog Buat Proyek */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger render={<Button className="gap-2 text-xs shadow-none cursor-pointer whitespace-nowrap" />}>
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
                      <Label htmlFor="projId">Project ID <span className="text-xs text-muted-foreground">(Opsional / Custom)</span></Label>
                      <Input
                        id="projId"
                        placeholder={`misal: PRJ-2026-00${projects.length + 1}`}
                        value={newProjectData.id}
                        onChange={(e) => setNewProjectData({ ...newProjectData, id: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2 col-span-2 md:col-span-3">
                      <Label htmlFor="projName">Nama Proyek <span className="text-destructive">*</span></Label>
                      <Input
                        id="projName"
                        placeholder="e.g. Backbone Fiber Semarang - Solo"
                        value={newProjectData.name}
                        onChange={(e) => setNewProjectData({ ...newProjectData, name: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="projCustomer">Customer / Client</Label>
                      <Select
                        value={newProjectData.customer}
                        onValueChange={(val) => setNewProjectData({ ...newProjectData, customer: val })}
                      >
                        <SelectTrigger id="projCustomer"><SelectValue placeholder="Pilih Client" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PT Telkomsel Tbk">PT Telkomsel Tbk</SelectItem>
                          <SelectItem value="PT Indosat Tbk">PT Indosat Tbk</SelectItem>
                          <SelectItem value="PT XL Axiata Tbk">PT XL Axiata Tbk</SelectItem>
                          <SelectItem value="Bank Mandiri">Bank Mandiri</SelectItem>
                          <SelectItem value="Lainnya">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="projType">Tipe Proyek</Label>
                      <Select
                        value={newProjectData.type}
                        onValueChange={(val) => setNewProjectData({ ...newProjectData, type: val })}
                      >
                        <SelectTrigger id="projType"><SelectValue placeholder="Pilih Tipe" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Backbone Fiber">Backbone Fiber</SelectItem>
                          <SelectItem value="Metro Fiber">Metro Fiber</SelectItem>
                          <SelectItem value="FTTx">FTTx Access</SelectItem>
                          <SelectItem value="Enterprise Fiber">Enterprise Fiber</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="projLocation">Lokasi Pekerjaan</Label>
                      <Input
                        id="projLocation"
                        placeholder="e.g. Jawa Tengah"
                        value={newProjectData.location}
                        onChange={(e) => setNewProjectData({ ...newProjectData, location: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="projContract">Nomor Kontrak</Label>
                      <Input
                        id="projContract"
                        placeholder="e.g. CTR/2026/099"
                        value={newProjectData.contractNo}
                        onChange={(e) => setNewProjectData({ ...newProjectData, contractNo: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="projStartDate">Start Date</Label>
                      <Input
                        id="projStartDate"
                        type="date"
                        value={newProjectData.startDate}
                        onChange={(e) => setNewProjectData({ ...newProjectData, startDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="projTargetDate">Target Completion Date</Label>
                      <Input
                        id="projTargetDate"
                        type="date"
                        value={newProjectData.targetDate}
                        onChange={(e) => setNewProjectData({ ...newProjectData, targetDate: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2 col-span-2 md:col-span-3">
                      <Label htmlFor="projManager">Project Manager (PIC)</Label>
                      <Input
                        id="projManager"
                        placeholder="e.g. Budi Santoso"
                        value={newProjectData.manager}
                        onChange={(e) => setNewProjectData({ ...newProjectData, manager: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter className="pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>Batal</Button>
                    <Button type="submit">Simpan Proyek</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="font-semibold text-foreground py-4">Project Name</TableHead>
                <TableHead className="font-semibold text-foreground">Manager</TableHead>
                <TableHead className="font-semibold text-foreground">Schedule</TableHead>
                <TableHead className="font-semibold text-foreground">Details</TableHead>
                <TableHead className="font-semibold text-foreground">Status</TableHead>
                <TableHead className="font-semibold text-foreground text-right pr-4">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="h-[400px] text-center">
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                        <FolderX className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">Belum ada proyek</h3>
                      <p className="text-muted-foreground text-sm max-w-sm mb-6">Silakan tambah proyek baru atau sesuaikan kata kunci pencarian Anda.</p>
                      <Button onClick={() => setIsCreateModalOpen(true)}>
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
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="py-4">
                      <div>
                        <div className="font-medium text-foreground">{p.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{p.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">{p.manager || 'No Manager'}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{p.customer}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">{p.startDate}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Target: {p.targetDate || '-'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">{p.type || 'Backbone'}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{p.location || '-'}</div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={p.status || 'Active'} />
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" />}>
                            <MoreVertical className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => openDetail(p)} className="cursor-pointer">
                              <Eye className="w-4 h-4 mr-2" />
                              Lihat Detil
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEdit(p)} className="cursor-pointer">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Detil
                            </DropdownMenuItem>
                            <DropdownMenuItem variant="destructive" onClick={() => handleDelete(p.id)} className="cursor-pointer">
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
                <Label>Project ID</Label>
                <Input disabled value={editProjectData.id || ''} className="bg-muted" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="editProjName">Nama Proyek <span className="text-destructive">*</span></Label>
                <Input
                  id="editProjName"
                  value={editProjectData.name || ''}
                  onChange={(e) => setEditProjectData({ ...editProjectData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editCustomer">Customer / Client</Label>
                <Select
                  value={editProjectData.customer || ''}
                  onValueChange={(val) => setEditProjectData({ ...editProjectData, customer: val })}
                >
                  <SelectTrigger id="editCustomer"><SelectValue placeholder="Pilih Client" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PT Telkomsel Tbk">PT Telkomsel Tbk</SelectItem>
                    <SelectItem value="PT Indosat Tbk">PT Indosat Tbk</SelectItem>
                    <SelectItem value="PT XL Axiata Tbk">PT XL Axiata Tbk</SelectItem>
                    <SelectItem value="Bank Mandiri">Bank Mandiri</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editType">Tipe Proyek</Label>
                <Select
                  value={editProjectData.type || ''}
                  onValueChange={(val) => setEditProjectData({ ...editProjectData, type: val })}
                >
                  <SelectTrigger id="editType"><SelectValue placeholder="Pilih Tipe" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Backbone Fiber">Backbone Fiber</SelectItem>
                    <SelectItem value="Metro Fiber">Metro Fiber</SelectItem>
                    <SelectItem value="FTTx">FTTx Access</SelectItem>
                    <SelectItem value="Enterprise Fiber">Enterprise Fiber</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editLocation">Lokasi Pekerjaan</Label>
                <Input
                  id="editLocation"
                  value={editProjectData.location || ''}
                  onChange={(e) => setEditProjectData({ ...editProjectData, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editContract">Nomor Kontrak</Label>
                <Input
                  id="editContract"
                  value={editProjectData.contractNo || ''}
                  onChange={(e) => setEditProjectData({ ...editProjectData, contractNo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editManager">Project Manager (PIC)</Label>
                <Input
                  id="editManager"
                  value={editProjectData.manager || ''}
                  onChange={(e) => setEditProjectData({ ...editProjectData, manager: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editStatus">Status</Label>
                <Select
                  value={editProjectData.status || ''}
                  onValueChange={(val) => setEditProjectData({ ...editProjectData, status: val })}
                >
                  <SelectTrigger id="editStatus"><SelectValue placeholder="Pilih Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planning">Planning</SelectItem>
                    <SelectItem value="Survey">Survey</SelectItem>
                    <SelectItem value="Implementation">Implementation</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Batal</Button>
              <Button type="submit">Simpan Perubahan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
