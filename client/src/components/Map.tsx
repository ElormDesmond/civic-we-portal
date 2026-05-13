import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  projects: {
    id: number;
    title: string;
    latitude: number;
    longitude: number;
    status: string;
  }[];
}

const Map: React.FC<MapProps> = ({ projects }) => {
  // Default center (Accra area)
  const center: [number, number] = [5.6037, -0.1870];

  return (
    <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-inner border border-gray-100 dark:border-gray-700">
      <MapContainer center={center} zoom={12} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {projects.map((project) => (
          project.latitude !== 0 && (
            <Marker key={project.id} position={[project.latitude, project.longitude]}>
              <Popup>
                <div className="p-1">
                  <h3 className="font-bold text-gray-900">{project.title}</h3>
                  <p className="text-xs text-gray-500 uppercase font-semibold mt-1">Status: {project.status}</p>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;
