import React, { useContext, useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, TextInput, Alert, ScrollView, ActivityIndicator, Platform, Modal, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppContext } from './../ContextAPI/ContextAPI';
import { Colors } from '../constants/theme';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import InnerHeader from './../components/InnerHeader';
import { createCashfreeOrder, createUPILinkSession, getOrderDetails } from '../auth/paymentServices';

// Conditionally import WebView only for native platforms
let WebView;
if (Platform.OS !== 'web') {
  WebView = require('react-native-webview').default;
}

// Conditionally import map components only for native platforms
let MapView, Marker, PROVIDER_GOOGLE;

if (Platform.OS !== 'web') {
  try {
    MapView = require('react-native-maps').default;
    Marker = require('react-native-maps').Marker;
    PROVIDER_GOOGLE = require('react-native-maps').PROVIDER_GOOGLE;
  } catch (error) {
    console.warn('Map components not available on this platform:', error.message);
  }
}

// RS Puram, Coimbatore coordinates
const COIMBATORE_COORDS = {
  latitude: 11.010403,
  longitude: 76.949903,
};

const GOOGLE_MAPS_API_KEY = 'AIzaSyDao7PSifrnHW0ly7XDAHASdb5wJneSSPQ';

export default function CheckoutScreen({ navigation, route }) {
  const { apiToken, accessTokens } = useContext(AppContext);
  const { buyNowProduct, quantity: buyNowQuantity } = route.params || {};
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
  const [isMapFullScreen, setIsMapFullScreen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [qrData, setQrData] = useState(null);
  const [showWebView, setShowWebView] = useState(false);

  const handlePaymentNavigation = async (navState) => {
    const url = navState.url;
    if (url.includes('success') || url.includes('thankyou') || url.includes('payment_status=SUCCESS')) {
      setShowWebView(false);
      navigation.navigate('OrderProcessingScreen', { order: currentOrder });
    } else if (url.includes('failure') || url.includes('failed') || url.includes('payment_status=FAILED')) {
      setShowWebView(false);
      Alert.alert('Payment Failed', 'Please try again or choose a different payment method.');
    }
  };

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

  // Function to get driving distance from Google Maps Directions API
  const getDrivingDistance = async (origin, destination) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&mode=driving&key=${GOOGLE_MAPS_API_KEY}`
      );
      if (response.data.status === 'OK' && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        if (route.legs && route.legs.length > 0) {
          const distance = route.legs[0].distance.value / 1000; // meters to km
          return distance;
        }
      }
    } catch (error) {
      console.error('Driving distance fetch error:', error);
    }
    // Fallback to Haversine formula
    return calculateDistance(origin.latitude, origin.longitude, destination.latitude, destination.longitude);
  };

  const updateDistanceAndValidation = async (latitude, longitude) => {
    const distance = await getDrivingDistance(COIMBATORE_COORDS, { latitude, longitude });
    setSelectedDistance(distance);
    setDeliveryDistance(distance);
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
      if (buyNowProduct) {
        // Add buy now product to cart
        try {
          await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/cart/add`, {
            product_id: buyNowProduct.id,
            quantity: buyNowQuantity || 1
          }, {
            headers: {
              Authorization: `Bearer ${apiToken}`,
              'X-User-Token': `Bearer ${accessTokens}`,
              'Content-Type': 'application/json',
            },
          });
        } catch (error) {
          console.error('Add to cart error:', error);
          Alert.alert('Error', 'Failed to add item to cart');
        }
      }
      // Fetch cart (regular or updated with buy now)
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

    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/api/v1/auth/user/profile`, {
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'X-User-Token': `Bearer ${accessTokens}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.data.statusCode === 200) {
          const user = response.data.user;
          setUserProfile(user);
          setBillingAddress(prev => ({
            ...prev,
            first_name: user.firstname || prev.first_name,
            last_name: user.lastname || prev.last_name,
            gst_number: user.gstin || prev.gst_number,
            // Add other fields if available
          }));
          setShippingAddress(prev => ({
            ...prev,
            first_name: user.firstname || prev.first_name,
            last_name: user.lastname || prev.last_name,
          }));
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
      }
    };

    if (apiToken && accessTokens) {
      fetchCart();
      fetchProfile();
    } else {
      setCartLoading(false);
    }


  }, [apiToken, accessTokens, buyNowProduct, buyNowQuantity]);



  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to get your current location.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 15000,
      });

      const { latitude, longitude } = location.coords;
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
    } catch (error) {
      console.error('getCurrentLocation error:', error);
      Alert.alert('Error', `Failed to get current location: ${error.message || 'Unknown error'}`);
    }
  };

  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'mapClick') {
        setDestinationCoords({ latitude: data.lat, longitude: data.lng });

        if (data.distance) {
          setSelectedDistance(data.distance);
          setDeliveryDistance(data.distance);
          setIsWithinRadius(data.distance <= 25);
        }

        if (data.addressData) {
          setShippingAddress(prev => ({
            ...prev,
            ...data.addressData,
          }));
        }
      }
    } catch (error) {
      console.error('WebView message error:', error);
    }
  };


  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
      );
      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];
        const addressComponents = result.address_components;

        let locality = '';
        let admin2 = '';
        let state = '';
        let zip_code = '';
        addressComponents.forEach(component => {
          if (component.types.includes('locality')) {
            locality = component.long_name;
          }
          if (component.types.includes('administrative_area_level_2')) {
            admin2 = component.long_name;
          }
          if (component.types.includes('administrative_area_level_1')) {
            state = component.long_name;
          }
          if (component.types.includes('postal_code')) {
            zip_code = component.long_name;
          }
        });
        let city = admin2 || locality;
        let parts = result.formatted_address.split(', ');
        let cityIndex = parts.findIndex(p => p === city);
        let street = cityIndex > 0 ? parts.slice(0, cityIndex).join(', ') : result.formatted_address;
        setShippingAddress(prev => ({
          ...prev,
          street,
          city,
          state,
          zip_code,
        }));
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  const geocodePincode = async (pincode) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${pincode},India&key=${GOOGLE_MAPS_API_KEY}`
      );
      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];
        const lat = result.geometry.location.lat;
        const lng = result.geometry.location.lng;
        const newRegion = {
          ...mapRegion,
          latitude: lat,
          longitude: lng,
        };
        setMapRegion(newRegion);
        setDestinationCoords({ latitude: lat, longitude: lng });
        updateDistanceAndValidation(lat, lng);
        reverseGeocode(lat, lng);
      } else {
        Alert.alert('Invalid Pincode', 'Could not find location for the entered pincode.');
      }
    } catch (error) {
      console.error('Google geocoding error:', error);
      Alert.alert('Error', 'Failed to fetch location for pincode.');
    }
  };

  const fetchGSTDetails = async (gstNumber) => {
    if (!gstNumber || gstNumber.length < 15) return;
    setGstLoading(true);
    try {
      const response = await axios.post('https://gst-verification.p.rapidapi.com/v3/tasks/sync/verify_with_source/ind_gst_certificate', {
        task_id: '74f4c926-250c-43ca-9c53-453e87ceacd1',
        group_id: '8e16424a-58fc-4ba4-ab20-5bc8e7c3c41e',
        data: { gstin: gstNumber }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-host': 'gst-verification.p.rapidapi.com',
          'x-rapidapi-key': 'dde12f15eemsha9b21be25825a20p1e707ajsn9091b64f86f0'
        }
      });
      if (response.data && response.data.status === 'completed' && response.data.result?.source_output?.status === 'id_found') {
        const address = response.data.result.source_output.principal_place_of_business_fields?.principal_place_of_business_address;
        setBillingAddress(prev => ({
          ...prev,
          street: address?.street || prev.street,
          city: address?.location || prev.city,
          state: address?.state_name || prev.state,
          zip_code: address?.pincode || prev.zip_code,
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







  const initiateUPILinkPayment = async (orderId) => {
    if (!userProfile) {
      Alert.alert('Error', 'User profile not loaded. Please try again.');
      return;
    }

    try {
      const orderData = {
        order_id: String(orderId),
        order_amount: String(total.toFixed(2)),
        order_currency: "INR",
        customer_details: {
          customer_id: String(userProfile.id) || 'user_' + Date.now(),
          customer_email: userProfile.email || 'test@example.com',
          customer_phone: userProfile.phone_number || '9876543210',
        },
        order_meta: {
          notify_url: `${process.env.EXPO_PUBLIC_API_URL}/api/v1/payments/cashfree/webhook`,
        },
      };

      const response = await createCashfreeOrder(orderData, apiToken, accessTokens);

      if (response.message === 'Cashfree order created successfully' && response.data.payment_session_id) {
        let sessionId = response.data.payment_session_id;

        const upiResponse = await createUPILinkSession(sessionId);

        if (upiResponse.data && upiResponse.data.payload.web) {
          const upiLink = upiResponse.data.payload.web;
          setPaymentUrl(upiLink);
          setShowWebView(true);
        } else {
          Alert.alert('Error', 'Failed to generate UPI Link');
        }
      } else {
        Alert.alert('Error', 'Failed to initiate UPI Link payment or session not received');
      }
    } catch (error) {
      console.error('Initiate UPI Link payment error:', error);
      Alert.alert('Error', 'Failed to initiate UPI Link payment');
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
    if (paymentMethod === 'upi_link') {
      // Place the order first
      const orderPayload = {
        shipping_address: shippingAddress,
        billing_address: billingAddress,
        payment_method: paymentMethod,
        notes: notes,
        delivery_distance: deliveryDistance,
      };
      const orderResponse = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/checkout`, orderPayload, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'X-User-Token': `Bearer ${accessTokens}`,
          'Content-Type': 'application/json',
        },
      });
      if (orderResponse.data.statusCode === 201) {
        const order = orderResponse.data.order;
        setCurrentOrder(order);
        await initiateUPILinkPayment(order.id);
      } else {
        Alert.alert('Error', orderResponse.data.message || 'Failed to place order');
      }
    } else {
      // Cash on Delivery
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
      if (response.data.statusCode === 201) {
        const order = response.data.order;
        const orderDetails = await getOrderDetails(order.id, apiToken, accessTokens);
        navigation.navigate('OrderSuccessScreen', { order: orderDetails.order });
      } else {
        Alert.alert('Error', response.data.message || 'Failed to place order');
      }
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

  const renderMap = (fullScreen = false) => {
    const mapStyle = fullScreen ? styles.fullScreenMap : styles.map;
    const mapHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Map</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry,directions"></script>
        <style>
          body { margin: 0; padding: 0; touch-action: manipulation; }
          #map { height: 100vh; width: 100vw; touch-action: manipulation; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          let map;
          let centerMarker;
          let destMarker;
          let directionsService;
          let directionsRenderer;

          function initMap() {
            map = new google.maps.Map(document.getElementById('map'), {
              center: { lat: ${mapRegion.latitude}, lng: ${mapRegion.longitude} },
              zoom: 15,
              mapTypeId: google.maps.MapTypeId.ROADMAP
            });

            directionsService = new google.maps.DirectionsService();
            directionsRenderer = new google.maps.DirectionsRenderer({
              suppressMarkers: true,
              preserveViewport: true
            });
            directionsRenderer.setMap(map);

            centerMarker = new google.maps.Marker({
              position: { lat: ${COIMBATORE_COORDS.latitude}, lng: ${COIMBATORE_COORDS.longitude} },
              map: map,
              title: 'Coimbatore Center'
            });

            ${destinationCoords ? `
            destMarker = new google.maps.Marker({
              position: { lat: ${destinationCoords.latitude}, lng: ${destinationCoords.longitude} },
              map: map,
              title: 'Delivery Location'
            });
            calculateAndDisplayRoute({ lat: ${destinationCoords.latitude}, lng: ${destinationCoords.longitude} });
            ` : ''}

            map.addListener('click', function(e) {
              const lat = e.latLng.lat();
              const lng = e.latLng.lng();

              // Clear previous destination marker and route
              if (destMarker) {
                destMarker.setMap(null);
              }
              directionsRenderer.setDirections({ routes: [] });

              // Add new destination marker
              destMarker = new google.maps.Marker({
                position: { lat, lng },
                map: map,
                title: 'Delivery Location'
              });

              // Calculate and display route
              calculateAndDisplayRoute({ lat, lng });

              // Fetch human-readable address from Google Maps API
              fetch(\`https://maps.googleapis.com/maps/api/geocode/json?latlng=\${lat},\${lng}&key=${GOOGLE_MAPS_API_KEY}\`)
                .then(addrRes => addrRes.json())
                .then(addrData => {
                  let addressData = null;
                  if (addrData.status === 'OK' && addrData.results.length > 0) {
                    const result = addrData.results[0];
                    const components = result.address_components;
                    let locality = '';
                    let admin2 = '';
                    let city = '';
                    let state = '';
                    let zip_code = '';
                    components.forEach(component => {
                      if (component.types.includes('locality')) {
                        locality = component.long_name;
                      }
                      if (component.types.includes('administrative_area_level_2')) {
                        admin2 = component.long_name;
                      }
                      if (component.types.includes('administrative_area_level_1')) {
                        state = component.long_name;
                      }
                      if (component.types.includes('postal_code')) {
                        zip_code = component.long_name;
                      }
                    });
                    city = admin2 || locality;
                    let parts = result.formatted_address.split(', ');
                    let cityIndex = parts.findIndex(p => p === city);
                    let street = cityIndex > 0 ? parts.slice(0, cityIndex).join(', ') : result.formatted_address;
                    addressData = {
                      street,
                      city,
                      state,
                      zip_code
                    };
                  }
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'mapClick',
                    lat,
                    lng,
                    distance: currentRouteDistance,
                    addressData
                  }));
                })
                .catch(err => {
                  console.error('Reverse geocoding error:', err);
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'mapClick',
                    lat,
                    lng,
                    distance: currentRouteDistance,
                    addressData: null
                  }));
                });
            });
          }

          let currentRouteDistance = 0;

          function calculateAndDisplayRoute(destination) {
            const request = {
              origin: { lat: ${COIMBATORE_COORDS.latitude}, lng: ${COIMBATORE_COORDS.longitude} },
              destination: destination,
              travelMode: google.maps.TravelMode.DRIVING
            };

            directionsService.route(request, function(result, status) {
              if (status === google.maps.DirectionsStatus.OK) {
                directionsRenderer.setDirections(result);
                const route = result.routes[0];
                if (route && route.legs && route.legs.length > 0) {
                  currentRouteDistance = route.legs[0].distance.value / 1000; // meters to km
                }
              } else {
                console.error('Directions request failed due to ' + status);
                // Fallback to straight line distance
                const centerPoint = new google.maps.LatLng(${COIMBATORE_COORDS.latitude}, ${COIMBATORE_COORDS.longitude});
                const destPoint = new google.maps.LatLng(destination.lat, destination.lng);
                currentRouteDistance = google.maps.geometry.spherical.computeDistanceBetween(centerPoint, destPoint) / 1000;
              }
            });
          }

          window.onload = initMap;
        </script>
      </body>
      </html>
    `;
    const mapContent = (
      <WebView
        source={{ html: mapHtml }}
        style={mapStyle}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    );
    if (fullScreen) {
      return mapContent;
    }
    return (
      <View style={styles.mapContainer}>
        {mapContent}
        <TouchableOpacity style={styles.fullScreenButton} onPress={() => setIsMapFullScreen(true)}>
          <Icon name="expand-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };



  return (
    <>
      <SafeAreaView style={styles.container} edges={['top']}>
        <InnerHeader showSearch={false} />
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
            {renderMap()}
            <Text style={styles.mapInstruction}>
              Tap on the map to select your delivery location
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
            <Text style={styles.sectionSubtitle}>Choose your preferred payment option</Text>
            <TouchableOpacity
              style={[styles.paymentCard, paymentMethod === 'cash_on_delivery' && styles.selectedPaymentCard]}
              onPress={() => setPaymentMethod('cash_on_delivery')}
            >
              <View style={styles.paymentCardContent}>
                <View style={styles.radioContainer}>
                  <Icon
                    name={paymentMethod === 'cash_on_delivery' ? "radio-button-on" : "radio-button-off"}
                    size={20}
                    color={paymentMethod === 'cash_on_delivery' ? "#f67179" : "#ccc"}
                  />
                </View>
                <View style={styles.iconContainer}>
                  <Icon name="cash-outline" size={32} color="#f67179" />
                </View>
                <View style={styles.paymentDetails}>
                  <Text style={styles.paymentText}>Cash on Delivery</Text>
                  <Text style={styles.paymentSubtext}>Pay when you receive your order</Text>
                </View>
              </View>
            </TouchableOpacity>
            {Platform.OS !== 'web' && (
              <TouchableOpacity
                style={[styles.paymentCard, paymentMethod === 'upi_link' && styles.selectedPaymentCard]}
                onPress={() => setPaymentMethod('upi_link')}
              >
                <View style={styles.paymentCardContent}>
                  <View style={styles.radioContainer}>
                  <Icon
                    name={paymentMethod === 'upi_link' ? "radio-button-on" : "radio-button-off"}
                    size={20}
                    color={paymentMethod === 'upi_link' ? "#f67179" : "#ccc"}
                  />
                  </View>
                  <View style={styles.iconContainer}>
                    <Icon name="link-outline" size={32} color="#f67179" />
                  </View>
                  <View style={styles.paymentDetails}>
                    <Text style={styles.paymentText}>UPI Payment</Text>
                    <Text style={styles.paymentSubtext}>Instant payment via UPI apps</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
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
      <Modal visible={isMapFullScreen} animationType="slide" onRequestClose={() => setIsMapFullScreen(false)}>
        <View style={styles.fullScreenMapContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setIsMapFullScreen(false)}>
            <Icon name="close-outline" size={30} color="#fff" />
          </TouchableOpacity>
          {renderMap(true)}
        </View>
      </Modal>
      <Modal visible={showWebView} animationType="slide" onRequestClose={() => setShowWebView(false)}>
        <View style={styles.paymentModalContainer}>
          <WebView
            source={{ uri: paymentUrl }}
            style={styles.webView}
            onNavigationStateChange={handlePaymentNavigation}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        </View>
      </Modal>


    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scrollContainer: { padding: 20, backgroundColor: '#f9f9f9' },
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
  sectionSubtitle: {
    fontSize: 16,
    color: '#666',
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
    backgroundColor: '#000000',
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
  map: { height: 300, marginTop: 10, borderRadius: 8 },
  mapContainer: {
    position: 'relative',
    overflow: 'visible',
    pointerEvents: 'box-none',
  },
  fullScreenButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 25,
    padding: 12,
    zIndex: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fullScreenMap: {
    flex: 1,
  },
  fullScreenMapContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
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
  paymentCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedPaymentCard: {
    borderWidth: 2,
    borderColor: '#f67179',
    backgroundColor: '#fef7f8',
  },
  paymentCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioContainer: {
    marginRight: 20,
  },
  iconContainer: {
    marginRight: 15,
  },
  paymentDetails: {
    flex: 1,
  },
  paymentText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  paymentSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  placeOrderBtn: {
    backgroundColor: '#000000',
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
  paymentModalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  webView: {
    flex: 1,
  },
  webViewPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  webViewPlaceholderText: {
    fontSize: 16,
    color: '#666',
  },
});
