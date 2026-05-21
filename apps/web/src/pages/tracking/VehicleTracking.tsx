import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import trackingService from '../../services/trackingService';
import vehicleService from '../../services/vehicleService';
import type { GPSTrack, Vehicle } from '@med/shared-types';
import { Loading } from '@med/ui-components';
import cn from 'clsx';
import dayjs from 'dayjs';

interface VehicleWithLast extends Vehicle {
  lastTrack?: GPSTrack;
  statusText: string;
}

const ZONE_COLOR: Record<string, string> = {
  ambient: '#6b7280', cool: '#3b82f6', cold: '#4f46e5', frozen: '#0891b2',
};

const DASHBOARD_REFRESH = 10000;

const VehicleTracking: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const polylineRef = useRef<any>(null);

  const { data: vehicles = [], isLoading: vLoading } = useQuery({
    queryKey: ['vehicles', 'tracking-list'],
    queryFn: () => vehicleService.getList({ pageSize: 100 }),
    select: (d) => d.items || [],
  });

  const { data: trackData = [] } = useQuery({
    queryKey: ['tracking', 'latest', selectedId],
    queryFn: async () => {
      if (!selectedId) return [];
      const last = await trackingService.getLatest(selectedId);
      return last ? [last] : [];
    },
    enabled: !!selectedId,
    refetchInterval: 5000,
  });

  const selectedVehicle = (vehicles as VehicleWithLast[]).find((v) => v._id === selectedId);

  // ---- AMap Loader ----
  useEffect(() => {
    if (mapLoaded || !window.AMap) {
      loadAMap();
    }
    return () => {
      if (mapInstance.current) {
        mapInstance.current.destroy();
        mapInstance.current = null;
      }
    };
  }, []);

  const loadAMap = () => {
    if (window.AMap) {
      initMap();
      return;
    }
    const script = document.createElement('script');
    script.src = `https://webapi.amap.com/maps?v=2.0&key=YOUR_AMAP_KEY&plugin=AMap.MoveAnimation,AMap.Polyline,AMap.Marker,AMap.InfoWindow`;
    script.onload = () => initMap();
    document.head.appendChild(script);
  };

  const initMap = () => {
    if (!mapRef.current || mapInstance.current) return;
    const AMap = window.AMap;
    const map = new AMap.Map(mapRef.current, {
      zoom: 11,
      center: [121.4737, 31.2304],
      viewMode: '2D',
    });
    mapInstance.current = map;
    setMapLoaded(true);
  };

  // Draw/update selected vehicle marker + polyline
  useEffect(() => {
    if (!mapInstance.current || !selectedVehicle || !selectedVehicle.lastTrack) return;
    const AMap = window.AMap;
    const loc = selectedVehicle.lastTrack.location;
    const pos: [number, number] = [loc.coordinates[0], loc.coordinates[1]];

    // Marker
    if (markersRef.current[selectedId!]) {
      markersRef.current[selectedId!].setPosition(pos);
    } else {
      const marker = new AMap.Marker({
        position: pos,
        title: selectedVehicle.plateNumber,
        icon: new AMap.Icon({
          size: new AMap.Size(32, 32),
          image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png',
          imageSize: new AMap.Size(32, 32),
        }),
      });
      mapInstance.current.add(marker);
      markersRef.current[selectedId!] = marker;
    }

    mapInstance.current.setCenter(pos);

    // Draw polyline from track history (mock or real)
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }
    const line = new AMap.Polyline({
      path: [pos], // simplified: just current point
      strokeColor: ZONE_COLOR[selectedVehicle.temperatureZones?.[0] || 'ambient'] || '#3b82f6',
      strokeWeight: 4,
      strokeOpacity: 0.7,
    });
    mapInstance.current.add(line);
    polylineRef.current = line;
  }, [selectedId, selectedVehicle?.lastTrack]);

  const getCompass = (heading: number): string => {
    const dirs = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
    return dirs[Math.round(heading / 45) % 8];
  };

  return (
    <div className="page-container h-[calc(100vh-64px)] flex flex-col">
      <div className="page-header">
        <h1 className="page-title">车辆追踪</h1>
        <span className={cn('w-2 h-2 rounded-full inline-block mr-1', mapLoaded ? 'bg-green-500' : 'bg-gray-300')} />
        <span className="text-xs text-gray-500">{mapLoaded ? '地图就绪' : '地图加载中...'}</span>
      </div>

      <div className="flex flex-1 gap-4 min-h-0">
        {/* Sidebar */}
        <div className="w-72 shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <input placeholder="搜索车牌..." className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm" />
          </div>
          <div className="flex-1 overflow-y-auto">
            {vLoading && <Loading text="加载车辆..." />}
            {(vehicles as VehicleWithLast[]).map((v) => (
              <div
                key={v._id}
                onClick={() => setSelectedId(v._id)}
                className={cn(
                  'p-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors',
                  selectedId === v._id && 'bg-primary-50 border-r-2 border-r-primary-500',
                )}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-mono text-sm font-medium">{v.plateNumber}</span>
                  <span
                    className={cn(
                      'inline-block w-1.5 h-1.5 rounded-full',
                      v.status === 'idle' ? 'bg-green-400' : v.status === 'dispatched' || v.status === 'in_transit' ? 'bg-blue-400' : 'bg-gray-300',
                    )}
                  />
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <span>{(v.type as string)?.replace('_', ' ')}</span>
                  {v.lastTrack && <span>· {dayjs(v.lastTrack.timestamp).fromNow()}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map + Detail */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div ref={mapRef} className="flex-1 min-h-[300px] rounded-xl shadow-sm border border-gray-100 bg-gray-50" />

          {/* Detail panel */}
          {selectedVehicle && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 grid grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-xs text-gray-500">车牌号</div>
                <div className="font-mono font-medium">{selectedVehicle.plateNumber}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">状态</div>
                <div className="font-medium">{selectedVehicle.status}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">速度</div>
                <div className="font-medium">
                  {selectedVehicle.lastTrack?.speed?.toFixed(1) || '--'} km/h
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">航向</div>
                <div className="font-medium">
                  {selectedVehicle.lastTrack?.heading != null
                    ? getCompass(selectedVehicle.lastTrack.heading)
                    : '--'}
                </div>
              </div>
              {selectedVehicle.lastTrack?.location && (
                <div className="col-span-4">
                  <div className="text-xs text-gray-500">最新位置</div>
                  <div className="font-mono text-xs">
                    {selectedVehicle.lastTrack.location.coordinates[1].toFixed(4)}, {' '}
                    {selectedVehicle.lastTrack.location.coordinates[0].toFixed(4)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleTracking;

// ---- AMap global type declaration ----
declare global {
  interface Window {
    AMap: any;
  }
}
export {};
