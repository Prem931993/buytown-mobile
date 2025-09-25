import axios from "axios";
import { useContext, useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppContext } from './../ContextAPI/ContextAPI';

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/brands?limit=50`; // replace with your token endpoint




export default function BrandScroll() {

  const { apiToken, accessTokens, onGenerateToken } = useContext(AppContext);
  const [topBrands, setTopBrands]= useState([])

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
        console.log('topBrands', response);
        // setLoading(false);
        if(response.data.statusCode === 200) {
          setTopBrands(response.data.brands)
        }
      } catch (error) {
        console.error("Error fetching top-selling products:", error.response?.data || error.message);
        if (error.response?.status === 401) {
          console.log("Tokens invalid, clearing and regenerating...");
          // Clear invalid tokens
          // await AsyncStorage.removeItem("accessToken");
          // await AsyncStorage.removeItem("apiToken");
          // // Regenerate API token
          // onGenerateToken(true);
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
    <View style={styles.brandSection}>
      <Text style={styles.title}>Top Brands</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.brandList}
      >
        {topBrands?.map((brand) => (
          <View key={brand.id} style={styles.brandCard}>
            <Image source={{uri: brand.image}} style={styles.brandImage} />
            {/* <Text style={styles.brandName}>{brand.name}</Text> */}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  brandSection: {
    marginTop: 20,
    paddingHorizontal: 18,
    backgroundColor:"#fbe6f9ff",
    marginTop:30,
    marginHorizontal:20,
    borderRadius: 10,
    paddingVertical:20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  brandList: {
    paddingRight: 16,
  },
  brandCard: {
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    // padding: 10,
    // elevation: 2,
  },
  brandImage: {
    width: 120,
    height: 60,
    resizeMode: 'contain',
    marginBottom: 0,
    borderRadius: 12,
  },
  brandName: {
    fontSize: 12,
    color: '#333',
  },
});
