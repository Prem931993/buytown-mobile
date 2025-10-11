import React from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';

import RecentOrders from '../components/RecentOrders';
import BannerCarousel from './../components/BannerCarousel';
import BrandBar from './../components/BrandBar';
import Categories from './../components/Categories';
import HeaderBar from './../components/HeaderBar';
import { AppContext } from './../ContextAPI/ContextAPI';

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/products/top-selling-products`;
const API_URL_RandomProducts = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/products/random-products`;

export default function HomeScreen() {
  const { apiToken, accessTokens, onGenerateToken, loadingTokens } =
    useContext(AppContext);
    

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [randomProducts, setRandomProducts] = useState([]);

  const navigation = useNavigation();

  // Fetch Top Selling Products
  const fetchTopSelling = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        API_URL,
        { limit: 6 },
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'X-User-Token': `Bearer ${accessTokens}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.data.statusCode === 200) {
        setTopSellingProducts(response.data.products);
      }
    } catch (error) {
      console.error(
        'Error fetching top-selling products:',
        error.response?.data || error.message
      );
      if (error.response?.data == "Invalid or expired API token.") {
        await onGenerateToken(true);
        // Retry the API call after token regeneration
        await fetchTopSelling();
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch Random Products
  const fetchRandomProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        API_URL_RandomProducts,
        { limit: 10 },
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'X-User-Token': `Bearer ${accessTokens}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.data.statusCode === 200) {
        setRandomProducts(response.data.products);
      }
    } catch (error) {
      console.error(
        'Error fetching random products:',
        error.response?.data || error.message
      );
      // Do not regenerate token here to avoid multiple regenerations
    } finally {
      setLoading(false);
    }
  };

  // Fetch Wishlist
  // Removed fetchWishlist as wishlist status is included in product API responses (is_wishlisted flag)
  // const fetchWishlist = async () => {
  //   try {
  //     const response = await axios.get(
  //       `${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/wishlist?page=1&limit=1000`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${apiToken}`,
  //           'X-User-Token': `Bearer ${accessTokens}`,
  //         },
  //       }
  //     );
  //     if (response.data.statusCode === 200) {
  //       setWishlistItems(response.data.data || []);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching wishlist:', error);
  //   }
  // };

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTopSelling();
    await fetchRandomProducts();
    setRefreshing(false);
  };

  // Handle missing tokens: remove login & redirect
  const handleNoTokens = async () => {
    try {
      // await AsyncStorage.setItem('isLoggedIn', 'false');
      navigation.navigate('Pin');
      // setTimeout(() => {
      //   navigation.navigate('MainTabs');
      // }, 1000);

      
      
    } catch (e) {
      console.error('Error removing isLoggedIn:', e);
    }
  };

  // Initial fetch / token handling
  useEffect(() => {
    if (!loadingTokens) {
      if (apiToken?.length && accessTokens?.length) {
        fetchTopSelling();
        fetchRandomProducts();
      } else {
        handleNoTokens(); // Clear login and redirect
        // onGenerateToken(true); // Regenerate token if needed
      }
    }
  }, [apiToken, accessTokens, loadingTokens]);

  // Refresh data when screen is focused (to handle updates from other screens)
  useFocusEffect(
    React.useCallback(() => {
      fetchTopSelling();
      fetchRandomProducts();
    }, [apiToken, accessTokens])
  );

  // Handle back button to exit app
  useEffect(() => {
    const backAction = () => {
      Alert.alert("Exit App", "Are you sure you want to exit?", [
        {
          text: "Cancel",
          onPress: () => null,
          style: "cancel"
        },
        { text: "YES", onPress: () => BackHandler.exitApp() }
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);



  // Toggle wishlist
  const toggleWishlist = async (productId) => {
    try {
      await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/wishlist/${productId}/toggle`, {}, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'X-User-Token': `Bearer ${accessTokens}`,
        },
      });
      // Refetch products to update wishlist status
      await fetchTopSelling();
      await fetchRandomProducts();
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      console.error('Error response:', error.response?.data);
    }
  };

  // Show waiting screen if tokens not loaded yet
  if (loadingTokens || !apiToken || !accessTokens) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={[]}>
        <ActivityIndicator size="large" color="#eb1f2a" />
        <Text style={styles.loadingText}>Preparing your session...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#eb1f2a" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={{ paddingBottom: 60 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <HeaderBar />
        <Categories />
        <BannerCarousel navigation={navigation} />

        {/* Top Selling Products */}
        <View style={styles.productWrap}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Top Selling Products</Text>
          </View>
        <View style={styles.sectionRow}></View>
          {topSellingProducts.filter(item => item).map((item) => {
            const isInWishlist = item.is_wishlisted || false;
            return (
            <TouchableOpacity
              key={item.id}
              style={styles.flashCard}
              onPress={() =>
                navigation.navigate('ProductDetailsScreen', { product: item })
              }
              delayPressIn={0}
            >
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: item?.images[0]?.path }}
                  style={styles.flashImage}
                />
                {item.isBestSeller && (
                  <View style={styles.bestSellerLabel}>
                    <Text style={styles.bestSellerText}>Best Seller</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.wishlistIcon}
                  onPress={() => toggleWishlist(item.id)}
                >
                  <Icon
                    name={isInWishlist ? "heart" : "heart-outline"}
                    size={24}
                    color={isInWishlist ? "#F44336" : "#666"}
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.flashName}>{item.name}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.offerPrice}>
                  <Text style={styles.strikeOut}>₹{item.price}</Text> - ₹
                  {item?.selling_price}
                </Text>
              </View>
            </TouchableOpacity>
            )
          })}
        </View>

        <RecentOrders />
        <BrandBar />

        {/* Random Products */}
        <View style={styles.productList}>
          {randomProducts?.filter(item => item).map((item) => {
            const isInWishlist = item.is_wishlisted || false;
            return (
            <TouchableOpacity
              key={item.id}
              style={styles.flashCard}
              onPress={() =>
                navigation.push('ProductDetailsScreen', { product: item }) // pass full object
              }
              delayPressIn={0}
            >
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: item?.images[0]?.path }}
                  style={styles.flashImage}
                />
                <TouchableOpacity
                  style={styles.wishlistIcon}
                  onPress={() => toggleWishlist(item.id)}
                >
                  <Icon
                    name={isInWishlist ? "heart" : "heart-outline"}
                    size={24}
                    color={isInWishlist ? "#F44336" : "#666"}
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.flashName}>{item.name}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.offerPrice}>
                  <Text style={styles.strikeOut}>₹{item.price}</Text> - ₹
                  {item?.selling_price}
                </Text>
              </View>
            </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    marginTop: 20,
    width:"100%"
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  productWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    backgroundColor: '#f8f7ffff',
    marginTop: 30,
    marginHorizontal: 20,
    borderRadius: 10,
    paddingBottom: 15,
  },
  productList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 30,
    marginHorizontal: 20,
    borderRadius: 10,
  },
  flashCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    elevation: 3,
  },
  imageWrapper: {
    position: 'relative',
  },
  flashImage: {
    width: '100%',
    height: 120,
    resizeMode: 'contain',
    borderRadius: 4,
  },
  bestSellerLabel: {
    position: 'absolute',
    top: 3,
    left: 3,
    backgroundColor: '#F44336',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 1,
  },
  bestSellerText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  wishlistIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 4,
    zIndex: 2,
  },
  flashName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerPrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000',
  },
  strikeOut: {
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
    color: '#999999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#eb1f2a',
  },
});
