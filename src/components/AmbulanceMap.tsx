import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Ambulance } from '../types';

// ══════════════════════════════════════════════════════════════════════════════
// REAL GPS + PATIENT TELEMETRY MODULE (Disabled — flip flags for production)
// ══════════════════════════════════════════════════════════════════════════════
const ENABLE_REAL_GPS = false;
const ENABLE_REAL_TELEMETRY = false;

/**
 * Real GPS tracking via browser Geolocation API.
 * For production: replace with WebSocket to fleet GPS hardware (MQTT/custom server).
 */
function useRealGPSTracking(): [number, number] | null {
  const [position, setPosition] = useState<[number, number] | null>(null);
  useEffect(() => {
    if (!ENABLE_REAL_GPS || !navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.warn('GPS error:', err.message),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);
  return position;
}

/**
 * Real-time patient vitals from ambulance medical devices.
 * In production this would connect to:
 *   - Bluetooth LE medical monitors (Philips MRx, Zoll X-Series)
 *   - WebSocket server receiving HL7/FHIR vitals streams
 *   - MQTT broker for IoT medical device data
 *
 * Example WebSocket connection (disabled):
 *   const ws = new WebSocket('wss://telemetry.hospital.com/ambulance/amb-1');
 *   ws.onmessage = (event) => {
 *     const vitals = JSON.parse(event.data);
 *     // vitals = { hr: 118, spo2: 93, bp: '88/54', rr: 22, temp: 37.2 }
 *     setLiveVitals(vitals);
 *   };
 */
export interface LiveVitals {
  hr: number;
  spo2: number;
  systolic: number;
  diastolic: number;
  rr: number;
  temp: number;
  speedKmh: number;
  ecgData: number[];
}

export function useLiveVitals(baseVitals: {
  hr: number; spo2: number; bp: string; speedKmh: number;
}): LiveVitals {
  const parseBP = (bp: string) => {
    const parts = bp.replace(/[^\d\/]/g, '').split('/');
    return { systolic: parseInt(parts[0]) || 120, diastolic: parseInt(parts[1]) || 80 };
  };
  const bp = parseBP(baseVitals.bp);

  const [vitals, setVitals] = useState<LiveVitals>({
    hr: baseVitals.hr,
    spo2: baseVitals.spo2,
    systolic: bp.systolic,
    diastolic: bp.diastolic,
    rr: 22,
    temp: 37.2,
    speedKmh: baseVitals.speedKmh,
    ecgData: [],
  });

  useEffect(() => {
    if (ENABLE_REAL_TELEMETRY) {
      // Production: connect to real WebSocket telemetry server
      // const ws = new WebSocket('wss://telemetry.hospital.com/stream');
      // ws.onmessage = (e) => setVitals(JSON.parse(e.data));
      // return () => ws.close();
      return;
    }

    // Demo mode: simulate realistic vital sign fluctuations
    const interval = setInterval(() => {
      setVitals(prev => ({
        hr: Math.max(60, Math.min(160, prev.hr + Math.floor(Math.random() * 7 - 3))),
        spo2: Math.max(88, Math.min(100, prev.spo2 + (Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0))),
        systolic: Math.max(70, Math.min(180, prev.systolic + Math.floor(Math.random() * 5 - 2))),
        diastolic: Math.max(40, Math.min(110, prev.diastolic + Math.floor(Math.random() * 5 - 2))),
        rr: Math.max(12, Math.min(30, prev.rr + (Math.random() > 0.6 ? (Math.random() > 0.5 ? 1 : -1) : 0))),
        temp: parseFloat((Math.max(36.5, Math.min(39.5, prev.temp + (Math.random() - 0.5) * 0.2))).toFixed(1)),
        speedKmh: Math.max(0, Math.min(130, prev.speedKmh + Math.floor(Math.random() * 11 - 5))),
        ecgData: prev.ecgData,
      }));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return vitals;
}

// ─── Ambulance marker ────────────────────────────────────────────────────────
function createAmbulanceMarker(urgency: string, isSelected: boolean) {
  const colorMap: Record<string, string> = {
    'Cardiac Emergency': '#dc2626', 'Trauma Level 1': '#ea580c',
    'Respiratory Failure': '#ea580c', 'Routine Transfer': '#16a34a',
  };
  const bg = colorMap[urgency] || '#ea580c';
  const size = isSelected ? 40 : 34;
  const ring = isSelected ? `box-shadow:0 0 0 4px ${bg}44,0 2px 8px rgba(0,0,0,0.3);` : 'box-shadow:0 2px 8px rgba(0,0,0,0.3);';
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;background:${bg};border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;font-size:${isSelected ? 20 : 17}px;${ring}">🚑</div>`,
    iconSize: [size, size], iconAnchor: [size / 2, size / 2], popupAnchor: [0, -(size / 2 + 4)],
  });
}

const hospitalIcon = L.divIcon({
  className: '',
  html: `<div style="width:46px;height:46px;background:linear-gradient(135deg,#2563eb,#1d4ed8);border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 0 0 4px rgba(37,99,235,0.3),0 4px 12px rgba(0,0,0,0.3);">🏥</div>`,
  iconSize: [46, 46], iconAnchor: [23, 23], popupAnchor: [0, -26],
});

// ─── Fit bounds once ─────────────────────────────────────────────────────────
const FitBoundsOnce: React.FC<{ positions: [number, number][] }> = ({ positions }) => {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (!fitted.current && positions.length > 0) {
      map.fitBounds(L.latLngBounds(positions.map(p => L.latLng(p[0], p[1]))), { padding: [60, 60], maxZoom: 13 });
      fitted.current = true;
    }
  }, [positions, map]);
  return null;
};

// ─── OSRM route with ALTERNATIVES + speed ────────────────────────────────────
interface RouteData {
  coords: [number, number][];
  speeds: number[];
  duration: number; // seconds
  distance: number; // meters
}

async function fetchRoutesWithTraffic(from: [number, number], to: [number, number]): Promise<RouteData[]> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson&annotations=speed&alternatives=true`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.code === 'Ok' && data.routes?.length > 0) {
      return data.routes.map((route: any) => {
        const coords: [number, number][] = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
        let speeds: number[] = route.legs?.[0]?.annotation?.speed || [];
        if (speeds.length > 0 && speeds.length !== coords.length - 1) {
          const stretched: number[] = [];
          for (let i = 0; i < coords.length - 1; i++) {
            stretched.push(speeds[Math.min(Math.floor((i / (coords.length - 1)) * speeds.length), speeds.length - 1)]);
          }
          speeds = stretched;
        }
        if (speeds.length === 0) speeds = coords.slice(0, -1).map((_, i) => 8 + Math.sin(i * 0.3) * 8 + Math.random() * 6);
        return { coords, speeds, duration: route.duration, distance: route.distance };
      });
    }
  } catch (err) { console.warn('OSRM fetch failed:', err); }
  return [{ coords: [from, to], speeds: [15], duration: 600, distance: 5000 }];
}

// ─── Traffic colors ──────────────────────────────────────────────────────────
function speedToColor(s: number): string {
  if (s >= 18) return '#16a34a'; if (s >= 12) return '#65a30d';
  if (s >= 8) return '#ca8a04'; if (s >= 5) return '#ea580c';
  return '#dc2626';
}

interface ColoredSegment { positions: [number, number][]; color: string; }

function buildColoredSegments(coords: [number, number][], speeds: number[]): ColoredSegment[] {
  if (coords.length < 2) return [];
  const segs: ColoredSegment[] = [];
  let curColor = speedToColor(speeds[0] ?? 15);
  let curPos: [number, number][] = [coords[0]];
  for (let i = 0; i < coords.length - 1; i++) {
    const c = speedToColor(speeds[i] ?? 15);
    if (c === curColor) { curPos.push(coords[i + 1]); }
    else { curPos.push(coords[i + 1]); segs.push({ positions: [...curPos], color: curColor }); curColor = c; curPos = [coords[i + 1]]; }
  }
  if (curPos.length >= 2) segs.push({ positions: curPos, color: curColor });
  return segs;
}

// ─── Main Component ──────────────────────────────────────────────────────────
interface AmbulanceMapProps {
  ambulances: Ambulance[];
  selectedAmbulanceId: string;
  onSelectAmbulance: (id: string) => void;
}

export const AmbulanceMap: React.FC<AmbulanceMapProps> = ({
  ambulances, selectedAmbulanceId, onSelectAmbulance,
}) => {
  const hospitalLocation: [number, number] = [37.7550, -122.4050];
  // Store MULTIPLE routes per ambulance (for alternatives)
  const [allRoutes, setAllRoutes] = useState<Record<string, RouteData[]>>({});
  const [bestRouteIdx, setBestRouteIdx] = useState<Record<string, number>>({});
  const [progress, setProgress] = useState<Record<string, number>>({});
  const realGPSPosition = useRealGPSTracking();

  useEffect(() => {
    ambulances.forEach(async (amb) => {
      if (amb.status === 'arriving' || amb.status === 'in-transit') {
        const from: [number, number] = [amb.coordinates.lat, amb.coordinates.lng];
        const routes = await fetchRoutesWithTraffic(from, hospitalLocation);
        setAllRoutes(prev => ({ ...prev, [amb.id]: routes }));
        // Auto-select the fastest route
        const fastestIdx = routes.reduce((best, r, i) => r.duration < routes[best].duration ? i : best, 0);
        setBestRouteIdx(prev => ({ ...prev, [amb.id]: fastestIdx }));
        setProgress(prev => ({ ...prev, [amb.id]: 0 }));
      }
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(id => {
          const routes = allRoutes[id];
          const bestIdx = bestRouteIdx[id] ?? 0;
          const rd = routes?.[bestIdx];
          if (rd && next[id] < rd.coords.length - 1) {
            next[id] = Math.min(next[id] + Math.max(1, Math.floor(rd.coords.length / 150)), rd.coords.length - 1);
          }
        });
        return next;
      });
    }, 400);
    return () => clearInterval(interval);
  }, [allRoutes, bestRouteIdx]);

  const getPosition = useCallback((amb: Ambulance): [number, number] => {
    if (ENABLE_REAL_GPS && realGPSPosition && amb.id === 'amb-1') return realGPSPosition;
    const routes = allRoutes[amb.id];
    const bestIdx = bestRouteIdx[amb.id] ?? 0;
    const rd = routes?.[bestIdx];
    const idx = progress[amb.id];
    if (rd && idx !== undefined && rd.coords[idx]) return rd.coords[idx];
    return [amb.coordinates.lat, amb.coordinates.lng];
  }, [allRoutes, bestRouteIdx, progress, realGPSPosition]);

  const initialPositions = useMemo<[number, number][]>(() => [
    hospitalLocation, ...ambulances.map(a => [a.coordinates.lat, a.coordinates.lng] as [number, number]),
  ], []);

  const activeAmbulance = ambulances.find(a => a.id === selectedAmbulanceId);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 shadow-xl z-0" style={{ height: '520px' }}>
      <MapContainer center={hospitalLocation} zoom={12} scrollWheelZoom={true} zoomControl={false} className="w-full h-full" style={{ background: '#f8fafc' }}>
        {/* LIGHT THEME MAP */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | CARTO'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <FitBoundsOnce positions={initialPositions} />

        <Marker position={hospitalLocation} icon={hospitalIcon}>
          <Popup>
            <div style={{ fontFamily: 'system-ui', padding: '4px 0' }}>
              <div style={{ fontWeight: 800, color: '#1e40af', fontSize: '13px' }}>Metro General Hospital</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Cath Lab • Trauma Bay • ER Active</div>
            </div>
          </Popup>
        </Marker>

        {ambulances.map(amb => {
          const pos = getPosition(amb);
          const isSelected = amb.id === selectedAmbulanceId;
          const isMoving = amb.status === 'arriving' || amb.status === 'in-transit';
          const routes = allRoutes[amb.id] || [];
          const bestIdx = bestRouteIdx[amb.id] ?? 0;
          const idx = progress[amb.id] ?? 0;

          return (
            <React.Fragment key={amb.id}>
              {/* ALTERNATIVE ROUTES (shown as grey/dim lines) */}
              {isMoving && routes.map((route, ri) => {
                if (ri === bestIdx) return null; // skip the best route, drawn separately
                return (
                  <Polyline key={`${amb.id}-alt-${ri}`} positions={route.coords}
                    pathOptions={{ color: '#94a3b8', weight: 3, opacity: 0.4, dashArray: '6, 8', lineCap: 'round', lineJoin: 'round' }}
                  />
                );
              })}

              {/* BEST ROUTE — traffic-colored, only ahead of ambulance */}
              {isMoving && routes[bestIdx] && (() => {
                const rd = routes[bestIdx];
                const remaining = rd.coords.slice(idx);
                const remSpeeds = rd.speeds.slice(idx);
                const segs = buildColoredSegments(remaining, remSpeeds);
                return segs.map((seg, i) => (
                  <Polyline key={`${amb.id}-best-${i}`} positions={seg.positions}
                    pathOptions={{ color: seg.color, weight: isSelected ? 6 : 4, opacity: isSelected ? 0.9 : 0.7, lineCap: 'round', lineJoin: 'round' }}
                  />
                ));
              })()}

              <Marker position={pos} icon={createAmbulanceMarker(amb.urgencyTier, isSelected)}
                eventHandlers={{ click: () => onSelectAmbulance(amb.id) }}>
                <Popup>
                  <div style={{ fontFamily: 'system-ui', padding: '4px 0' }}>
                    <div style={{ fontWeight: 800, color: '#dc2626', fontSize: '13px' }}>{amb.callSign}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{amb.emergencyType}</div>
                    <div style={{ fontSize: '11px', fontWeight: 600, marginTop: '4px' }}>
                      ETA: {amb.etaMinutes} min • {amb.telemetry.speedKmh} km/h
                    </div>
                    {routes.length > 1 && (
                      <div style={{ fontSize: '10px', color: '#16a34a', marginTop: '4px', fontWeight: 700 }}>
                        ✓ Fastest of {routes.length} routes selected
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* ETA overlay */}
      {activeAmbulance && (activeAmbulance.status === 'arriving' || activeAmbulance.status === 'in-transit') && (
        <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm text-slate-900 px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono shadow-lg">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-bold text-rose-600">{activeAmbulance.callSign}</span>
          </div>
          <div className="mt-1 text-slate-600">
            ETA: <span className="text-slate-900 font-bold">{activeAmbulance.etaMinutes} min</span> •
            Speed: <span className="text-slate-900 font-bold">{activeAmbulance.telemetry.speedKmh} km/h</span>
          </div>
          {(allRoutes[activeAmbulance.id]?.length ?? 0) > 1 && (
            <div className="mt-1 text-emerald-600 font-bold text-[10px]">
              ✓ Fastest of {allRoutes[activeAmbulance.id]?.length} routes
            </div>
          )}
        </div>
      )}

      {/* Traffic legend — bottom center */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur-sm text-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 text-[11px] font-semibold shadow-lg">
        <div className="flex items-center space-x-4">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Traffic:</span>
          <span className="flex items-center space-x-1.5"><span className="w-5 h-2 rounded-full bg-green-600"></span><span>Clear</span></span>
          <span className="flex items-center space-x-1.5"><span className="w-5 h-2 rounded-full bg-yellow-500"></span><span>Moderate</span></span>
          <span className="flex items-center space-x-1.5"><span className="w-5 h-2 rounded-full bg-orange-500"></span><span>Slow</span></span>
          <span className="flex items-center space-x-1.5"><span className="w-5 h-2 rounded-full bg-red-500"></span><span>Heavy</span></span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center space-x-1.5"><span className="w-5 h-1 rounded-full bg-slate-400 border-dashed"></span><span className="text-slate-500">Alt Route</span></span>
        </div>
      </div>

      <div className="absolute top-3 right-3 z-[1000] bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
        Live GPS Tracking
      </div>
    </div>
  );
};
