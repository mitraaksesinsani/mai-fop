'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  Upload,
  Search,
  Eye,
  EyeOff,
  Globe,
  Sun,
  Moon,
  Compass,
  Layers,
  X,
  Plus,
  PenTool,
  Save,
  Trash2,
  MapPin,
  RotateCcw,
  Download,
  Square,
  Folder
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Setup leaflet default marker icons safely in Next.js client
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

// Map Tile Themes (MapCN style)
const TILE_THEMES = {
  voyager: {
    name: 'Standard Light',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO'
  },
  dark: {
    name: 'Dark Canvas',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO'
  },
  satellite: {
    name: 'Satellite View',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri'
  },
  gee: {
    name: 'Google Earth 3D/Hybrid',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Earth Enterprise (GEE)'
  }
};

export const COLOR_OPTIONS = [
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Emerald Green', hex: '#10b981' },
  { name: 'Amber Yellow', hex: '#f59e0b' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Purple', hex: '#8b5cf6' },
  { name: 'Red', hex: '#ef4444' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Orange', hex: '#f97316' },
];

export const AVAILABLE_PROJECTS = [
  { id: 'PRJ-2026-001', name: 'PRJ-2026-001 (Backbone JKT-BDG)' },
  { id: 'PRJ-2026-002', name: 'PRJ-2026-002 (Metro Ring Surabaya)' },
  { id: 'PRJ-2026-003', name: 'PRJ-2026-003 (FTTx Cluster Medan)' },
  { id: 'UNASSIGNED', name: 'Independent KML (Di Luar Project)' },
];

export interface ProjectKmlTrack {
  id: string;
  projectId: string;
  projectName: string;
  trackName: string;
  color: string;
  visible: boolean;
  coordinates: [number, number][];
  type: 'planning' | 'survey' | 'asBuilt' | 'kml';
  lengthKm: number;
}

// Convert KML aabbggrr color code to standard CSS #rrggbb hex
function parseKmlColor(kmlColorText: string): string | null {
  const clean = kmlColorText.trim().replace('#', '');
  if (clean.length === 8) {
    // KML format is AABBGGRR
    const bb = clean.substring(2, 4);
    const gg = clean.substring(4, 6);
    const rr = clean.substring(6, 8);
    return `#${rr}${gg}${bb}`;
  } else if (clean.length === 6) {
    return `#${clean}`;
  }
  return null;
}

// Parse KML XML document into separate, distinct sub-track layers per Placemark
export function parseKMLDocument(
  xmlText: string,
  targetProjectId: string,
  baseFileName: string
): ProjectKmlTrack[] {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  const tracks: ProjectKmlTrack[] = [];

  // Parse Style ID to CSS Hex Color Map
  const styleMapColors: Record<string, string> = {};
  const styleNodes = xmlDoc.getElementsByTagName('Style');
  for (let i = 0; i < styleNodes.length; i++) {
    const styleEl = styleNodes[i];
    const styleId = styleEl.getAttribute('id');
    if (styleId) {
      const lineStyle = styleEl.getElementsByTagName('LineStyle')[0];
      const colorEl = lineStyle?.getElementsByTagName('color')[0] || styleEl.getElementsByTagName('color')[0];
      if (colorEl && colorEl.textContent) {
        const hex = parseKmlColor(colorEl.textContent);
        if (hex) styleMapColors[styleId] = hex;
      }
    }
  }

  const placemarks = xmlDoc.getElementsByTagName('Placemark');
  const projObj = AVAILABLE_PROJECTS.find(p => p.id === targetProjectId);
  const projName = projObj ? projObj.name : `Project ${targetProjectId}`;

  for (let i = 0; i < placemarks.length; i++) {
    const placemark = placemarks[i];

    // Extract Placemark Name
    const nameEl = placemark.getElementsByTagName('name')[0];
    const trackName = nameEl?.textContent?.trim() || `${baseFileName} (Layer #${i + 1})`;

    // Extract Color from Style or StyleMap reference
    let trackColor: string | null = null;
    const styleUrlEl = placemark.getElementsByTagName('styleUrl')[0];
    if (styleUrlEl && styleUrlEl.textContent) {
      const styleRef = styleUrlEl.textContent.trim().replace('#', '');
      if (styleMapColors[styleRef]) {
        trackColor = styleMapColors[styleRef];
      }
    }

    if (!trackColor) {
      const inlineLineStyle = placemark.getElementsByTagName('LineStyle')[0];
      const inlineColorEl = inlineLineStyle?.getElementsByTagName('color')[0];
      if (inlineColorEl && inlineColorEl.textContent) {
        trackColor = parseKmlColor(inlineColorEl.textContent);
      }
    }

    // Fallback: assign distinct rotating preset colors per sub-layer
    if (!trackColor) {
      trackColor = COLOR_OPTIONS[i % COLOR_OPTIONS.length].hex;
    }

    // Extract Coordinates per Placemark (separated to prevent criss-crossing lines!)
    const extractedCoords: [number, number][] = [];
    const coordNodes = placemark.getElementsByTagName('coordinates');
    for (let j = 0; j < coordNodes.length; j++) {
      const rawText = coordNodes[j].textContent || '';
      const tuples = rawText.trim().split(/\s+/);

      tuples.forEach((tuple) => {
        const parts = tuple.split(',').map(Number);
        if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          // KML format is [Longitude, Latitude] -> Leaflet expects [Latitude, Longitude]
          extractedCoords.push([parts[1], parts[0]]);
        }
      });
    }

    if (extractedCoords.length > 0) {
      const lengthKm = calculateLineDistanceKm(extractedCoords);
      tracks.push({
        id: `kml-${Date.now()}-${i}`,
        projectId: targetProjectId,
        projectName: projName,
        trackName,
        color: trackColor,
        visible: true,
        coordinates: extractedCoords,
        type: 'kml',
        lengthKm: lengthKm || 0.5
      });
    }
  }

  return tracks;
}

// Export valid Google Earth .kml XML file (Full or Filtered per Project)
export function exportToKML(tracks: ProjectKmlTrack[], filename = 'FOPLP_Google_Earth_Export.kml', filterProjectId?: string) {
  const activeTracks = tracks.filter(t => {
    if (!t.coordinates || t.coordinates.length === 0) return false;
    if (filterProjectId && t.projectId !== filterProjectId) return false;
    return true;
  });

  if (activeTracks.length === 0) {
    alert(`No KML tracks available to export ${filterProjectId ? `for project ${filterProjectId}` : ''}.`);
    return;
  }

  const kmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${escapeXml(filename.replace('.kml', ''))}</name>
    <description>Exported from FOPLP GIS Spatial Map Platform</description>`;

  const kmlFooter = `
  </Document>
</kml>`;

  const trackElements = activeTracks
    .map((track) => {
      const coordsFormatted = track.coordinates
        .map(pt => `${pt[1]},${pt[0]},0`)
        .join(' ');

      return `
    <Placemark>
      <name>${escapeXml(track.trackName)} (${escapeXml(track.projectId)})</name>
      <description>Length: ${track.lengthKm} KM | Type: ${track.type}</description>
      <Style>
        <LineStyle>
          <color>ff${track.color.replace('#', '').toLowerCase()}</color>
          <width>4</width>
        </LineStyle>
      </Style>
      <LineString>
        <tessellate>1</tessellate>
        <coordinates>${coordsFormatted}</coordinates>
      </LineString>
    </Placemark>`;
    })
    .join('');

  const kmlContent = kmlHeader + trackElements + kmlFooter;
  const blob = new Blob([kmlContent], { type: 'application/vnd.google-earth.kml+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeXml(unsafe: string) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

// Calculate approximate line distance in KM
function calculateLineDistanceKm(coords: [number, number][]): number {
  if (coords.length < 2) return 0;
  let totalMeters = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const p1 = L.latLng(coords[i][0], coords[i][1]);
    const p2 = L.latLng(coords[i + 1][0], coords[i + 1][1]);
    totalMeters += p1.distanceTo(p2);
  }
  return parseFloat((totalMeters / 1000).toFixed(2));
}

// Component to handle mouse move & click drawing on Leaflet map
function MapEventHandler({
  onMouseMove,
  onZoomChange,
  isDrawing,
  onMapClick
}: {
  onMouseMove: (lat: number, lng: number) => void;
  onZoomChange: (z: number) => void;
  isDrawing: boolean;
  onMapClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    mousemove(e) {
      onMouseMove(e.latlng.lat, e.latlng.lng);
    },
    zoomend(e) {
      onZoomChange(e.target.getZoom());
    },
    click(e) {
      if (isDrawing) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    }
  });
  return null;
}

// Helper component to auto-fit bounds on tracks
function AutoFitBounds({ bounds }: { bounds: L.LatLngBoundsExpression | null }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
}

export default function GisMapComponent({
  projectTracks = [],
  selectedProjectFilter = 'ALL',
  focusBounds = null,
  onColorChange = () => {},
  onVisibilityToggle = () => {},
  onAddTrack = () => {},
  onAddMultipleTracks = () => {},
  onDeleteTrack = () => {}
}: {
  projectTracks?: ProjectKmlTrack[];
  selectedProjectFilter?: string;
  focusBounds?: L.LatLngBoundsExpression | null;
  onColorChange?: (trackId: string, color: string) => void;
  onVisibilityToggle?: (trackId: string) => void;
  onAddTrack?: (track: ProjectKmlTrack) => void;
  onAddMultipleTracks?: (tracks: ProjectKmlTrack[]) => void;
  onDeleteTrack?: (trackId: string) => void;
}) {
  const [mapTheme, setMapTheme] = useState<'voyager' | 'dark' | 'satellite' | 'gee'>('voyager');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: -6.2000, lng: 106.8166 });
  const [zoomLevel, setZoomLevel] = useState<number>(8);
  const [fitBoundsTrigger, setFitBoundsTrigger] = useState<L.LatLngBoundsExpression | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedLocation, setSearchedLocation] = useState<[number, number] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to parse coordinate string (e.g. "-6.2000, 106.8166" or "-6.2000 106.8166")
  const handleExecuteSearch = (queryStr: string) => {
    if (!queryStr.trim()) return;
    const parts = queryStr.trim().split(/[\s,]+/);
    if (parts.length === 2) {
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      if (!isNaN(lat) && !isNaN(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
        setSearchedLocation([lat, lng]);
        setFitBoundsTrigger([[lat - 0.005, lng - 0.005], [lat + 0.005, lng + 0.005]]);
        return;
      }
    }

    // Search matching KML track by name
    const matchedTrack = safeTracks.find(t =>
      t.trackName.toLowerCase().includes(queryStr.toLowerCase()) ||
      t.projectName.toLowerCase().includes(queryStr.toLowerCase())
    );
    if (matchedTrack && matchedTrack.coordinates && matchedTrack.coordinates.length > 0) {
      if (matchedTrack.coordinates.length === 1) {
        const pt = matchedTrack.coordinates[0];
        setFitBoundsTrigger([[pt[0] - 0.005, pt[1] - 0.005], [pt[0] + 0.005, pt[1] + 0.005]]);
      } else {
        setFitBoundsTrigger(L.latLngBounds(matchedTrack.coordinates));
      }
    }
  };

  // In-App Google Earth KML Route Drawing State
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [targetProjectId, setTargetProjectId] = useState<string>('PRJ-2026-001');
  const [draftPoints, setDraftPoints] = useState<[number, number][]>([]);
  const [newTrackName, setNewTrackName] = useState('');

  // Safe Array fallback
  const safeTracks = Array.isArray(projectTracks) ? projectTracks : [];

  // Filter visible tracks based on selected project
  const filteredTracks = safeTracks.filter(track => {
    if (!track.visible) return false;
    if (selectedProjectFilter === 'ALL') return true;
    return track.projectId === selectedProjectFilter;
  });

  // Handle external focus bounds when clicking KML layer item in sidebar
  useEffect(() => {
    if (focusBounds) {
      setFitBoundsTrigger(focusBounds);
    }
  }, [focusBounds]);

  // Handle point clicks when drawing KML route directly in-app
  const handleMapClickDraw = (lat: number, lng: number) => {
    setDraftPoints(prev => [...prev, [lat, lng]]);
  };

  // Undo last drawn point vertex
  const handleUndoLastPoint = () => {
    setDraftPoints(prev => prev.slice(0, -1));
  };

  // Save drawn route as new KML Track with project selection
  const handleFinishDrawing = () => {
    if (draftPoints.length < 1) {
      alert('Please click at least 1 point on the map to place a KML node or line.');
      return;
    }

    const randomColor = COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)].hex;
    const computedDist = calculateLineDistanceKm(draftPoints);

    const projObj = AVAILABLE_PROJECTS.find(p => p.id === targetProjectId);
    const projName = projObj ? projObj.name : `Project ${targetProjectId}`;

    const newTrack: ProjectKmlTrack = {
      id: `drawn-${Date.now()}`,
      projectId: targetProjectId,
      projectName: projName,
      trackName: newTrackName.trim() || `Drawn KML Path #${safeTracks.length + 1}`,
      color: randomColor,
      visible: true,
      coordinates: draftPoints,
      type: 'kml',
      lengthKm: computedDist || 0.5
    };

    onAddTrack(newTrack);
    setDraftPoints([]);
    setIsDrawingMode(false);
    setNewTrackName('');
  };

  // Handle Google Earth KML File Upload with multi-placemark parsing & distinct colors
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      try {
        const baseFileName = file.name.replace(/\.[^/.]+$/, '');
        const newTracks = parseKMLDocument(text, targetProjectId, baseFileName);

        if (newTracks.length > 0) {
          // Explicitly keep map in View Mode after upload
          setIsDrawingMode(false);
          setDraftPoints([]);

          if (onAddMultipleTracks) {
            onAddMultipleTracks(newTracks);
          } else {
            newTracks.forEach(t => onAddTrack(t));
          }

          const allCoords: [number, number][] = [];
          newTracks.forEach(t => t.coordinates.forEach(pt => allCoords.push(pt)));
          if (allCoords.length > 0) {
            setFitBoundsTrigger(L.latLngBounds(allCoords));
          }
        } else {
          alert('No valid Placemark coordinates found in the uploaded KML file.');
        }
      } catch (err) {
        console.error('KML Parse Error:', err);
        alert('Failed to parse KML file. Please ensure it is a valid Google Earth XML file.');
      }
    };
    reader.readAsText(file);
  };

  const draftDistanceKm = calculateLineDistanceKm(draftPoints);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-[650px] bg-muted/20 border border-border rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground text-xs font-mono">
        <span>Initializing GIS Spatial Map Engine...</span>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-[650px] overflow-hidden rounded-xl border border-border bg-slate-950 font-sans shadow-none ring-0 ${isDrawingMode ? 'cursor-crosshair' : ''}`}>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".kml,.xml"
        className="hidden"
      />

      {/* Leaflet Map */}
      <MapContainer
        center={[-6.8000, 107.0000]}
        zoom={zoomLevel}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        zoomControl={false}
      >
        <TileLayer key={mapTheme} url={TILE_THEMES[mapTheme].url} attribution={TILE_THEMES[mapTheme].attribution} />

        <MapEventHandler
          onMouseMove={(lat, lng) => setCoords({ lat, lng })}
          onZoomChange={(z) => setZoomLevel(z)}
          isDrawing={isDrawingMode}
          onMapClick={handleMapClickDraw}
        />

        {fitBoundsTrigger && <AutoFitBounds bounds={fitBoundsTrigger} />}

        {/* Render Active Project Lines & Tracks with Coordinate Guard */}
        {filteredTracks.map((track) => {
          const validCoords = (track.coordinates || []).filter(
            (pt) => Array.isArray(pt) && pt.length >= 2 && typeof pt[0] === 'number' && !isNaN(pt[0]) && isFinite(pt[0]) && typeof pt[1] === 'number' && !isNaN(pt[1]) && isFinite(pt[1])
          );

          if (validCoords.length === 0) return null;

          const startNode = validCoords[0];
          const endNode = validCoords[validCoords.length - 1];

          return (
            <React.Fragment key={track.id}>
              {validCoords.length > 1 && (
                <Polyline
                  positions={validCoords}
                  color={track.color || '#3b82f6'}
                  weight={4}
                  opacity={0.85}
                >
                  <Popup>
                    <div className="text-xs font-bold" style={{ color: track.color }}>
                      {track.projectName}
                    </div>
                    <div className="text-[11px] font-semibold text-slate-800">{track.trackName}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 mb-2">Length: {track.lengthKm} KM</div>
                    <button
                      onClick={() => onDeleteTrack(track.id)}
                      className="w-full text-[10px] bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 py-1 px-2 rounded font-medium cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                      <span>Delete KML Layer</span>
                    </button>
                  </Popup>
                </Polyline>
              )}

              {/* Render End Node Markers safely */}
              {startNode && (
                <Marker position={startNode}>
                  <Popup>
                    <div className="text-xs font-bold text-slate-900">Start Node — {track.trackName}</div>
                    <div className="text-[11px] text-slate-600">{track.projectName}</div>
                  </Popup>
                </Marker>
              )}

              {endNode && validCoords.length > 1 && (
                <Marker position={endNode}>
                  <Popup>
                    <div className="text-xs font-bold text-slate-900">End Node — {track.trackName}</div>
                    <div className="text-[11px] text-slate-600">{track.projectName}</div>
                  </Popup>
                </Marker>
              )}
            </React.Fragment>
          );
        })}

        {/* Render Active In-App Draft Line while drawing (Optimized Start/End Only) */}
        {draftPoints.length > 0 && (
          <>
            {draftPoints.length > 1 && (
              <Polyline positions={draftPoints} color="#ec4899" weight={4} opacity={0.9} dashArray="8, 8" />
            )}
            {/* Start point tag */}
            <Marker position={draftPoints[0]}>
              <Popup>
                <div className="text-xs font-bold text-pink-600">Draft Route — Start Point</div>
              </Popup>
            </Marker>

            {/* Current endpoint tag */}
            {draftPoints.length > 1 && (
              <Marker position={draftPoints[draftPoints.length - 1]}>
                <Popup>
                  <div className="text-xs font-bold text-pink-600">Draft Route — Point #{draftPoints.length}</div>
                </Popup>
              </Marker>
            )}
          </>
        )}
        {/* Render Searched Location Pin Target */}
        {searchedLocation && (
          <Marker position={searchedLocation}>
            <Popup>
              <div className="text-xs font-bold text-primary flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                Target Search Coordinates
              </div>
              <div className="font-mono text-[11px] text-slate-700 mt-1">
                Lat: {searchedLocation[0].toFixed(6)}, Lng: {searchedLocation[1].toFixed(6)}
              </div>
              <button
                onClick={() => setSearchedLocation(null)}
                className="mt-2 text-[10px] text-muted-foreground hover:text-red-500 underline cursor-pointer"
              >
                Clear Pin
              </button>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* MapCN Floating Top Header Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left Coordinate / Track Search Bar */}
        <div className="flex items-center gap-2 pointer-events-auto bg-background/95 backdrop-blur-md border border-border p-1.5 rounded-lg shadow-none">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-2.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleExecuteSearch(searchQuery);
                }
              }}
              placeholder="Search Lat, Lng (e.g. -6.200, 106.816)..."
              className="h-8 text-xs pl-8 w-52 sm:w-72 border-0 bg-transparent focus-visible:ring-0"
            />
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleExecuteSearch(searchQuery)}
            className="h-7 text-xs px-2 cursor-pointer font-semibold text-primary hover:bg-primary/10"
          >
            Go
          </Button>
          <Badge
            variant={selectedProjectFilter === 'ALL' ? 'default' : 'outline'}
            className="text-[10px] font-mono border-border uppercase"
          >
            {selectedProjectFilter === 'ALL' ? 'Global Multi-Trace (All)' : selectedProjectFilter}
          </Badge>
        </div>

        {/* Right Tools: Interactive Draw Route, Upload KML, Export KML */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-background/95 backdrop-blur-md border border-border p-1 rounded-lg shadow-none">
          <Button
            size="sm"
            variant={isDrawingMode ? 'destructive' : 'default'}
            onClick={() => {
              if (isDrawingMode) {
                setIsDrawingMode(false);
                setDraftPoints([]);
              } else {
                setIsDrawingMode(true);
              }
            }}
            className="h-7 text-xs gap-1.5 font-medium shadow-none cursor-pointer"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>{isDrawingMode ? 'Cancel Draw' : 'Google Earth Draw Tool'}</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="h-7 text-xs gap-1.5 font-medium hover:bg-muted border-border shadow-none cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-primary" />
            <span>Upload KML</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => exportToKML(safeTracks)}
            className="h-7 text-xs gap-1.5 font-medium hover:bg-muted border-border shadow-none cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export .KML</span>
          </Button>

          <div className="h-4 w-px bg-border mx-0.5" />

          <Button
            size="sm"
            variant={mapTheme === 'voyager' ? 'secondary' : 'ghost'}
            onClick={() => setMapTheme('voyager')}
            className="h-7 text-[11px] px-2 cursor-pointer"
          >
            <Sun className="w-3 h-3 mr-1" /> Light
          </Button>
          <Button
            size="sm"
            variant={mapTheme === 'dark' ? 'secondary' : 'ghost'}
            onClick={() => setMapTheme('dark')}
            className="h-7 text-[11px] px-2 cursor-pointer"
          >
            <Moon className="w-3 h-3 mr-1" /> Dark
          </Button>
          <Button
            size="sm"
            variant={mapTheme === 'satellite' ? 'secondary' : 'ghost'}
            onClick={() => setMapTheme('satellite')}
            className="h-7 text-[11px] px-2 cursor-pointer"
          >
            <Globe className="w-3 h-3 mr-1" /> Satellite
          </Button>
          <Button
            size="sm"
            variant={mapTheme === 'gee' ? 'secondary' : 'ghost'}
            onClick={() => setMapTheme('gee')}
            className="h-7 text-[11px] px-2 cursor-pointer text-amber-500 font-semibold"
          >
            <Globe className="w-3 h-3 mr-1 text-amber-500" /> Google Earth 3D
          </Button>
        </div>
      </div>

      {/* Floating Banner with Target Project Selector when In-App Drawing is Active */}
      {isDrawingMode && (
        <div className="absolute top-16 left-3 right-3 z-10 bg-primary text-primary-foreground p-3 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs shadow-none border border-primary-foreground/20">
          <div className="flex items-center gap-3">
            <PenTool className="w-4 h-4 animate-pulse" />
            <div>
              <span className="font-semibold text-xs">Google Earth Path Drawer Active:</span>
              <p className="text-[11px] opacity-90">
                Click points on map. {draftPoints.length} vertices placed ({draftDistanceKm} KM total).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Target Project Selector for Drawn KML */}
            <Select value={targetProjectId} onValueChange={(val) => val && setTargetProjectId(val)}>
              <SelectTrigger className="h-7 text-xs bg-white text-slate-900 w-52 border-0 shadow-none">
                <SelectValue placeholder="Assign to Project" />
              </SelectTrigger>
              <SelectContent className="shadow-none border-border">
                {AVAILABLE_PROJECTS.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-xs">
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              value={newTrackName}
              onChange={(e) => setNewTrackName(e.target.value)}
              placeholder="Track Name (e.g. Survey Path V0.3)"
              className="h-7 text-xs bg-white text-slate-900 w-48 border-0"
            />

            {draftPoints.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleUndoLastPoint}
                className="h-7 text-xs gap-1 bg-white/10 text-white hover:bg-white/20 border-white/20 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Undo Point</span>
              </Button>
            )}

            <Button
              size="sm"
              variant="secondary"
              onClick={handleFinishDrawing}
              disabled={draftPoints.length < 1}
              className="h-7 text-xs gap-1 font-semibold cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-emerald-600" />
              <span>Save &amp; Create KML</span>
            </Button>
          </div>
        </div>
      )}

      {/* MapCN Bottom Coordinate & Status Footer Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-background/95 border-t border-border px-3 py-1.5 flex items-center justify-between text-[11px] font-mono text-muted-foreground shadow-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Compass className="w-3 h-3 text-primary" />
            Lat: {coords.lat.toFixed(5)}, Lng: {coords.lng.toFixed(5)}
          </span>
          <span>|</span>
          <span>Zoom: {zoomLevel}x</span>
          <span>|</span>
          <span>Active KML Tracks: {filteredTracks.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-600 bg-emerald-500/10">
            Google Earth KML Engine Active
          </Badge>
        </div>
      </div>
    </div>
  );
}
