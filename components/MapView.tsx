// components/MapDisplay.tsx
'use client';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { ExternalLink } from "lucide-react";
import { useEffect } from "react";

// Map Component to auto-fit markers
function FitBounds({ markers }: { markers: any[] }) {
    const map = useMap();

    useEffect(() => {
        if (markers.length > 0) {
            const bounds = L.latLngBounds(markers.map(m => [m.location.lat, m.location.lng]));
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
    }, [markers, map]);

    return null;
}

// Map Event Handler to capture clicks for placement
function MapEvents({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click: (e) => {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

// Giữ lại logic icon của bạn ở đây hoặc tách ra file hằng số
const createCustomIcon = (type: 'idea' | 'team' | 'product') => {
    const colorMap = {
        idea: {
            bg: 'bg-amber-500',
            bgSoft: 'bg-amber-500/20',
            border: 'border-amber-500',
            glow: 'rgba(245, 158, 11, 0.2)'
        },
        team: {
            bg: 'bg-rose-500',
            bgSoft: 'bg-rose-500/20',
            border: 'border-rose-500',
            glow: 'rgba(244, 63, 94, 0.2)'
        },
        product: {
            bg: 'bg-slate-900',
            bgSoft: 'bg-slate-900/20',
            border: 'border-slate-900',
            glow: 'rgba(15, 23, 42, 0.2)'
        }
    };

    const c = colorMap[type];

    return L.divIcon({
        className: 'custom-div-icon',
        html: `
            <div class="relative group">
                <div class="absolute -inset-2 rounded-full animate-pulse" style="background: ${c.glow}; filter: blur(12px);"></div>
                <div class="relative w-10 h-10 bg-white border-2 ${c.border} rounded-2xl flex items-center justify-center shadow-xl transform transition-transform group-hover:scale-110 group-hover:-translate-y-1">
                    <div class="w-7 h-7 ${c.bg} rounded-xl flex items-center justify-center text-white">
                        ${type === 'idea' ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>' :
                type === 'team' ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' :
                    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.27 6.96 8.73 5.05 8.73-5.05"/><path d="M12 22.08V12"/></svg>'
            }
                    </div>
                </div>
            </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
    });
};

const ICONS = {
    idea: createCustomIcon('idea'),
    team: createCustomIcon('team'),
    product: createCustomIcon('product')
};

interface MapDisplayProps {
    items: any[];
    onMapClick: (lat: number, lng: number) => void;
    onViewDetail: (item: any) => void;
}

export default function MapView({ items, onMapClick, onViewDetail }: MapDisplayProps) {
    return (
        <MapContainer
            center={[12, 107]}
            zoom={6}
            zoomControl={false}
            className="h-full w-full"
            maxBounds={[[-85, -180], [85, 180]]}
        >
            <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />

            <FitBounds markers={items} />
            <MapEvents onMapClick={onMapClick} />

            {items.map((item) => (
                <Marker
                    key={item.id}
                    position={[item.location.lat, item.location.lng]}
                    icon={ICONS[item.mapType as keyof typeof ICONS]}
                >
                    <Popup className="custom-popup">
                        <div className="w-64 overflow-hidden rounded-2xl flex flex-col bg-white">
                            <img src={item.imageUrl} className="w-full h-32 object-cover" alt="" />
                            <div className="p-4">
                                <h3 className="text-sm text-slate-900 uppercase italic mb-2">
                                    {item.title || item.name}
                                </h3>
                                <button
                                    onClick={() => onViewDetail(item)}
                                    className="w-full py-2 bg-slate-50 hover:bg-rose-50 text-slate-900 uppercase text-[10px] tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    Chi tiết <ExternalLink size={12} />
                                </button>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}