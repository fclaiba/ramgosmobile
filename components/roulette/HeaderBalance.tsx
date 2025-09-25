import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getTamagotchi, subscribeTamagotchi, ensureTamagotchiReady } from '../../services/tamagotchi';

export default function HeaderBalance() {
  const [coins, setCoins] = React.useState(getTamagotchi().coins);
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      await ensureTamagotchiReady();
      if (mounted) setCoins(getTamagotchi().coins);
    })();
    const u = subscribeTamagotchi(() => setCoins(getTamagotchi().coins));
    return () => { mounted = false; u(); };
  }, []);
  return (
    <View style={styles.coinPill}>
      <MaterialIcons name={'toll'} size={16} color={'#eab308'} />
      <Text style={styles.coinText}>{coins}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  coinPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(250,204,21,0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  coinText: { color: '#a16207', fontWeight: '900', marginLeft: 6 },
});


