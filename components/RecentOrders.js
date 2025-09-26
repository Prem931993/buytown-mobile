import React, {useEffect, useContext, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import axios from "axios";
import { AppContext } from './../ContextAPI/ContextAPI';

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/products/new-arrivals`; // replace with your token endpoint

// const newArrivals = [
//   {
//     id: '1',
//     name: 'Drywall Screw Black',
//     price: '₹101- ₹200',
//     variants:5,
//     image: require('./../assets/DRY WALL BLACK  (50X6).png'),
//   },
//   {
//     id: '2',
//     name: 'Handle Screw',
//     price: '₹101- ₹200',
//     variants:5,
//     image: require('./../assets/NEW VERNA 4_ INCH.jpg'),
//   },
//   {
//     id: '3',
//     name: 'Silicon Sealant Black',
//     price: '₹101- ₹200',
//     variants:5,
//     image: require('./../assets/SILICONE BLACK.jpg'),
//   },
// ];

export default function NewArrivals() {

  const { apiToken, accessTokens, onGenerateToken } = useContext(AppContext);
  const [newArrivals, setNewArrivals]= useState([])

   const navigation = useNavigation();

  useEffect(()=> {
    const fetchTopSelling = async() => {
      // setLoading(true);
      try {
        const response = await axios.post(`${API_URL}`,
          {
          limit: 6
        }, {
          headers: {
            'Authorization': `Bearer ${apiToken}`, // API token
            'X-User-Token': `Bearer ${accessTokens}`, // User token
            'Content-Type': 'application/json'
          }
        })
        // setLoading(false);
        if(response.data.statusCode === 200) {
          setNewArrivals(response.data.products.filter(item => item && item.id))
        }
      } catch (error) {
        console.error("Error fetching top-selling products:", error.response?.data || error.message);
        if (error.response?.status === 401) {
          // Clear invalid tokens
          await AsyncStorage.removeItem("accessToken");
          await AsyncStorage.removeItem("apiToken");
          // Regenerate API token
          onGenerateToken(true);
        }
        // setLoading(false);
        // Don't throw to avoid uncaught promise rejection
      }
    }

    if(apiToken && accessTokens) {
      fetchTopSelling()
    }

  }, [apiToken, accessTokens, onGenerateToken])


  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card}
       onPress={() => navigation.navigate('ProductDetailsScreen', { product: item })}
    >
      <Image source={{ uri: item?.images[0]?.path }} style={styles.image} />
      <Text numberOfLines={2} style={styles.name}>{item.name}</Text>
      {/* <Text style={styles.variants}>{item.variations.length} Variants</Text> */}
      <Text style={styles.price}><Text style={styles.strikeOut}>₹{item.price}</Text> - ₹{item?.selling_price}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Arrivals</Text>
      <FlatList
        data={newArrivals}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical:16
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  card: {
    width: 140,
    backgroundColor: '#fffafa',
    padding: 10,
    marginRight: 12,
    borderRadius: 8,
    elevation: 2,
    alignItems: 'center',
    marginVertical:10
  },
   variants: {
    fontSize: 14,
    marginTop: 5,
    marginBottom:5,
    color: '#616161',
    textAlign: 'center',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 6,
    marginBottom: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom:10,
  },
  price: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: 'bold',
    color: '#f44336',
  },
  strikeOut: {
    textDecorationLine: 'line-through', 
    textDecorationStyle: 'solid', // optional
    color:"#999999"
  },
});
