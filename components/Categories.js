import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import axios from "axios";
import { useContext, useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppContext } from './../ContextAPI/ContextAPI';

// const categories = [
//   { id: '1', label: 'Screws', image: require('./../assets/screwImg-1.jpg') },
//   { id: '2', label: 'Glue', image: require('./../assets/glueProductsImg.png') },
//   { id: '3', label: 'Basket', image: require('./../assets/kitchenBasketImg.png') },
//   { id: '4', label: 'Sliders', image: require('./../assets/PullOutSliderImg.png') },
// //   { id: '4', label: 'See More', icon: 'grid-outline' },
// ];

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/general-settings`; // replace with your token endpoint

export default function Categories() {
  const navigation = useNavigation();
  const { apiToken, accessTokens, onGenerateToken } = useContext(AppContext);
  const [categories, setCategories]= useState([]);

  useEffect(()=> {
    const fetchTopSelling = async() => {
      // setLoading(true);
      try {
        const response = await axios.get(`${API_URL}`, {
          headers: {
            'Authorization': `Bearer ${apiToken}`, // API token
            'X-User-Token': `Bearer ${accessTokens}`, // User token
            'Content-Type': 'application/json'
          }
        })
        console.log('categories', response);
        // setLoading(false);
        if(response.status === 200) {
          setCategories(response.data.data.selected_categories)
        }
      } catch (error) {
        console.error("Error fetching top-selling products:", error.response?.data || error.message);
        if (error.response?.status === 401) {
          console.log("Tokens invalid, clearing and regenerating...");
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
      console.log("accessTokens-------:", accessTokens);
      console.log("apiToken-------------:", apiToken);
      fetchTopSelling()
    }

  }, [apiToken, accessTokens, onGenerateToken])


  return (
    <View style={styles.categories}>
      {categories?.map((cat) => (
        <TouchableOpacity key={cat.id} style={styles.categoryItem} 
          onPress={() => 
            navigation.navigate('ProductListScreen', {category_id: cat?.id, name: cat?.name})
          }
          
        >
          <Image source={{uri: cat.image}} style={styles.categoryImage} />
          <Text style={styles.categoryLabel}>{cat.name}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.categoryItem} onPress={() => navigation.navigate('Category')}>
          <Icon name='grid-outline' size={28} color="#999" />
          <Text style={styles.categoryLabel}>SEE MORE</Text>
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  categories: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: -40,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f7f7f7',
    shadowColor: '#999',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  categoryImage: {width: 30, height:30,},
  categoryItem: { alignItems: 'center' },
  categoryLabel: { fontSize: 8, marginTop: 4 },
});
