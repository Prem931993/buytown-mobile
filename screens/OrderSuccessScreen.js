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

  const shippingAddress = order.shippingAddress || (order.shipping_address ? JSON.parse(order.shipping_address) : {});
  const billingAddress = order.billingAddress || (order.billing_address ? JSON.parse(order.billing_address) : {});

  const getOrderDate = () => new Date(order.orderDate || order.order_date).toLocaleDateString();
  const getPaymentMethod = () => (order.paymentMethod || order.payment_method || '').replace('_', ' ').toUpperCase();
  const getPaymentStatus = () => (order.paymentStatus || order.payment_status || '').toUpperCase();
  const getDeliveryDistance = () => (order.deliveryDistance || order.delivery_distance || 0) + ' km';
  const getSubtotal = () => parseFloat(order.subtotal || 0).toFixed(2);
  const getTax = () => parseFloat(order.tax || order.tax_amount || 0).toFixed(2);
  const getShipping = () => parseFloat(order.shippingCost || order.shipping_amount || 0).toFixed(2);
  const getDiscount = () => parseFloat(order.discount || order.discount_amount || 0).toFixed(2);
  const getTotal = () => parseFloat(order.total || order.total_amount || 0).toFixed(2);
  const getStatus = () => (order.status || '').replace('_', ' ').toUpperCase();
  const getNotes = () => order.notes || '';

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
      <InnerHeader showSearch={false} showBackButton={false} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Success Icon and Message */}
        <View style={styles.successSection}>
          <View style={styles.iconContainer}>
            <Icon name="checkmark-circle" size={80} color="#4CAF50" />
          </View>
          <Text style={styles.successTitle}>Order Placed Successfully!</Text>
          <Text style={styles.successSubtitle}>
            Thank you for shopping with BuyTown. Your order is awaiting confirmation.
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
            <Text style={styles.value}>{getOrderDate()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Status:</Text>
            <Text style={[styles.value, styles.statusText]}>{getStatus()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Payment Method:</Text>
            <Text style={styles.value}>{getPaymentMethod()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Payment Status:</Text>
            <Text style={styles.value}>{getPaymentStatus()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Delivery Distance:</Text>
            <Text style={styles.value}>{getDeliveryDistance()}</Text>
          </View>
          {getNotes() && (
            <View style={styles.detailRow}>
              <Text style={styles.label}>Notes:</Text>
              <Text style={styles.value}>{getNotes()}</Text>
            </View>
          )}
        </View>

        {/* Amount Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amount Breakdown</Text>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Subtotal:</Text>
            <Text style={styles.value}>₹{getSubtotal()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Tax:</Text>
            <Text style={styles.value}>₹{getTax()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Shipping:</Text>
            <Text style={styles.value}>₹{getShipping()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Discount:</Text>
            <Text style={styles.value}>-₹{getDiscount()}</Text>
          </View>
          <View style={[styles.detailRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>₹{getTotal()}</Text>
          </View>
        </View>

        {/* Shipping Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <Text style={styles.addressText}>
            {shippingAddress.first_name || ''} {shippingAddress.last_name || ''}
          </Text>
          <Text style={styles.addressText}>{shippingAddress.street || ''}</Text>
          <Text style={styles.addressText}>
            {shippingAddress.city || ''}, {shippingAddress.state || ''} {shippingAddress.zip_code || ''}
          </Text>
          <Text style={styles.addressText}>{shippingAddress.country || ''}</Text>
        </View>

        {/* Billing Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Billing Address</Text>
          <Text style={styles.addressText}>
            {billingAddress.first_name || ''} {billingAddress.last_name || ''}
          </Text>
          <Text style={styles.addressText}>{billingAddress.street || ''}</Text>
          <Text style={styles.addressText}>
            {billingAddress.city || ''}, {billingAddress.state || ''} {billingAddress.zip_code || ''}
          </Text>
          <Text style={styles.addressText}>{billingAddress.country || ''}</Text>
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
    paddingBottom: 50,
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
