import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE, LatLng } from 'react-native-maps';
import * as Location from 'expo-location';
import Slider from '@react-native-community/slider';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export type MapItem = { id: string; title: string; coordinate: LatLng };

type Props = {
  items: MapItem[];
  initialRegion?: { latitude: number; longitude: number; latitudeDelta?: number; longitudeDelta?: number };
  radiusKm?: number;
  onRadiusChange?: (km: number) => void;
  onInsideChange?: (ids: string[], center: { latitude: number; longitude: number }, radiusKm: number) => void;
  hideControls?: boolean;
  onBindApi?: (api: { centerOnMyLocation: () => void }) => void;
};

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
  const [region, setRegion] = useState({
    latitude: initialRegion?.latitude ?? -34.6037,
    longitude: initialRegion?.longitude ?? -58.3816,
    latitudeDelta: initialRegion?.latitudeDelta ?? 0.08,
    longitudeDelta: initialRegion?.longitudeDelta ?? 0.08,
  });
  const [radius, setRadius] = useState(radiusKm);
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [insideCount, setInsideCount] = useState(0);
  const [address, setAddress] = useState<string>('');

  useEffect(() => { onRadiusChange?.(radius); }, [radius]);
  // Sync external radius changes
  useEffect(() => { setRadius(radiusKm); }, [radiusKm]);

  const handleMyLocation = async () => {
    try {
      setLoadingLoc(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setLoadingLoc(false); return; }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = loc.coords;
      setRegion((r) => ({ ...r, latitude, longitude }));
    } finally { setLoadingLoc(false); }
  };

  const inside = useMemo(() => {
    const ids = items.filter((m) => haversineKm({ latitude: region.latitude, longitude: region.longitude }, m.coordinate) <= radius).map((m) => m.id);
    onInsideChange?.(ids, { latitude: region.latitude, longitude: region.longitude }, radius);
    return ids;
  }, [items, region, radius]);
  useEffect(() => { setInsideCount(inside.length); }, [inside]);

  // Reverse geocode center to display a readable address (debounced)
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const res = await Location.reverseGeocodeAsync({ latitude: region.latitude, longitude: region.longitude });
        if (!cancelled) {
          const r = res?.[0];
          const line = r ? [r.street, r.name, r.subregion].filter(Boolean).join(' · ') : '';
          setAddress(line);
        }
      } catch {
        if (!cancelled) setAddress('');
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [region.latitude, region.longitude]);

  // Expose API to parent (for "Mi ubicación" externo)
  useEffect(() => {
    if (!onBindApi) return;
    onBindApi({ centerOnMyLocation: handleMyLocation });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onBindApi]);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        provider={PROVIDER_GOOGLE}
        region={region}
        onRegionChangeComplete={setRegion}
        onPress={(e) => {
          const { latitude, longitude } = e.nativeEvent.coordinate;
          setRegion((r) => ({ ...r, latitude, longitude }));
        }}
      >
        <Circle center={{ latitude: region.latitude, longitude: region.longitude }} radius={radius * 1000} fillColor={'rgba(17,115,212,0.12)'} strokeColor={'rgba(17,115,212,0.6)'} />
        <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} pinColor={'#1173d4'} draggable onDragEnd={(e) => {
          const { latitude, longitude } = e.nativeEvent.coordinate;
          setRegion((r) => ({ ...r, latitude, longitude }));
        }} />
        {items.filter((m) => inside.includes(m.id)).map((m) => (
          <Marker key={m.id} coordinate={m.coordinate} title={m.title} />
        ))}
      </MapView>
      {/* Info superior: cantidad dentro y radio actual */}
      <View style={styles.topInfo} pointerEvents="none">
        <Text style={styles.topInfoText}>{insideCount} dentro · Radio: {radius} km</Text>
        {!!address && <Text style={styles.topInfoSub}>{address}</Text>}
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
          <Slider minimumValue={0} maximumValue={50} step={1} value={radius} onValueChange={(v) => setRadius(Math.max(0, Math.min(50, v as any)))} minimumTrackTintColor={'#1173d4'} maximumTrackTintColor={'#e5e7eb'} thumbTintColor={'#1173d4'} />
          <View style={{ height: 8 }} />
          <Pressable style={styles.locationBtn} onPress={handleMyLocation} accessibilityLabel="Mi ubicación">
            <MaterialIcons name={'my-location'} size={18} color={'#0f172a'} />
            <Text style={styles.locationBtnText}>{loadingLoc ? 'Obteniendo ubicación...' : 'Mi ubicación'}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  controls: { position: 'absolute', left: 12, right: 12, bottom: 12, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 12, padding: 12, gap: 8 },
  sliderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { color: '#0f172a', fontWeight: '800' },
  value: { color: '#0f172a', fontWeight: '800' },
  pillBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#e5e7eb' },
  pillBtnText: { color: '#0f172a', fontWeight: '700' },
  locationBtn: { height: 40, borderRadius: 8, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  locationBtnText: { color: '#0f172a', fontWeight: '800' },
  topInfo: { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(255,255,255,0.95)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  topInfoText: { color: '#0f172a', fontWeight: '800' },
  topInfoSub: { color: '#475569', fontWeight: '700', marginTop: 2 },
});


