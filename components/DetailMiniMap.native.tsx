import React from 'react';
import { View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

type Props = {
  coordinate?: { latitude: number; longitude: number };
};

export default function DetailMiniMap({ coordinate }: Props) {
  const region = {
    latitude: coordinate?.latitude ?? -34.6037,
    longitude: coordinate?.longitude ?? -58.3816,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };
  return (
    <View style={{ flex: 1 }}>
      <MapView style={{ flex: 1 }} initialRegion={region}>
        {coordinate && <Marker coordinate={coordinate} />}
      </MapView>
    </View>
  );
}


