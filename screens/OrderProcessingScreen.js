import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Modal, BackHandler, AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../ContextAPI/ContextAPI';
import { getPaymentDetails, getOrderDetails } from '../auth/paymentServices';
import InnerHeader from '../components/InnerHeader';

const POLLING_INTERVAL = 5000; // 5 seconds
const TIMEOUT = 15000; // 5 minutes

export default function OrderProcessingScreen({ route, navigation }) {
  const { order } = route.params;
  const { apiToken, accessTokens } = useContext(AppContext);
  const [polling, setPolling] = useState(false);
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [stopPolling, setStopPolling] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const rejectOrder = async (orderId, reason) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/orders/${orderId}/cancel`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'X-User-Token': `Bearer ${accessTokens}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ cancellation_reason:reason }),
        }
      );
      if (!response.ok) {
        if (response.status === 401) {
          // Handle logout if needed
          console.error('Unauthorized');
          return;
        }
        console.error('Failed to reject order');
      } 
    } catch (err) {
      console.error('Error rejecting order:', err);
    }
  };

  useEffect(() => {
    setPolling(true);
    setStopPolling(false);

    intervalRef.current = setInterval(async () => {
      if (stopPolling) {
        return;
      }

      try {
        const response = await getPaymentDetails(order.id, apiToken, accessTokens);
        const orderResponse = await getOrderDetails(order.id, apiToken, accessTokens);

        if (response.status && response.status === 'PAID') {
          setStopPolling(true);
          if (intervalRef.current) clearInterval(intervalRef.current);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          navigation.replace('OrderSuccessScreen', { order: orderResponse.order });
        } else if (response.data && response.status === 'FAILED') {
          setStopPolling(true);
          if (intervalRef.current) clearInterval(intervalRef.current);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          navigation.replace('OrderFailureScreen', { order: orderResponse.order });
        } 
      } catch (error) {
        console.error('Polling payment status error:', error);
      }
    }, POLLING_INTERVAL);

    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setPolling(false);
      setStopPolling(true);
      setTimeoutReached(true);
    }, TIMEOUT);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [order, apiToken, accessTokens, navigation, stopPolling]);

  useEffect(() => {
    if (timeoutReached) {
      const rejectTimeout = setTimeout(async () => {
        await rejectOrder(order.id, 'Processing timeout');
        const orderResponse = await getOrderDetails(order.id, apiToken, accessTokens);
        navigation.replace('OrderFailureScreen', { order: orderResponse.order });
      }, 2500); // 5 seconds

      return () => clearTimeout(rejectTimeout);
    }
  }, [timeoutReached, navigation, order, rejectOrder]);

  // Handle app state changes (backgrounding)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background') {
        Alert.alert(
          'Payment in Progress',
          'Cannot go back because payment is in process. Please wait for the payment to complete.',
          [{ text: 'OK' }]
        );
      }
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  if (timeoutReached) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <InnerHeader showSearch={false} showBackButton={false} />
        <View style={styles.content}>
          <Text style={styles.title}>Processing Timeout</Text>
          <Text style={styles.message}>
            Order processing is taking longer than expected. Please check your order status in My Orders.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs', params: { screen: 'Account' } }],
            })}
          >
            <Text style={styles.buttonText}>View My Orders</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <InnerHeader showSearch={false} showBackButton={false} />
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#f67179" />
        <Text style={styles.title}>Processing Your Order</Text>
        <Text style={styles.message}>
          Please wait while we process your order. This may take a few moments.
        </Text>
        <Text style={styles.orderNumber}>Order #{order.id}</Text>
      </View>

      {/* Modal for back navigation prevention */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cannot Go Back</Text>
            <Text style={styles.modalMessage}>
              Cannot go back because payment is in process. Please wait for the payment to complete.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f67179',
  },
  button: {
    backgroundColor: '#000000',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
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
    color: '#333',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#f67179',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
