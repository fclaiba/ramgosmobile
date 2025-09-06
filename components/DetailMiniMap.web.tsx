import React from 'react';
import { View } from 'react-native';

type Props = {
  coordinate?: { latitude: number; longitude: number };
};

export default function DetailMiniMap({}: Props) {
  return <View style={{ flex: 1, backgroundColor: '#e2e8f0' }} />;
}


