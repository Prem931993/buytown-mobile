// VariantScreen.js
import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import InnerHeader from './../components/InnerHeader';

const BRANDS = {
  'Dry Wall Black': [
    { id: 'brand1', name: 'Brand A', image: require('../assets/brand.png') },
    { id: 'brand2', name: 'Brand B', image: require('../assets/brand.png') },
  ],
  'Dry Wall Zing': [
    { id: 'brand3', name: 'Zing Co', image: require('../assets/brand.png') },
    { id: 'brand4', name: 'Zing World', image: require('../assets/brand.png') },
  ],
  '50X4': [
    { id: 'brand5', name: 'ScrewTech', image: require('../assets/brand.png') },
  ],
  // Add more
};

export default function VariantScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { subCategory2 } = route.params;

  const brandList = BRANDS[subCategory2] || [];

  const handleBrandSelect = (brand) => {
    navigation.navigate('ProductListScreen', {
      brandName: brand.name,
      subCategory2,
    });
  };

  return (
    <>
    <InnerHeader showSearch={false} />
    <SafeAreaView style={styles.container}>
        
      <Text style={styles.title}>{subCategory2} - Brands</Text>

      <FlatList
        data={brandList}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            // onPress={() => handleBrandSelect(item)}
            onPress={() => navigation.navigate('ProductListScreen', { variant: item.name })}
          >
            <Image source={item.image} style={styles.image} />
            <Text style={styles.name}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 10 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  grid: { gap: 10 },
  card: {
    width: '45%',
    margin: '2.5%',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
    padding: 10,
    elevation: 2,
  },
  image: { width: 60, height: 60, marginBottom: 8 },
  name: { fontSize: 14, textAlign: 'center' },
});
