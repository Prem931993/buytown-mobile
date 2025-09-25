import React, { useContext, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, SafeAreaView, TextInput, Alert, ScrollView } from 'react-native';
import InnerHeader from './../components/InnerHeader';
import { AppContext } from './../ContextAPI/ContextAPI';

export default function CheckoutScreen({ navigation }) {
  const { cart, getTotal } = useContext(AppContext);
  const [deliveryDetails, setDeliveryDetails] = useState({
    name: '',
    phone: '',
    address: '',
  });

  const total = getTotal();

  const handlePlaceOrder = () => {
    if (!deliveryDetails.name || !deliveryDetails.phone || !deliveryDetails.address) {
      Alert.alert('Error', 'Please fill in all delivery details');
      return;
    }
    // Here you would typically send the order to the backend
    Alert.alert(
      'Order Placed',
      'Your order has been placed successfully!',
      [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
    );
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderItem}>
      <Image source={{ uri: item.images[0]?.path }} style={styles.productImage} />
      <View style={styles.itemDetails}>
        <Text numberOfLines={2} style={styles.productName}>{item.name}</Text>
        <Text style={styles.itemPrice}>₹{item.selling_price} x {item.quantity}</Text>
      </View>
      <Text style={styles.itemTotal}>₹{item.selling_price * item.quantity}</Text>
    </View>
  );

  return (
    <>
      <InnerHeader />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Checkout</Text>

          {/* Order Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <FlatList
              data={cart}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderOrderItem}
              scrollEnabled={false}
            />
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>₹{total}</Text>
            </View>
          </View>

          {/* Delivery Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Details</Text>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={deliveryDetails.name}
              onChangeText={(text) => setDeliveryDetails({ ...deliveryDetails, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              keyboardType="phone-pad"
              value={deliveryDetails.phone}
              onChangeText={(text) => setDeliveryDetails({ ...deliveryDetails, phone: text })}
            />
            <TextInput
              style={[styles.input, styles.addressInput]}
              placeholder="Delivery Address"
              multiline
              numberOfLines={3}
              value={deliveryDetails.address}
              onChangeText={(text) => setDeliveryDetails({ ...deliveryDetails, address: text })}
            />
          </View>

          {/* Payment Method */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.paymentOption}>
              <Text style={styles.paymentText}>Cash on Delivery</Text>
            </View>
          </View>

          {/* Place Order Button */}
          <TouchableOpacity
            style={styles.placeOrderBtn}
            onPress={handlePlaceOrder}
          >
            <Text style={styles.placeOrderText}>Place Order</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContainer: { padding: 15 },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 6,
    marginBottom: 15,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  productImage: { width: 50, height: 50, resizeMode: 'contain', marginRight: 10 },
  itemDetails: { flex: 1 },
  productName: { fontWeight: '600', marginBottom: 4 },
  itemPrice: { fontSize: 14, color: '#666' },
  itemTotal: { fontWeight: 'bold', fontSize: 16 },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: { fontSize: 18, fontWeight: 'bold' },
  totalAmount: { fontSize: 18, fontWeight: 'bold', color: '#f67179' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  addressInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  paymentOption: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 6,
  },
  paymentText: { fontSize: 16, fontWeight: 'bold' },
  placeOrderBtn: {
    backgroundColor: '#f67179',
    paddingVertical: 15,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  placeOrderText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});
