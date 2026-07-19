"use client"

import { useEffect, useState, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

const ORIGIN = { lat: 48.7833, lng: 2.45, label: "Créteil (94)" }

function makeIcon(color: string) {
  return L.divIcon({
    className: "",
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
    html: `<svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z" fill="${color}"/>
      <circle cx="14" cy="13" r="5" fill="white"/>
    </svg>`,
  })
}

const originIcon = makeIcon("#C9948E")
const destIcon = makeIcon("#ef4444")

interface RouteProps {
  origin: L.LatLngExpression
  dest: L.LatLngExpression
  color?: string
}

function RouteLine({ origin, dest, color = "#C9948E" }: RouteProps) {
  const map = useMap()
  const [coords, setCoords] = useState<L.LatLngExpression[]>([])
  const drawn = useRef(false)

  useEffect(() => {
    if (drawn.current) return
    drawn.current = true

    const oLat = typeof origin[0] === "number" ? origin[0] : 0
    const oLng = typeof origin[1] === "number" ? origin[1] : 0
    const dLat = typeof dest[0] === "number" ? dest[0] : 0
    const dLng = typeof dest[1] === "number" ? dest[1] : 0

    const url = `https://router.project-osrm.org/route/v1/driving/${oLng},${oLat};${dLng},${dLat}?overview=full&geometries=geojson`

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.routes?.[0]?.geometry?.coordinates) {
          const path: L.LatLngExpression[] = data.routes[0].geometry.coordinates.map(
            (c: [number, number]) => [c[1], c[0]] as L.LatLngExpression
          )
          setCoords(path)
          map.fitBounds(L.latLngBounds([origin, dest]).pad(0.15))
        }
      })
      .catch(() => {
        setCoords([origin, dest])
        map.fitBounds(L.latLngBounds([origin, dest]).pad(0.15))
      })
  }, [origin, dest, map])

  if (coords.length === 0) return null
  return <Polyline positions={coords} pathOptions={{ color, weight: 5, opacity: 0.8 }} />
}

function FitBounds({ bounds }: { bounds: L.LatLngBoundsExpression }) {
  const map = useMap()
  useEffect(() => {
    map.fitBounds(bounds, { padding: [40, 40] })
  }, [map, bounds])
  return null
}

interface DeliveryMapProps {
  destination: string
  postalCode?: string
  isDark?: boolean
}

export default function DeliveryMap({ destination, postalCode, isDark = false }: DeliveryMapProps) {
  const [destCoords, setDestCoords] = useState<L.LatLngExpression | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fullAddress = postalCode ? `${destination}, ${postalCode} France` : `${destination}, France`

  useEffect(() => {
    setLoading(true)
    setError(false)

    const q = encodeURIComponent(fullAddress)
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.[0]) {
          setDestCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)])
        } else {
          setError(true)
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [fullAddress])

  const bounds: L.LatLngBoundsExpression = destCoords
    ? [[ORIGIN.lat, ORIGIN.lng], [destCoords[0] as number, destCoords[1] as number]]
    : [[ORIGIN.lat, ORIGIN.lng]]

  const tileUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

  const tileAttribution = isDark
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-black/[0.05] dark:border-white/[0.08]">
      {loading && (
        <div className="h-[200px] bg-gradient-to-br from-[#F0EBE3] to-white dark:from-neutral-800 dark:to-neutral-900 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-[#C9948E] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-gray-400 dark:text-neutral-500">Chargement de la carte…</p>
          </div>
        </div>
      )}

      {error && (
        <div className="h-[200px] bg-gradient-to-br from-[#F0EBE3] to-white dark:from-neutral-800 dark:to-neutral-900 flex items-center justify-center">
          <p className="text-xs text-gray-400 dark:text-neutral-500">Adresse non localisable</p>
        </div>
      )}

      {!loading && !error && (
        <MapContainer
          center={destCoords ?? [ORIGIN.lat, ORIGIN.lng]}
          zoom={12}
          scrollWheelZoom={false}
          style={{ height: 200, width: "100%" }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url={tileUrl} attribution={tileAttribution} />
          <FitBounds bounds={bounds} />
          <Marker position={[ORIGIN.lat, ORIGIN.lng]} icon={originIcon}>
            <Popup>{ORIGIN.label}</Popup>
          </Marker>
          {destCoords && (
            <>
              <Marker position={destCoords} icon={destIcon}>
                <Popup>{destination}</Popup>
              </Marker>
              <RouteLine origin={[ORIGIN.lat, ORIGIN.lng]} dest={destCoords} />
            </>
          )}
        </MapContainer>
      )}
    </div>
  )
}
