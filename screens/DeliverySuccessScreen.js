import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function DeliverySuccessScreen({ route, navigation }) {
  const { order } = route.params;

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('DeliveryPage');
        return true;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => backHandler.remove();
    }, [navigation])
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Success Icon and Message */}
        <View style={styles.successSection}>
          <View style={styles.iconContainer}>
            <Icon name="checkmark-circle" size={80} color="#8BC34A" />
          </View>
          <Text style={styles.successTitle}>Delivery Completed!</Text>
          <Text style={styles.successSubtitle}>
            Thank you for delivering with BuyTown. The order has been successfully delivered.
          </Text>
        </View>

        {/* Order Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Order Number:</Text>
            <Text style={styles.value}>{order.order_number || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Status:</Text>
            <Text style={[styles.value, styles.statusText]}>Delivered</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Payment Status:</Text>
            <Text style={styles.value}>{order.payment_status || 'Paid'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Payment Mode:</Text>
            <Text style={styles.value}>{order.payment_mode || 'Online'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Total Amount:</Text>
            <Text style={styles.value}>₹{order.total_amount || 0}</Text>
          </View>
        </View>

        {/* Products Delivered */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Products Delivered</Text>
          {order.items && order.items.map((item, index) => (
            <View key={index} style={styles.productRow}>
              <Text style={styles.productName}>{item.product_name}</Text>
              <Text style={styles.productQty}>Qty: {item.quantity}</Text>
              <Text style={styles.productPrice}>₹{item.price}</Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('DeliveryPage')}
          >
            <Text style={styles.primaryButtonText}>Back to Delivery Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F8F5',
    paddingTop: 30,
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
    color: '#8BC34A',
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  productName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  productQty: {
    fontSize: 16,
    color: '#666',
    flex: 0.3,
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 0.3,
    textAlign: 'right',
  },
  buttonContainer: {
    marginTop: 20,
  },
  primaryButton: {
    backgroundColor: '#8BC34A',
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
});
