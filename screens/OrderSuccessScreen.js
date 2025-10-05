import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import InnerHeader from './../components/InnerHeader';

export default function OrderSuccessScreen({ route, navigation }) {
  const { order } = route.params;

  const shippingAddress = JSON.parse(order.shipping_address);
  const billingAddress = JSON.parse(order.billing_address);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs', params: { screen: 'Home' } }],
        });
        return true;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => backHandler.remove();
    }, [navigation])
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <InnerHeader showSearch={false} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Success Icon and Message */}
        <View style={styles.successSection}>
          <View style={styles.iconContainer}>
            <Icon name="checkmark-circle" size={80} color="#4CAF50" />
          </View>
          <Text style={styles.successTitle}>Order Placed Successfully!</Text>
          <Text style={styles.successSubtitle}>
            Thank you for shopping with BuyTown. Your order has been confirmed.
          </Text>
        </View>

        {/* Order Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Order Number:</Text>
            <Text style={styles.value}>{order.order_number}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Order Date:</Text>
            <Text style={styles.value}>{new Date(order.order_date).toLocaleDateString()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Status:</Text>
            <Text style={[styles.value, styles.statusText]}>{order.status.replace('_', ' ').toUpperCase()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Payment Method:</Text>
            <Text style={styles.value}>{order.payment_method.replace('_', ' ').toUpperCase()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Payment Status:</Text>
            <Text style={styles.value}>{order.payment_status.toUpperCase()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Delivery Distance:</Text>
            <Text style={styles.value}>{order.delivery_distance} km</Text>
          </View>
          {order.notes && (
            <View style={styles.detailRow}>
              <Text style={styles.label}>Notes:</Text>
              <Text style={styles.value}>{order.notes}</Text>
            </View>
          )}
        </View>

        {/* Amount Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amount Breakdown</Text>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Subtotal:</Text>
            <Text style={styles.value}>₹{parseFloat(order.subtotal).toFixed(2)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Tax:</Text>
            <Text style={styles.value}>₹{parseFloat(order.tax_amount).toFixed(2)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Shipping:</Text>
            <Text style={styles.value}>₹{parseFloat(order.shipping_amount).toFixed(2)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Discount:</Text>
            <Text style={styles.value}>-₹{parseFloat(order.discount_amount).toFixed(2)}</Text>
          </View>
          <View style={[styles.detailRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>₹{parseFloat(order.total_amount).toFixed(2)}</Text>
          </View>
        </View>

        {/* Shipping Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <Text style={styles.addressText}>
            {shippingAddress.first_name} {shippingAddress.last_name}
          </Text>
          <Text style={styles.addressText}>{shippingAddress.street}</Text>
          <Text style={styles.addressText}>
            {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip_code}
          </Text>
          <Text style={styles.addressText}>{shippingAddress.country}</Text>
        </View>

        {/* Billing Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Billing Address</Text>
          <Text style={styles.addressText}>
            {billingAddress.first_name} {billingAddress.last_name}
          </Text>
          <Text style={styles.addressText}>{billingAddress.street}</Text>
          <Text style={styles.addressText}>
            {billingAddress.city}, {billingAddress.state} {billingAddress.zip_code}
          </Text>
          <Text style={styles.addressText}>{billingAddress.country}</Text>
          {billingAddress.gst_number && (
            <Text style={styles.addressText}>GST: {billingAddress.gst_number}</Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs', params: { screen: 'Home' } }],
            })}
          >
            <Text style={styles.primaryButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs', params: { screen: 'Account' } }],
            })}
          >
            <Text style={styles.secondaryButtonText}>View My Orders</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  successSection: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
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
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  statusText: {
    color: '#4CAF50',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F44336',
  },
  addressText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  buttonContainer: {
    marginTop: 20,
  },
  primaryButton: {
    backgroundColor: '#000000',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F44336',
  },
  secondaryButtonText: {
    color: '#F44336',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
