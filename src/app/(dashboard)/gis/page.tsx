'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import {
  Map as MapIcon,
  Layers,
  Upload,
  Download,
  Filter,
  Eye,
  EyeOff,
  Palette,
  Globe,
  Plus,
  Folder,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  PenTool,
  Search,
  CheckCircle2,
  Trash2,
  MapPin,
  LocateFixed,
  Focus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { COLOR_OPTIONS, ProjectKmlTrack, exportToKML } from '@/components/map/GisMapComponent';

// Dynamic import for Leaflet GIS Map component (MapCN pattern)
const GisMapComponent = dynamic(() => import('@/components/map/GisMapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[650px] bg-muted/20 border border-border rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground text-xs font-mono">
      <MapIcon className="w-6 h-6 animate-spin text-primary" />
      <span>Loading Google Earth Tree Layering Spatial Map (MapCN)...</span>
    </div>
  )
});

export default function GISPage() {
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('ALL');
  const [treeSearchQuery, setTreeSearchQuery] = useState<string>('');
  const [focusBounds, setFocusBounds] = useState<L.LatLngBoundsExpression | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'PRJ-2026-001': true,
    'PRJ-2026-002': true,
    'PRJ-2026-003': true,
    'UNASSIGNED': true,
  });

  // Initial KML Tracks state (Clean slate - no dummy data)
  const [projectTracks, setProjectTracks] = useState<ProjectKmlTrack[]>([]);

  // Filter project tracks based on tree search query
  const filteredProjectTracks = projectTracks.filter(t => {
    if (!treeSearchQuery.trim()) return true;
    const q = treeSearchQuery.toLowerCase();
    return (
      t.projectId.toLowerCase().includes(q) ||
      t.projectName.toLowerCase().includes(q) ||
      t.trackName.toLowerCase().includes(q)
    );
  });

  // Direct map zoom/fly to specific track location when clicking sidebar layer
  const handleFocusTrack = (track: ProjectKmlTrack) => {
    if (track.coordinates && track.coordinates.length > 0) {
      if (!track.visible) {
        handleToggleVisibility(track.id);
      }
      if (track.coordinates.length === 1) {
        const pt = track.coordinates[0];
        setFocusBounds([[pt[0] - 0.005, pt[1] - 0.005], [pt[0] + 0.005, pt[1] + 0.005]]);
      } else {
        setFocusBounds(L.latLngBounds(track.coordinates));
      }
    }
  };

  // Direct map zoom/fly to entire project folder bounds
  const handleFocusProject = (projectId: string) => {
    const projTracks = projectTracks.filter(t => t.projectId === projectId && t.coordinates.length > 0);
    const allCoords: [number, number][] = [];
    projTracks.forEach(t => t.coordinates.forEach(pt => allCoords.push(pt)));
    if (allCoords.length > 0) {
      setFocusBounds(L.latLngBounds(allCoords));
    }
  };

  // Master Show All or Hide All KML Layers
  const handleToggleAllLayers = (show: boolean) => {
    setProjectTracks(prev => prev.map(t => ({ ...t, visible: show })));
  };

  // Toggle Visibility of a specific track
  const handleToggleVisibility = (trackId: string) => {
    setProjectTracks(prev =>
      prev.map(t => (t.id === trackId ? { ...t, visible: !t.visible } : t))
    );
  };

  // Toggle Visibility of an entire Project Folder (Google Earth style)
  const handleToggleProjectVisibility = (projId: string, currentVisibleState: boolean) => {
    setProjectTracks(prev =>
      prev.map(t => (t.projectId === projId ? { ...t, visible: !currentVisibleState } : t))
    );
  };

  // Delete individual KML track layer
  const handleDeleteTrack = (trackId: string) => {
    setProjectTracks(prev => prev.filter(t => t.id !== trackId));
  };

  // Delete entire KML Project Folder
  const handleDeleteProjectFolder = (projId: string, projName: string) => {
    if (confirm(`Are you sure you want to delete all KML layers under ${projName}?`)) {
      setProjectTracks(prev => prev.filter(t => t.projectId !== projId));
    }
  };

  // Change Line Color of a specific track via Dropdown
  const handleChangeColor = (trackId: string, color: string) => {
    setProjectTracks(prev =>
      prev.map(t => (t.id === trackId ? { ...t, color } : t))
    );
  };

  // Add new uploaded or drawn KML track
  const handleAddTrack = (newTrack: ProjectKmlTrack) => {
    setProjectTracks(prev => [newTrack, ...prev]);
    setExpandedFolders(prev => ({ ...prev, [newTrack.projectId]: true }));
    handleFocusTrack(newTrack);
  };

  // Add multiple tracks from uploaded KML file
  const handleAddMultipleTracks = (newTracks: ProjectKmlTrack[]) => {
    setProjectTracks(prev => [...newTracks, ...prev]);
    newTracks.forEach(t => {
      setExpandedFolders(prev => ({ ...prev, [t.projectId]: true }));
    });
    if (newTracks.length > 0) {
      handleFocusTrack(newTracks[0]);
    }
  };

  // Group tracks by Project ID for Google Earth Tree view
  const groupedProjects = filteredProjectTracks.reduce((acc, track) => {
    if (!acc[track.projectId]) {
      acc[track.projectId] = {
        projectId: track.projectId,
        projectName: track.projectName,
        tracks: []
      };
    }
    acc[track.projectId].tracks.push(track);
    return acc;
  }, {} as Record<string, { projectId: string; projectName: string; tracks: ProjectKmlTrack[] }>);

  // Check if all tracks in project are visible
  const isProjectFullyVisible = (projId: string) => {
    const proj = groupedProjects[projId];
    if (!proj) return false;
    return proj.tracks.every(t => t.visible);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">GIS Multi-Project Spatial Platform</h1>
            <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-600 bg-amber-500/10 font-mono">
              Google Earth Enterprise (GEE)
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Interactive Layer Focusing, Places Tree Direct Navigation &amp; Individual Project KML Engine
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2 text-xs shadow-none cursor-pointer border-border"
            onClick={() => {
              const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
              if (fileInput) fileInput.click();
            }}
          >
            <Upload className="w-4 h-4 text-primary" />
            Upload Google Earth KML
          </Button>
          <Button
            onClick={() => exportToKML(projectTracks, 'FOPLP_All_Projects_Spatial.kml')}
            className="gap-2 text-xs shadow-none cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Download className="w-4 h-4" />
            Export All KML
          </Button>
        </div>
      </div>

      {/* Main Grid: Google Earth Tree Sidebar + MapCN Map Component */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar: Google Earth Tree Layering Panel with Direct Layer Focus */}
        <div className="space-y-4 lg:col-span-1">
          {/* Display Mode Selector */}
          <Card className="border border-border shadow-none ring-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                Display Mode Filter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={selectedProjectFilter} onValueChange={(val) => val && setSelectedProjectFilter(val)}>
                <SelectTrigger className="w-full text-xs border-border shadow-none">
                  <SelectValue placeholder="Select Display Mode" />
                </SelectTrigger>
                <SelectContent className="shadow-none border-border">
                  <SelectItem value="ALL">🌐 ALL PROJECTS (Global Multi-Trace)</SelectItem>
                  <SelectItem value="PRJ-2026-001">PRJ-2026-001: JKT-BDG Backbone</SelectItem>
                  <SelectItem value="PRJ-2026-002">PRJ-2026-002: Surabaya Metro Ring</SelectItem>
                  <SelectItem value="PRJ-2026-003">PRJ-2026-003: Medan FTTx Access</SelectItem>
                  <SelectItem value="UNASSIGNED">Independent KML (Di Luar Project)</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Searchable Google Earth Style Tree Layering Manager */}
          <Card className="border border-border shadow-none ring-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  <span>Google Earth Places Tree</span>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {filteredProjectTracks.length} Layers
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Click layer name or target icon to navigate directly to its location on the map.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {/* Master Show All / Hide All & Search Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-1 text-xs">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase">Global Layers Control:</span>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleAllLayers(true)}
                      className="h-6 text-[10px] px-2 text-primary font-medium hover:bg-muted cursor-pointer"
                    >
                      <Eye className="w-3 h-3 mr-1 text-primary" /> Show All
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleAllLayers(false)}
                      className="h-6 text-[10px] px-2 text-muted-foreground hover:bg-muted cursor-pointer"
                    >
                      <EyeOff className="w-3 h-3 mr-1" /> Hide All
                    </Button>
                  </div>
                </div>

                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 text-muted-foreground" />
                  <Input
                    value={treeSearchQuery}
                    onChange={(e) => setTreeSearchQuery(e.target.value)}
                    placeholder="Search project or KML track..."
                    className="h-8 text-xs pl-8 border-border bg-muted/20 focus-visible:ring-0 shadow-none"
                  />
                </div>
              </div>

              {Object.keys(groupedProjects).length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground font-mono">
                  No matching project or KML track found.
                </div>
              ) : (
                Object.values(groupedProjects).map((group) => {
                  const isExpanded = expandedFolders[group.projectId] !== false;
                  const isParentVisible = isProjectFullyVisible(group.projectId);

                  return (
                    <div key={group.projectId} className="border border-border rounded-lg p-2.5 bg-card/60 space-y-2">
                      {/* Folder Header Row with Direct Zoom/Focus to Project Location */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 truncate">
                          <button
                            onClick={() =>
                              setExpandedFolders(prev => ({
                                ...prev,
                                [group.projectId]: !isExpanded
                              }))
                            }
                            className="text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>

                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded cursor-pointer accent-primary shrink-0"
                            checked={isParentVisible}
                            onChange={() => handleToggleProjectVisibility(group.projectId, isParentVisible)}
                          />

                          <button
                            onClick={() => handleFocusProject(group.projectId)}
                            className="text-xs font-bold text-foreground hover:text-primary transition-colors text-left truncate cursor-pointer"
                            title="Click to fly/zoom to this project location"
                          >
                            {group.projectName}
                          </button>
                        </div>

                        <div className="flex items-center gap-0.5 shrink-0">
                          {/* Direct Focus/Fly To Project Location Button */}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleFocusProject(group.projectId)}
                            className="h-6 w-6 text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                            title={`Fly to ${group.projectName} location`}
                          >
                            <LocateFixed className="w-3.5 h-3.5" />
                          </Button>

                          {/* Individual Project Download KML Button */}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => exportToKML(projectTracks, `${group.projectId}_KML_Export.kml`, group.projectId)}
                            className="h-6 w-6 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                            title={`Download .KML for ${group.projectName}`}
                          >
                            <Download className="w-3.5 h-3.5" />
                          </Button>

                          {/* Delete Entire Project Folder Button */}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteProjectFolder(group.projectId, group.projectName)}
                            className="h-6 w-6 text-muted-foreground hover:text-red-600 hover:bg-red-50 cursor-pointer"
                            title={`Delete all KML layers in ${group.projectName}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Sub-layers List */}
                      {isExpanded && (
                        <div className="pl-6 space-y-2 pt-1 border-t border-border/60">
                          {group.tracks.map((track) => (
                            <div key={track.id} className="space-y-1.5 p-1.5 rounded bg-muted/30 border border-border/40">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 truncate">
                                  <input
                                    type="checkbox"
                                    className="w-3.5 h-3.5 rounded cursor-pointer accent-primary shrink-0"
                                    checked={track.visible}
                                    onChange={() => handleToggleVisibility(track.id)}
                                  />
                                  <button
                                    onClick={() => handleFocusTrack(track)}
                                    className={`text-[11px] font-medium text-left truncate cursor-pointer hover:text-primary transition-colors ${!track.visible ? 'opacity-40 line-through' : ''}`}
                                    title="Click to fly/zoom directly to this KML layer location"
                                  >
                                    {track.trackName}
                                  </button>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  {/* Direct Focus/Fly To Layer Button */}
                                  <button
                                    onClick={() => handleFocusTrack(track)}
                                    className="text-muted-foreground hover:text-primary p-0.5 cursor-pointer"
                                    title="Fly to KML layer location"
                                  >
                                    <LocateFixed className="w-3 h-3" />
                                  </button>

                                  {/* Delete Individual Sub-Layer Button */}
                                  <button
                                    onClick={() => handleDeleteTrack(track.id)}
                                    className="text-muted-foreground hover:text-red-600 p-0.5 cursor-pointer"
                                    title="Delete KML layer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              {/* Dropdown Line Color Selector */}
                              <div className="flex items-center justify-between pt-1">
                                <span className="text-[10px] text-muted-foreground">Line Color:</span>
                                <Select
                                  value={track.color}
                                  onValueChange={(colorVal) => colorVal && handleChangeColor(track.id, colorVal)}
                                >
                                  <SelectTrigger className="h-6 text-[10px] w-28 px-2 border-border shadow-none bg-background">
                                    <div className="flex items-center gap-1.5 truncate">
                                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: track.color }} />
                                      <SelectValue placeholder="Color" />
                                    </div>
                                  </SelectTrigger>
                                  <SelectContent className="shadow-none border-border">
                                    {COLOR_OPTIONS.map((c) => (
                                      <SelectItem key={c.hex} value={c.hex} className="text-[10px]">
                                        <div className="flex items-center gap-2">
                                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.hex }} />
                                          <span>{c.name}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Section: MapCN Spatial Map Component */}
        <div className="lg:col-span-3">
          <GisMapComponent
            projectTracks={projectTracks}
            selectedProjectFilter={selectedProjectFilter}
            focusBounds={focusBounds}
            onColorChange={handleChangeColor}
            onVisibilityToggle={handleToggleVisibility}
            onAddTrack={handleAddTrack}
            onAddMultipleTracks={handleAddMultipleTracks}
            onDeleteTrack={handleDeleteTrack}
          />
        </div>
      </div>
    </div>
  );
}
