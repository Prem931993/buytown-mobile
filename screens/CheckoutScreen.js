import React, { useContext, useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, SafeAreaView, TextInput, Alert, ScrollView, ActivityIndicator, PermissionsAndroid, Platform } from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';
import { AppContext } from './../ContextAPI/ContextAPI';
import { Colors } from '../constants/theme';
import axios from 'axios';

// Conditionally import map components only for native platforms
let MapView, Marker, MapViewDirections, Geolocation;
if (Platform.OS !== 'web') {
  try {
    MapView = require('react-native-maps').default;
    Marker = require('react-native-maps').Marker;
    MapViewDirections = require('react-native-maps-directions').default;
    Geolocation = require('react-native-geolocation-service').default;
  } catch (error) {
    console.warn('Map components not available on this platform');
  }
}

// RS Puram, Coimbatore coordinates
const COIMBATORE_COORDS = {
  latitude: 11.0046,
  longitude: 76.9572,
};

// Google Maps API Key - Add to your .env file as EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
const GOOGLE_MAPS_APIKEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyDao7PSifrnHW0ly7XDAHASdb5wJneSSPQ';

export default function CheckoutScreen({ navigation }) {
  const { apiToken, accessTokens } = useContext(AppContext);
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [shippingAddress, setShippingAddress] = useState({
    first_name: '',
    last_name: '',
    street: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'IN',
  });
  const [billingAddress, setBillingAddress] = useState({
    first_name: '',
    last_name: '',
    street: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'IN',
    gst_number: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [notes, setNotes] = useState('');
  const [deliveryDistance, setDeliveryDistance] = useState(12); // Mock distance
  const [loading, setLoading] = useState(false);
  const [gstLoading, setGstLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(true);
  const [mapRegion, setMapRegion] = useState({
    latitude: COIMBATORE_COORDS.latitude,
    longitude: COIMBATORE_COORDS.longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [selectedDistance, setSelectedDistance] = useState(0);
  const [isWithinRadius, setIsWithinRadius] = useState(true);
  const [destinationCoords, setDestinationCoords] = useState(null);

  // Haversine formula to calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };

  const updateDistanceAndValidation = (latitude, longitude) => {
    const distance = calculateDistance(
      COIMBATORE_COORDS.latitude,
      COIMBATORE_COORDS.longitude,
      latitude,
      longitude
    );
    setSelectedDistance(distance);
    setDeliveryDistance(Math.round(distance));
    const withinRadius = distance <= 25;
    setIsWithinRadius(withinRadius);
    if (!withinRadius) {
      Alert.alert(
        'Delivery Unavailable',
        'This location is outside our 25km delivery radius from RS Puram, Coimbatore. Please select a location within the radius.'
      );
    }
  };

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/cart`, {
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'X-User-Token': `Bearer ${accessTokens}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.data.statusCode === 200) {
          setCart(response.data.cart_items || []);
          setTotal(response.data.summary?.total_amount || 0);
        }
      } catch (error) {
        console.error('Cart fetch error:', error);
        Alert.alert('Error', 'Failed to load cart items');
      } finally {
        setCartLoading(false);
      }
    };
    if (apiToken && accessTokens) {
      fetchCart();
    } else {
      setCartLoading(false);
    }
  }, [apiToken, accessTokens]);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      const auth = await Geolocation.requestAuthorization('whenInUse');
      return auth === 'granted';
    } else {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location to show your current position on the map.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  };

  const getCurrentLocation = async () => {
    if (!Geolocation) {
      Alert.alert('Error', 'Location services not available on this platform');
      return;
    }

    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Location permission is required to get your current location.');
      return;
    }

    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        setMapRegion(newRegion);
        setDestinationCoords({ latitude, longitude });
        updateDistanceAndValidation(latitude, longitude);
        reverseGeocode(latitude, longitude);
      },
      (error) => {
        console.error(error);
        Alert.alert('Error', 'Failed to get current location');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handleRegionChange = (region) => {
    // Distance calculation is handled only on location selection, not on map scroll
  };

  const handleMapPress = (event) => {
    const { coordinate } = event.nativeEvent;
    setDestinationCoords(coordinate);
    updateDistanceAndValidation(coordinate.latitude, coordinate.longitude);
    reverseGeocode(coordinate.latitude, coordinate.longitude);
  };

  const handleDirectionsReady = (result) => {
    const distance = result.distance; // Distance in meters
    const distanceKm = distance / 1000;
    setSelectedDistance(distanceKm);
    setDeliveryDistance(Math.round(distanceKm));
    setIsWithinRadius(distanceKm <= 25);
  };

  const handleDirectionsError = (errorMessage) => {
    console.error('Directions error:', errorMessage);
    // Fallback to straight-line distance if directions fail
    if (destinationCoords) {
      updateDistanceAndValidation(destinationCoords.latitude, destinationCoords.longitude);
    }
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_APIKEY}`
      );
      if (response.data.results && response.data.results.length > 0) {
        const addressComponents = response.data.results[0].address_components;
        let street = '';
        let city = '';
        let state = '';
        let zip = '';
        addressComponents.forEach(component => {
          if (component.types.includes('street_number') || component.types.includes('route')) {
            street += component.long_name + ' ';
          }
          if (component.types.includes('locality')) {
            city = component.long_name;
          }
          if (component.types.includes('administrative_area_level_1')) {
            state = component.long_name;
          }
          if (component.types.includes('postal_code')) {
            zip = component.long_name;
          }
        });
        setShippingAddress(prev => ({
          ...prev,
          street: street.trim(),
          city,
          state,
          zip_code: zip,
        }));
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  const geocodePincode = async (pincode) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${pincode}+India&key=${GOOGLE_MAPS_APIKEY}`
      );
      if (response.data.results && response.data.results.length > 0) {
        const location = response.data.results[0].geometry.location;
        const newRegion = {
          ...mapRegion,
          latitude: location.lat,
          longitude: location.lng,
        };
        setMapRegion(newRegion);
        setDestinationCoords({ latitude: location.lat, longitude: location.lng });
        updateDistanceAndValidation(location.lat, location.lng);
        reverseGeocode(location.lat, location.lng);
      } else {
        Alert.alert('Invalid Pincode', 'Could not find location for the entered pincode.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      Alert.alert('Error', 'Failed to fetch location for pincode.');
    }
  };

  const fetchGSTDetails = async (gstNumber) => {
    if (!gstNumber || gstNumber.length < 15) return;
    setGstLoading(true);
    try {
      const response = await axios.get(`http://sheet.gstincheck.co.in/check/4234c3e5750dcf3d630bc09ff60d8ba3/${gstNumber}`);
      if (response.data && response.data.success) {
        const data = response.data.data;
        setBillingAddress(prev => ({
          ...prev,
          street: data.address || prev.street,
          city: data.city || prev.city,
          state: data.state || prev.state,
          zip_code: data.pincode || prev.zip_code,
        }));
        setShippingAddress(prev => ({
          ...prev,
          street: data.address || prev.street,
          city: data.city || prev.city,
          state: data.state || prev.state,
          zip_code: data.pincode || prev.zip_code,
        }));
      } else {
        Alert.alert('GST Error', 'Invalid GST number or unable to fetch details.');
      }
    } catch (error) {
      console.error('GST fetch error:', error);
      Alert.alert('Error', 'Failed to fetch GST details.');
    } finally {
      setGstLoading(false);
    }
  };

  const handleGSTChange = (text) => {
    setBillingAddress({ ...billingAddress, gst_number: text });
    if (text.length === 15) {
      fetchGSTDetails(text);
    }
  };

  const handlePlaceOrder = async () => {
    if (!shippingAddress.first_name || !shippingAddress.last_name || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zip_code) {
      Alert.alert('Error', 'Please fill in all shipping address details');
      return;
    }
    if (!billingAddress.first_name || !billingAddress.last_name || !billingAddress.street || !billingAddress.city || !billingAddress.state || !billingAddress.zip_code) {
      Alert.alert('Error', 'Please fill in all billing address details');
      return;
    }
    if (!isWithinRadius) {
      Alert.alert('Error', 'Delivery is only available within 25km radius from RS Puram, Coimbatore');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        shipping_address: shippingAddress,
        billing_address: billingAddress,
        payment_method: paymentMethod,
        notes: notes,
        delivery_distance: deliveryDistance,
      };
      const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/checkout`, payload, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'X-User-Token': `Bearer ${accessTokens}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.data.statusCode === 200) {
        Alert.alert(
          'Order Placed',
          'Your order has been placed successfully!',
          [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
        );
      } else {
        Alert.alert('Error', response.data.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderItem}>
      <Image source={{ uri: item.images[0]?.path }} style={styles.productImage} />
      <View style={styles.itemDetails}>
        <Text numberOfLines={2} style={styles.productName}>{item.product_name}</Text>
        <Text style={styles.itemPrice}>₹{item.price} x {item.quantity}</Text>
      </View>
      <Text style={styles.itemTotal}>₹{item.price * item.quantity}</Text>
    </View>
  );

  const renderMapSection = () => {
    if (Platform.OS === 'web' || !MapView) {
      return (
        <View style={styles.mapPlaceholder}>
          <Icon name="map-outline" size={48} color="#ccc" />
          <Text style={styles.mapPlaceholderText}>Map not available on web</Text>
        </View>
      );
    }

    return (
      <MapView
        style={styles.map}
        region={mapRegion}
        onRegionChangeComplete={handleRegionChange}
        onPress={handleMapPress}
      >
        <Marker
          coordinate={COIMBATORE_COORDS}
          pinColor="blue"
          title="RS Puram Center"
        />
        {destinationCoords && (
          <Marker
            coordinate={destinationCoords}
            pinColor="red"
            title="Delivery Location"
          />
        )}
        {destinationCoords && MapViewDirections && (
          <MapViewDirections
            origin={COIMBATORE_COORDS}
            destination={destinationCoords}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={3}
            strokeColor="#f67179"
            onReady={handleDirectionsReady}
            onError={handleDirectionsError}
          />
        )}
      </MapView>
    );
  };

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back-outline" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Image source={require('./../assets/logo-brand.png')} style={styles.logo} />
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Icon name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Checkout</Text>

          {/* Order Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            {cartLoading ? (
              <ActivityIndicator size="large" color="#f67179" style={styles.loading} />
            ) : cart.length > 0 ? (
              <FlatList
                data={cart}
                keyExtractor={(item) => item.cart_item_id.toString()}
                renderItem={renderOrderItem}
                scrollEnabled={false}
                contentContainerStyle={styles.orderList}
              />
            ) : (
              <Text style={styles.emptyCartText}>No items in cart</Text>
            )}
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>₹{parseFloat(total).toFixed(2)}</Text>
            </View>
          </View>

          {/* Shipping Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            <View style={styles.nameContainer}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="First Name"
                value={shippingAddress.first_name}
                onChangeText={(text) => setShippingAddress({ ...shippingAddress, first_name: text })}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Last Name"
                value={shippingAddress.last_name}
                onChangeText={(text) => setShippingAddress({ ...shippingAddress, last_name: text })}
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Street Address"
              value={shippingAddress.street}
              onChangeText={(text) => setShippingAddress({ ...shippingAddress, street: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="City"
              value={shippingAddress.city}
              onChangeText={(text) => setShippingAddress({ ...shippingAddress, city: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="State"
              value={shippingAddress.state}
              onChangeText={(text) => setShippingAddress({ ...shippingAddress, state: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Zip Code"
              keyboardType="numeric"
              value={shippingAddress.zip_code}
              onChangeText={(text) => {
                setShippingAddress({ ...shippingAddress, zip_code: text });
                if (text.length === 6) {
                  geocodePincode(text);
                }
              }}
            />
            {Platform.OS !== 'web' && (
              <TouchableOpacity style={styles.locationBtn} onPress={getCurrentLocation}>
                <Icon name="location-outline" size={20} color="#fff" />
                <Text style={styles.locationBtnText}>Use Current Location</Text>
              </TouchableOpacity>
            )}
            <View style={styles.distanceContainer}>
              <Text style={[styles.distanceText, !isWithinRadius && styles.errorText]}>
                Distance from RS Puram: {selectedDistance.toFixed(2)} km
                {!isWithinRadius && ' (Outside 25km delivery radius)'}
              </Text>
            </View>
            {renderMapSection()}
            <Text style={styles.mapInstruction}>
              Tap on the map to select your delivery location and see the route
            </Text>
          </View>

          {/* Billing Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Billing Address</Text>
            <View style={styles.nameContainer}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="First Name"
                value={billingAddress.first_name}
                onChangeText={(text) => setBillingAddress({ ...billingAddress, first_name: text })}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Last Name"
                value={billingAddress.last_name}
                onChangeText={(text) => setBillingAddress({ ...billingAddress, last_name: text })}
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="GST Number (15 digits)"
              value={billingAddress.gst_number}
              onChangeText={handleGSTChange}
              maxLength={15}
            />
            {gstLoading && <ActivityIndicator size="small" color="#f67179" />}
            <TextInput
              style={styles.input}
              placeholder="Street Address"
              value={billingAddress.street}
              onChangeText={(text) => setBillingAddress({ ...billingAddress, street: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="City"
              value={billingAddress.city}
              onChangeText={(text) => setBillingAddress({ ...billingAddress, city: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="State"
              value={billingAddress.state}
              onChangeText={(text) => setBillingAddress({ ...billingAddress, state: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Zip Code"
              keyboardType="numeric"
              value={billingAddress.zip_code}
              onChangeText={(text) => setBillingAddress({ ...billingAddress, zip_code: text })}
            />
          </View>

          {/* Payment Method */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <TouchableOpacity
              style={[styles.paymentOption, paymentMethod === 'cash_on_delivery' && styles.selectedPayment]}
              onPress={() => setPaymentMethod('cash_on_delivery')}
            >
              <View style={styles.paymentRow}>
                <Icon name="cash-outline" size={24} color="#f67179" />
                <Text style={styles.paymentText}>Cash on Delivery</Text>
              </View>
            </TouchableOpacity>
            {/* Add more payment options if needed */}
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Add any special instructions..."
              multiline
              numberOfLines={3}
              value={notes}
              onChangeText={setNotes}
            />
          </View>

          {/* Place Order Button */}
          <TouchableOpacity
            style={[
              styles.placeOrderBtn,
              (!isWithinRadius || loading) && styles.disabledBtn
            ]}
            onPress={handlePlaceOrder}
            disabled={loading || !isWithinRadius}
          >
            {loading ? <ActivityIndicator size="small" color="#fff" /> : <Icon name="card-outline" size={20} color="#fff" style={styles.btnIcon} />}
            <Text style={styles.placeOrderText}>{loading ? 'Placing Order...' : 'Place Order'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 5,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  notificationButton: {
    padding: 5,
  },
  logo: {
    width: 100,
    height: 40,
    resizeMode: 'contain',
  },
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContainer: { padding: 20 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 20,
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  orderList: {
    paddingBottom: 10,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productImage: { width: 60, height: 60, resizeMode: 'contain', marginRight: 15, borderRadius: 8 },
  itemDetails: { flex: 1 },
  productName: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 5 },
  itemPrice: { fontSize: 14, color: '#666' },
  itemTotal: { fontSize: 16, fontWeight: 'bold', color: '#f67179' },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalLabel: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  totalAmount: { fontSize: 20, fontWeight: 'bold', color: '#f67179' },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
    marginRight: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  locationBtn: {
    backgroundColor: '#f67179',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  locationBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  distanceContainer: {
    marginBottom: 10,
  },
  distanceText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    color: '#f44336',
    fontWeight: 'bold',
  },
  map: { height: 200, marginTop: 10, borderRadius: 8 },
  mapPlaceholder: {
    height: 200,
    marginTop: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  mapPlaceholderText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  mapInstruction: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  selectedPayment: {
    borderWidth: 2,
    borderColor: '#f67179',
  },
  paymentOption: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentText: { fontSize: 18, fontWeight: '600', color: '#333', marginLeft: 10 },
  placeOrderBtn: {
    backgroundColor: '#f67179',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  disabledBtn: {
    backgroundColor: '#ccc',
    elevation: 0,
    shadowOpacity: 0,
  },
  btnIcon: {
    marginRight: 8,
  },
  placeOrderText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  loading: { marginVertical: 20 },
  emptyCartText: { fontSize: 16, color: '#666', textAlign: 'center', marginVertical: 20 },
});
