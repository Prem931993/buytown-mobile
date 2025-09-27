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

const SUB_CATEGORY_LEVEL_2 = {
  'Dry Wall': [
    { id: 'dw1', name: 'Dry Wall Black', image: require('../assets/product-img.jpeg') },
    { id: 'dw2', name: 'Dry Wall Zing', image: require('../assets/product-img.jpeg') },
    { id: 'dw3', name: 'Dry Wall Gold', image: require('../assets/product-img.jpeg') },
  ],
  'Handle Screw': [
    { id: 'hs1', name: '50X4', image: require('../assets/product-img.jpeg') },
    { id: 'hs2', name: '38X4', image: require('../assets/product-img.jpeg') },
    { id: 'hs3', name: '25X4', image: require('../assets/product-img.jpeg') },
    { id: 'hs4', name: '22X4', image: require('../assets/product-img.jpeg') },
  ],
  'Door Handles': [
    { id: 'dh1', name: 'Modern Handle', image: require('../assets/product-img.jpeg') },
    { id: 'dh2', name: 'Classic Handle', image: require('../assets/product-img.jpeg') },
  ],
  'PVC Doors': [
    { id: 'pvc1', name: 'PVC Brown', image: require('../assets/product-img.jpeg') },
    { id: 'pvc2', name: 'PVC White', image: require('../assets/product-img.jpeg') },
  ],
};

export default function SubCategoryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { subCategory } = route.params;

  const data = SUB_CATEGORY_LEVEL_2[subCategory] || [];

  const handlePress = (item) => {
    navigation.navigate('VariantScreen', {
      subCategory2: item.name,
    });
  };

  return (
    <>
    
    <InnerHeader />
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{subCategory}</Text>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => handlePress(item)}>
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
  title: { fontSize: 18, fontWeight: 'bold', paddingHorizontal:10, marginBottom: 10, color: '#333' },
  grid: { gap: 10 },
  card: {
    width: '45%',
    margin: '2.5%',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    alignItems: 'center',
    padding: 10,
    elevation: 2,
  },
  image: { width: "100%", height: 120, marginBottom: 8 },
  name: { fontSize: 14, textAlign: 'center' },
});
