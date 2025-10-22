import React, { memo } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { useContext, useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import RenderHtml from 'react-native-render-html';

import RecentOrders from '../components/RecentOrders';
import BannerCarousel from './../components/BannerCarousel';
import BrandBar from './../components/BrandBar';
import Categories from './../components/Categories';
import HeaderBar from './../components/HeaderBar';
import { AppContext } from './../ContextAPI/ContextAPI';

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/products/top-selling-products`;
const API_URL_RandomProducts = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/products/random-products`;
const TERMS_AGREE_API = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/auth/user/agree-terms`; // hypothetical endpoint

const HomeScreen = memo(function HomeScreen() {
  const { width } = useWindowDimensions();
  const { apiToken, accessTokens, onGenerateToken, loadingTokens } =
    useContext(AppContext);
    

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [randomProducts, setRandomProducts] = useState([]);
  const [showTerms, setShowTerms] = useState(false);
  const [termsContent, setTermsContent] = useState('');
  const [termsLoading, setTermsLoading] = useState(false);
  const [termsFetched, setTermsFetched] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const navigation = useNavigation();

  const termsSource = useMemo(() => ({ html: termsContent }), [termsContent]);

  const tagsStyles = useMemo(() => ({
    p: { fontSize: 16, lineHeight: 24, color: '#333', marginBottom: 10 },
    strong: { fontWeight: 'bold' },
    em: { fontStyle: 'italic' },
    u: { textDecorationLine: 'underline' },
  }), []);

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
      if (error.response?.data?.message === "User not found" || error.response?.data === "User not found") {
        // Clear user data and redirect to login
        await AsyncStorage.multiRemove(['accessToken', 'role', 'agreedTerms']);
        navigation.navigate('Login');
        return;
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
      if (error.response?.data?.message === "User not found" || error.response?.data === "User not found") {
        // Clear user data and redirect to login
        await AsyncStorage.multiRemove(['accessToken', 'role', 'agreedTerms']);
        navigation.navigate('Login');
        return;
      }
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

  const handleAgreeTerms = async () => {
    setLoading(true);
    try {
      // Call API to mark terms agreed
      const accessToken = await AsyncStorage.getItem("accessToken");
      const response = await axios.post(TERMS_AGREE_API, { terms_agreed: true }, {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'X-User-Token': `Bearer ${accessToken}`, // User token
          'Content-Type': 'application/json'
        }
      });
      if (response.data.statusCode === 200) {
        setShowTerms(false);
        const role = await AsyncStorage.getItem("role");
        await AsyncStorage.setItem("agreedTerms", "true");
        // Check if profile is updated
        const profileUpdated = await AsyncStorage.getItem("profileUpdated");
        if (profileUpdated !== "true") {
          setShowProfileModal(true);
        } else {
          let targetScreen = 'ProfileScreen';
          if(role == 2) {
            targetScreen = 'MainTabs';
          } else if(role == 3) {
            targetScreen = 'DeliveryPage';
          }
          const rootNavigation = navigation.getParent();
          if (rootNavigation) {
            rootNavigation.reset({
              index: 0,
              routes: [{ name: targetScreen }],
            });
          } else {
            navigation.reset({
              index: 0,
              routes: [{ name: targetScreen }],
            });
          }
        }
      } else {
        // setErrorMessage('Failed to agree to terms. Please try again.');
        // setErrorModalVisible(true);
      }
    } catch (error) {
      console.error('Error agreeing terms:', error.response?.data || error.message);
      if (error.response?.data == "Invalid or expired API token.") {
        await onGenerateToken(true);
        // Retry the API call after token regeneration
        await handleAgreeTerms();
        return;
      }
      // For any other error, clear user data and redirect to login
      await AsyncStorage.multiRemove(['accessToken', 'role', 'agreedTerms']);
      navigation.navigate('Login');
      return;
    } finally {
      setLoading(false);
    }
  };
  
const fetchTermsContent = async () => {
  if (termsFetched) return; // Prevent multiple fetches
  try {
    setTermsLoading(true);
    const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/pages/slug/terms-conditions`, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'X-User-Token': `Bearer ${accessTokens}`,
      },
    });
    if (response.data.success) {
      setTermsContent(response.data.data.content);
      setTermsFetched(true);
    }
  } catch (error) {
    console.error('Error fetching terms content:', error);
  } finally {
    setTermsLoading(false);
  }
};

const checkTerms = async () => {
  try {
    const value = await AsyncStorage.getItem("agreedToTerms");
    const agreedTerms = await AsyncStorage.getItem("agreedTerms");

    // AsyncStorage stores everything as strings, so compare with string

    if(agreedTerms === "true") {
      setShowTerms(false);
    } else if (value === "false" || value === null && !agreedTerms) {
      await AsyncStorage.removeItem("agreedTerms");
      setShowTerms(true);
    } else {
      setShowTerms(false);
    }
  } catch (error) {
    console.error("Error reading storage:", error);
  }
};

// Example usage:
useEffect(() => {
  checkTerms();
}, []);

// Fetch terms content when terms are shown and tokens are available
useEffect(() => {
  if (showTerms && apiToken && accessTokens) {
    fetchTermsContent();
  }
}, [showTerms, apiToken, accessTokens]);

// Hide tab bar when showing terms
useEffect(() => {
  const tabNavigator = navigation.getParent();
  if (tabNavigator) {
    tabNavigator.setOptions({
      tabBarStyle: showTerms ? { display: 'none' } : undefined,
    });
  }
}, [showTerms, navigation]);

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

  // Disable iOS swipe back gesture to prevent navigating back to auth screens
  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: false,
    });
  }, [navigation]);



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



  const handleDeclineTerms = () => {
    Alert.alert(
      "Decline Terms",
      "You must agree to the terms and conditions to continue using the app.",
      [
        { text: "OK", onPress: () => {} }
      ]
    );
  };

  if (showTerms) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
        <View style={styles.termsHeader}>
          <Text style={styles.termsTitle}>Terms and Conditions</Text>
        </View>
        <ScrollView
          style={styles.termsScroll}
        >
          {termsLoading ? (
            <View style={styles.termsLoadingContainer}>
              <ActivityIndicator size="large" color="#eb1f2a" />
              <Text style={styles.termsLoadingText}>Loading terms and conditions...</Text>
            </View>
          ) : termsContent ? (
            <RenderHtml
              contentWidth={width}
              source={termsSource}
              tagsStyles={tagsStyles}
            />
          ) : (
            <Text style={styles.termsText}>Failed to load terms and conditions.</Text>
          )}
        </ScrollView>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.declineButton} onPress={handleDeclineTerms}>
            <Text style={styles.declineButtonText}>Decline</Text>
          </TouchableOpacity>
          {loading ? (
            <View style={styles.agreeButtonContainer}>
              <ActivityIndicator size="large" color="#eb1f2a" />
            </View>
          ) : (
            <TouchableOpacity
              style={styles.agreeButton}
              onPress={handleAgreeTerms}
            >
              <Text style={styles.agreeButtonText}>I Agree</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <Modal
        visible={showProfileModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowProfileModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Icon name="person-circle" size={60} color="#eb1f2a" style={styles.modalIcon} />
            <Text style={styles.modalTitle}>Complete Your Profile</Text>
            <Text style={styles.modalMessage}>
              To provide you with a personalized experience and ensure smooth transactions, we recommend updating your profile information. This helps us tailor our services to your needs.
            </Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.doLaterButton}
                onPress={() => setShowProfileModal(false)}
              >
                <Text style={styles.doLaterButtonText}>Do Later</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.updateNowButton}
                onPress={() => {
                  setShowProfileModal(false);
                  navigation.navigate('ProfileScreen');
                }}
              >
                <Text style={styles.updateNowButtonText}>Update Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
});

export default HomeScreen;

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
  termsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  termsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  termsScroll: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  termsText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  agreeButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  agreeButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
  },
  agreeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 40,
    marginBottom: 20,
  },
  declineButton: {
    backgroundColor: '#ccc',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  declineButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  disabledText: {
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  modalIcon: {
    marginBottom: 15,
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  doLaterButton: {
    backgroundColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  doLaterButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  updateNowButton: {
    backgroundColor: '#eb1f2a',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  updateNowButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  termsLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  termsLoadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#eb1f2a',
  },
});