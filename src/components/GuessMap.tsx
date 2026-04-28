import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import type { LatLng, Phase } from "../types";

const defaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const truthIcon = L.divIcon({
  className: "truth-marker",
  html: '<div class="truth-dot"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

interface Props {
  phase: Phase;
  guess: LatLng | null;
  truth: LatLng | null;
  onPickGuess: (p: LatLng) => void;
}

function ClickHandler({ onPick }: { onPick: (p: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function FitBounds({ guess, truth }: { guess: LatLng; truth: LatLng }) {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds([
      [guess.lat, guess.lng],
      [truth.lat, truth.lng],
    ]);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 7 });
  }, [map, guess.lat, guess.lng, truth.lat, truth.lng]);
  return null;
}

export function GuessMap({ phase, guess, truth, onPickGuess }: Props) {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      worldCopyJump
      className="map"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {phase === "guessing" && <ClickHandler onPick={onPickGuess} />}
      {guess && <Marker position={[guess.lat, guess.lng]} icon={defaultIcon} />}
      {phase === "revealed" && truth && (
        <Marker position={[truth.lat, truth.lng]} icon={truthIcon} />
      )}
      {phase === "revealed" && guess && truth && (
        <>
          <Polyline
            positions={[
              [guess.lat, guess.lng],
              [truth.lat, truth.lng],
            ]}
            pathOptions={{ color: "#e26d5a", weight: 2, dashArray: "6 6" }}
          />
          <FitBounds guess={guess} truth={truth} />
        </>
      )}
    </MapContainer>
  );
}
