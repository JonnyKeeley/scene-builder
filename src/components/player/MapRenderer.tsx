import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { MapData } from '@/types/database'

// Fix Leaflet's default marker icon path issue with bundlers
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface MapRendererProps {
  data: MapData
}

export default function MapRenderer({ data }: MapRendererProps) {
  return (
    <div className="w-full aspect-[4/3] rounded-lg overflow-hidden">
      <MapContainer
        center={[data.lat, data.lng]}
        zoom={15}
        scrollWheelZoom={false}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[data.lat, data.lng]} icon={defaultIcon}>
          {data.label && <Popup>{data.label}</Popup>}
        </Marker>
      </MapContainer>
    </div>
  )
}
