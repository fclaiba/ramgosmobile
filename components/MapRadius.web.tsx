import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import Slider from '@react-native-community/slider';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import L from 'leaflet';

export type MapItem = { id: string; title: string; coordinate: { latitude: number; longitude: number } };

type Props = {
  items: MapItem[];
  initialRegion?: { latitude: number; longitude: number; latitudeDelta?: number; longitudeDelta?: number };
  radiusKm?: number;
  onRadiusChange?: (km: number) => void;
  onInsideChange?: (ids: string[], center: { latitude: number; longitude: number }, radiusKm: number) => void;
  hideControls?: boolean;
  onBindApi?: (api: { centerOnMyLocation: () => void }) => void;
};

// Web fallback: simple canvas-like representation to avoid native maps on web bundling error
function haversineKm(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export default function MapRadius({ items, initialRegion, radiusKm = 5, onRadiusChange, onInsideChange, hideControls, onBindApi }: Props) {
  const [radius, setRadius] = useState(radiusKm);
  const [center, setCenter] = useState({
    latitude: initialRegion?.latitude ?? -34.6037,
    longitude: initialRegion?.longitude ?? -58.3816,
  });
  const [insideCount, setInsideCount] = useState(0);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const markersRef = useRef<any>(null);
  const centerMarkerRef = useRef<any>(null);
  useEffect(() => { onRadiusChange?.(radius); }, [radius]);
  // Sync external changes
  useEffect(() => { setRadius(radiusKm); }, [radiusKm]);

  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;
    // Inject Leaflet CSS if not present
    if (!document.querySelector('link[data-leaflet]')) {
      const link = document.createElement('link');
      link.setAttribute('rel', 'stylesheet');
      link.setAttribute('href', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
      link.setAttribute('data-leaflet', 'true');
      document.head.appendChild(link);
    }
    // Fix default marker icons on bundlers
    const defaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
    // @ts-ignore
    L.Marker.prototype.options.icon = defaultIcon;
    const map = L.map(mapRef.current).setView([center.latitude, center.longitude], 13);
    leafletRef.current = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(map);
    circleRef.current = L.circle([center.latitude, center.longitude], { radius: radius * 1000, color: '#1173d4', fillColor: '#1173d4', fillOpacity: 0.15 }).addTo(map);
    markersRef.current = L.layerGroup().addTo(map);
    centerMarkerRef.current = L.marker([center.latitude, center.longitude], { opacity: 0.9 }).addTo(map);
    items.forEach((m) => L.marker([m.coordinate.latitude, m.coordinate.longitude]).addTo(markersRef.current as any).bindPopup(m.title));

    // click to move center
    map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      setCenter({ latitude: lat, longitude: lng });
    });
  }, []);
  // Expose API to parent
  useEffect(() => {
    if (!onBindApi) return;
    onBindApi({
      centerOnMyLocation: () => {
        navigator.geolocation.getCurrentPosition((pos) => setCenter({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
      },
    });
  }, [onBindApi]);

  useEffect(() => {
    if (!leafletRef.current || !circleRef.current) return;
    circleRef.current.setLatLng([center.latitude, center.longitude]);
    circleRef.current.setRadius(radius * 1000);
    if (centerMarkerRef.current) centerMarkerRef.current.setLatLng([center.latitude, center.longitude]);
  }, [center, radius]);

  // Compute items inside radius and refresh markers
  useEffect(() => {
    if (!markersRef.current) return;
    const ids = items.filter((m) => haversineKm(center, m.coordinate) <= radius).map((m) => m.id);
    onInsideChange?.(ids, center, radius);
    setInsideCount(ids.length);
    markersRef.current.clearLayers();
    items.forEach((m) => {
      if (ids.includes(m.id)) {
        L.marker([m.coordinate.latitude, m.coordinate.longitude]).addTo(markersRef.current as any).bindPopup(m.title);
      }
    });
  }, [items, center, radius]);

  return (
    <View style={{ flex: 1, position: 'relative' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      <View style={{ position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(255,255,255,0.95)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, pointerEvents: 'none' as any }}>
        <Text style={{ color: '#0f172a', fontWeight: '800' }}>{insideCount} dentro · Radio: {radius} km</Text>
      </View>
      {!hideControls && (
        <View style={styles.controls}>
        <View style={styles.sliderRow}>
          <Text style={styles.label}>Radio</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.value}>{radius} km</Text>
            <Pressable onPress={() => setRadius(5)} style={styles.pillBtn}><Text style={styles.pillBtnText}>5</Text></Pressable>
            <Pressable onPress={() => setRadius(10)} style={styles.pillBtn}><Text style={styles.pillBtnText}>10</Text></Pressable>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Slider minimumValue={0} maximumValue={50} step={1} value={radius} onValueChange={(v) => setRadius(Math.max(0, Math.min(50, v as any)))} minimumTrackTintColor={'#1173d4'} maximumTrackTintColor={'#e5e7eb'} thumbTintColor={'#1173d4'} />
          </View>
          <View style={styles.kmInputWrap}>
            <TextInput
              value={String(radius)}
              onChangeText={(t) => {
                const n = Math.max(0, Math.min(50, parseInt(t || '0', 10)));
                if (!Number.isNaN(n)) setRadius(n);
              }}
              keyboardType={'numeric'}
              style={styles.kmInput}
              placeholder={'km'}
              placeholderTextColor={'#94a3b8'}
            />
            <Text style={styles.kmSuffix}>km</Text>
          </View>
          <Pressable style={[styles.locationBtn, { flexShrink: 0 }]} onPress={() => navigator.geolocation.getCurrentPosition((pos) => setCenter({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }))} accessibilityLabel="Mi ubicación">
            <MaterialIcons name={'my-location'} size={18} color={'#0f172a'} />
            <Text style={styles.locationBtnText}>Mi ubicación</Text>
          </Pressable>
        </View>
      </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  controls: { position: 'absolute', left: 12, right: 12, bottom: 12, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 12, padding: 12, gap: 8, zIndex: 1000, pointerEvents: 'auto' as any },
  sliderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { color: '#0f172a', fontWeight: '800' },
  value: { color: '#0f172a', fontWeight: '800' },
  pillBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#e5e7eb' },
  pillBtnText: { color: '#0f172a', fontWeight: '700' },
  locationBtn: { height: 40, borderRadius: 8, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  locationBtnText: { color: '#0f172a', fontWeight: '800' },
  kmInputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 8, height: 40, backgroundColor: '#ffffff' },
  kmInput: { width: 56, color: '#0f172a' },
  kmSuffix: { color: '#64748b', marginLeft: 4 },
});


