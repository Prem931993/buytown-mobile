import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

export default function OrderDetailScreen({ route, navigation }) {
  const { order } = route.params;

  const shippingAddress = JSON.parse(order.shipping_address);
  const billingAddress = JSON.parse(order.billing_address);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back-outline" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Order Details</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
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
            <Text style={styles.label}>Delivery Charges:</Text>
            <Text style={styles.value}>₹{parseFloat(order.delivery_charges).toFixed(2)}</Text>
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
          {(shippingAddress.first_name || shippingAddress.last_name) && (
            <Text style={styles.addressText}>
              {shippingAddress.first_name} {shippingAddress.last_name}
            </Text>
          )}
          <Text style={styles.addressText}>{shippingAddress.street}</Text>
          <Text style={styles.addressText}>
            {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip_code}
          </Text>
          <Text style={styles.addressText}>{shippingAddress.country}</Text>
        </View>

        {/* Billing Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Billing Address</Text>
          {(billingAddress.first_name || billingAddress.last_name) && (
            <Text style={styles.addressText}>
              {billingAddress.first_name} {billingAddress.last_name}
            </Text>
          )}
          <Text style={styles.addressText}>{billingAddress.street}</Text>
          <Text style={styles.addressText}>
            {billingAddress.city}, {billingAddress.state} {billingAddress.zip_code}
          </Text>
          <Text style={styles.addressText}>{billingAddress.country}</Text>
          {billingAddress.gst_number && (
            <Text style={styles.addressText}>GST: {billingAddress.gst_number}</Text>
          )}
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
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
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
    marginBottom: 0,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
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
    paddingVertical: 4,
  },
});
