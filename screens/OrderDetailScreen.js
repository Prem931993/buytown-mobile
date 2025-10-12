import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import InnerHeader from './../components/InnerHeader';
import { LinearGradient } from 'expo-linear-gradient';
import { AppContext } from './../ContextAPI/ContextAPI';
import { getOrderDetails } from './../auth/paymentServices';

export default function OrderDetailScreen({ route, navigation }) {
  const { orderId } = route.params;
  const { apiToken, accessTokens } = useContext(AppContext);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await getOrderDetails(orderId, apiToken, accessTokens);
        if (response.success) {
          setOrderDetails(response.order);
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (apiToken && accessTokens) {
      fetchOrderDetails();
    }
  }, [orderId, apiToken, accessTokens]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <InnerHeader showSearch={false} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!orderDetails) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <InnerHeader showSearch={false} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load order details.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const shippingAddress = orderDetails.shippingAddress;
  const billingAddress = orderDetails.billingAddress;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <InnerHeader showSearch={false} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Order Header */}
        <LinearGradient
          colors={['#000000', '#333333']}
          style={styles.headerCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <Icon name="receipt-outline" size={40} color="#fff" />
            <Text style={styles.orderNumber}>Order #{orderDetails.order_number}</Text>
            <Text style={styles.orderDate}>{new Date(orderDetails.orderDate).toLocaleDateString()}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{orderDetails.status.replace('_', ' ').toUpperCase()}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Order Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="information-circle-outline" size={24} color="#000000" />
            <Text style={styles.sectionTitle}>Order Information</Text>
          </View>
          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Payment Method</Text>
              <Text style={styles.detailValue}>{orderDetails.paymentMethod.replace('_', ' ').toUpperCase()}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Payment Status</Text>
              <Text style={styles.detailValue}>{orderDetails.paymentStatus.toUpperCase()}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Delivery Distance</Text>
              <Text style={styles.detailValue}>{orderDetails.deliveryDistance} km</Text>
            </View>
            {orderDetails.notes && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Notes</Text>
                <Text style={styles.detailValue}>{orderDetails.notes}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Amount Breakdown */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="calculator-outline" size={24} color="#000000" />
            <Text style={styles.sectionTitle}>Amount Breakdown</Text>
          </View>
          <View style={styles.amountList}>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Subtotal</Text>
              <Text style={styles.amountValue}>₹{parseFloat(orderDetails.subtotal).toFixed(2)}</Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Tax</Text>
              <Text style={styles.amountValue}>₹{parseFloat(orderDetails.tax).toFixed(2)}</Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Delivery Charges</Text>
              <Text style={styles.amountValue}>₹{parseFloat(orderDetails.deliveryCharges).toFixed(2)}</Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Discount</Text>
              <Text style={styles.amountValue}>-₹{parseFloat(orderDetails.discount).toFixed(2)}</Text>
            </View>
            <View style={styles.totalAmountRow}>
              <Text style={styles.totalAmountLabel}>Total Amount</Text>
              <Text style={styles.totalAmountValue}>₹{parseFloat(orderDetails.total).toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Shipping Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="location-outline" size={24} color="#000000" />
            <Text style={styles.sectionTitle}>Shipping Address</Text>
          </View>
          <View style={styles.addressCard}>
            {(shippingAddress.first_name || shippingAddress.last_name) && (
              <Text style={styles.addressName}>
                {shippingAddress.first_name} {shippingAddress.last_name}
              </Text>
            )}
            <Text style={styles.addressLine}>{shippingAddress.street}</Text>
            <Text style={styles.addressLine}>
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip_code}
            </Text>
            <Text style={styles.addressLine}>{shippingAddress.country}</Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="bag-outline" size={24} color="#000000" />
            <Text style={styles.sectionTitle}>Order Items</Text>
          </View>
          {orderDetails.items.map((item, index) => (
            <View key={item.id} style={styles.itemCard}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemSku}>SKU: {item.sku}</Text>
              <View style={styles.itemDetails}>
                <Text style={styles.itemPrice}>₹{parseFloat(item.price).toFixed(2)}</Text>
                <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                <Text style={styles.itemTotal}>Total: ₹{parseFloat(item.total).toFixed(2)}</Text>
              </View>
              <Text style={styles.itemTax}>Tax: ₹{parseFloat(item.tax_amount).toFixed(2)} ({item.gst_rate}%)</Text>
            </View>
          ))}
        </View>

        {/* Billing Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="card-outline" size={24} color="#000000" />
            <Text style={styles.sectionTitle}>Billing Address</Text>
          </View>
          <View style={styles.addressCard}>
            {(billingAddress.first_name || billingAddress.last_name) && (
              <Text style={styles.addressName}>
                {billingAddress.first_name} {billingAddress.last_name}
              </Text>
            )}
            <Text style={styles.addressLine}>{billingAddress.street}</Text>
            <Text style={styles.addressLine}>
              {billingAddress.city}, {billingAddress.state} {billingAddress.zip_code}
            </Text>
            <Text style={styles.addressLine}>{billingAddress.country}</Text>
            {billingAddress.gst_number && (
              <Text style={styles.gstText}>GST: {billingAddress.gst_number}</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  headerCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerContent: {
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 16,
    color: '#e8f4f8',
    marginBottom: 12,
  },
  statusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 12,
  },
  detailGrid: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#34495e',
    fontWeight: '600',
  },
  amountList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  amountLabel: {
    fontSize: 15,
    color: '#7f8c8d',
  },
  amountValue: {
    fontSize: 15,
    color: '#34495e',
    fontWeight: '500',
  },
  totalAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#000000',
    backgroundColor: '#f8f9fa',
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  totalAmountLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  totalAmountValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  addressCard: {
    backgroundColor: '#f8f9fa',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#000000',
  },
  addressName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  addressLine: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 4,
    lineHeight: 20,
  },
  gstText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 8,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
  },
  itemCard: {
    backgroundColor: '#f8f9fa',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#000000',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  itemSku: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 14,
    color: '#34495e',
    fontWeight: '500',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#34495e',
    fontWeight: '500',
  },
  itemTotal: {
    fontSize: 14,
    color: '#000000',
    fontWeight: 'bold',
  },
  itemTax: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
});
