
import React, { useState, useContext } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  Image, TouchableOpacity, Modal, TextInput, Alert, Keyboard, TouchableWithoutFeedback
} from 'react-native';

// import { Checkbox } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppContext } from '../ContextAPI/ContextAPI';

const PRIMARY_GREEN = '#8BC34A';
const PRIMARY_BLACK = '#000000';
const SECONDARY_RED = '#E53935';
const SECONDARY_LIGHT_GRAY = '#F5F5F5';

export default function DeliveryConfirmationScreen({ route, navigation }) {
  const order = route.params?.item;
  const { apiToken, accessTokens, logout } = useContext(AppContext);

  const products = order?.items ? order.items.map(item => ({
    id: item.sku_code,
    name: item.product_name,
    qty: item.quantity,
    price: parseFloat(item.price),
    image: require('./../assets/product-img.jpeg') // Default image since not in API
  })) : [];

  const [checkedItems, setCheckedItems] = useState([]);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [onSuccessAction, setOnSuccessAction] = useState(null);


  const [checked, setChecked] = React.useState(false);

  const rejectDelivery = async (orderId, reason) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/orders/${orderId}/delivery-reject`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'X-User-Token': `Bearer ${accessTokens}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ rejection_reason: reason }),
        }
      );
      if (!response.ok) {
        if (response.status === 401) {
          logout(navigation);
          return;
        }
        const json = await response.json();
        if (json.error === "Invalid or expired API token." || json.error === "jwt malformed") {
          logout(navigation);
          return;
        } else {
          setErrorMessage(json.error || 'Failed to reject delivery');
          setErrorModalVisible(true);
          return;
        }
      }

      const json = await response.json();
      if (json.success) {
        setSuccessMessage('Delivery rejected successfully.');
        setOnSuccessAction(() => () => navigation.goBack());
        setSuccessModalVisible(true);
      } else {
        setErrorMessage('API returned unsuccessful response');
        setErrorModalVisible(true);
      }
    } catch (err) {
      setErrorMessage(err.message);
      setErrorModalVisible(true);
    }
  };

  const completeDelivery = async (orderId, otp = null) => {
    try {

      const body = otp ? JSON.stringify({ otp }) : JSON.stringify({});
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/orders/${orderId}/delivery-complete`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'X-User-Token': `Bearer ${accessTokens}`,
            'Content-Type': 'application/json',
          },
          body,
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          logout(navigation);
          return;
        }
        const json = await response.json();
        if (json.error === "Invalid or expired API token." || json.error === "jwt malformed") {
          logout(navigation);
          return;
        } else {
          setErrorMessage(json.error || 'Failed to complete delivery');
          setErrorModalVisible(true);
          return;
        }
      }

      const json = await response.json();
      if (json.success) {
        if (otp) {
          // OTP verified, delivery completed
          setSuccessMessage('Delivery completed successfully.');
          setOnSuccessAction(() => () => navigation.navigate('DeliverySuccessScreen', { order }));
          setSuccessModalVisible(true);
        } else {
          // OTP sent, now show modal
          setOtpModalVisible(true);
        }
      } else {
        setErrorMessage('API returned unsuccessful response');
        setErrorModalVisible(true);
      }
    } catch (err) {

      setErrorMessage(err.message);
      setErrorModalVisible(true);
    }
  };



  const toggleCheckbox = (id) => {
    setCheckedItems(prev => ({
        ...prev,
        [id]: !prev[id]
    }));
    };

  const totalPrice = products.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const receivedAmount = order?.total || 0; // Use order total if available

  const isConfirmEnabled = Object.values(checkedItems).some(value => value === true);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Confirmation</Text>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        style={styles.listWrapper}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Image source={item.image} style={styles.image} />
            <View style={styles.details}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.qtyText}>Quantity: {item.qty}</Text>
              <Text style={styles.price}>₹{item.price}</Text>
            </View>
            <TouchableOpacity onPress={() => toggleCheckbox(item.id)} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons
                name={checkedItems[item.id] ? 'checkbox-outline' : 'square-outline'}
                size={24}
                color="#000"
              />
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={styles.summary}>
        <Text style={styles.rowText}>Payment Status: {order?.payment_status || 'Paid'}</Text>
        <Text style={styles.rowText}>Total: ₹{order?.total_amount || 0}</Text>
        <Text style={styles.rowText}>Payment Mode: {order?.payment_mode || 'Online'}</Text>
      </View>

      <TouchableOpacity
        style={styles.rejectBtn}
        onPress={() => setRejectModalVisible(true)}
      >
        <Text style={styles.rejectText}>REJECT</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.confirmBtn, { backgroundColor: isConfirmEnabled ? PRIMARY_GREEN : '#a5d6a7' }]}
        disabled={!isConfirmEnabled}
        onPress={() => completeDelivery(order.id)}
      >
        <Text style={styles.confirmText}>CONFIRM</Text>
      </TouchableOpacity>

      <Modal
        visible={otpModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setOtpModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <TouchableOpacity
              style={styles.closeIcon}
              onPress={() => {
                setOtpModalVisible(false);
                setEnteredOtp('');
              }}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <View style={styles.modalHeader}>
              <Ionicons name="shield-checkmark" size={40} color={PRIMARY_GREEN} />
              <Text style={styles.modalTitle}>Verify Delivery</Text>
              <Text style={styles.modalSubtitle}>Enter the 6-digit OTP sent to the customer</Text>
            </View>
            <View style={styles.otpContainer}>
              <TextInput
                style={styles.otpInput}
                placeholder="000000"
                keyboardType="numeric"
                value={enteredOtp}
                maxLength={6}
                onChangeText={setEnteredOtp}
                textAlign="center"
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => {
                  setOtpModalVisible(false);
                  setEnteredOtp('');
                }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.verifyBtn]}
                onPress={() => {
                  if (enteredOtp.length !== 6) {
                    setErrorMessage('Please enter a valid 6-digit OTP.');
                    setErrorModalVisible(true);
                    return;
                  }
                  setOtpModalVisible(false);
                  setEnteredOtp('');
                  completeDelivery(order.id, enteredOtp);
                }}
              >
                <Text style={styles.verifyBtnText}>Verify</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={rejectModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRejectModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <TouchableOpacity
                style={styles.closeIcon}
                onPress={() => {
                  setRejectModalVisible(false);
                  setRejectionReason('');
                }}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
              <View style={styles.modalHeader}>
                <Ionicons name="warning" size={40} color={SECONDARY_RED} />
                <Text style={styles.modalTitle}>Reject Delivery</Text>
                <Text style={styles.modalSubtitle}>Please provide a reason for rejection</Text>
              </View>
              <View style={styles.reasonContainer}>
                <TextInput
                  style={styles.reasonInput}
                  placeholder="Enter reason for rejection"
                  value={rejectionReason}
                  onChangeText={setRejectionReason}
                  multiline
                  numberOfLines={4}
                />
              </View>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.cancelBtn]}
                  onPress={() => {
                    setRejectModalVisible(false);
                    setRejectionReason('');
                  }}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.rejectConfirmBtn]}
                  onPress={() => {
                    if (rejectionReason.trim() === '') {
                      setErrorMessage('Please provide a reason for rejection.');
                      setErrorModalVisible(true);
                      return;
                    }
                    setRejectModalVisible(false);
                    setRejectionReason('');
                    rejectDelivery(order.id, rejectionReason);
                  }}
                >
                  <Text style={styles.rejectConfirmBtnText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={errorModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setErrorModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <TouchableOpacity
              style={styles.closeIcon}
              onPress={() => setErrorModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <View style={styles.modalHeader}>
              <Ionicons name="alert-circle" size={40} color={SECONDARY_RED} />
              <Text style={styles.modalTitle}>Error</Text>
              <Text style={styles.modalSubtitle}>{errorMessage}</Text>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.okBtn]}
                onPress={() => setErrorModalVisible(false)}
              >
                <Text style={styles.okBtnText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={successModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setSuccessModalVisible(false);
          if (onSuccessAction) onSuccessAction();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <TouchableOpacity
              style={styles.closeIcon}
              onPress={() => {
                setSuccessModalVisible(false);
                if (onSuccessAction) onSuccessAction();
              }}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <View style={styles.modalHeader}>
              <Ionicons name="checkmark-circle" size={40} color={PRIMARY_GREEN} />
              <Text style={styles.modalTitle}>Success</Text>
              <Text style={styles.modalSubtitle}>{successMessage}</Text>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.okBtn]}
                onPress={() => {
                  setSuccessModalVisible(false);
                  if (onSuccessAction) onSuccessAction();
                }}
              >
                <Text style={styles.okBtnText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>

  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F8F5', paddingBottom: 50 },
  listWrapper: {
    padding: 20,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  image: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  details: { flex: 1 },
  name: { fontWeight: '600', fontSize: 16, color: PRIMARY_BLACK, marginBottom: 4 },
  qtyText: { fontSize: 14, color: '#6c757d', marginBottom: 2 },
  price: { fontSize: 16, color: PRIMARY_GREEN, fontWeight: '700' },
  summary: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  rowText: { fontSize: 16, fontWeight: '600', color: PRIMARY_BLACK, marginBottom: 8 },
  confirmBtn: {
    backgroundColor: PRIMARY_GREEN,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: PRIMARY_GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  confirmText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY_GREEN,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: PRIMARY_GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  backButton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
    minWidth: 50,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginLeft: -32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    position: 'relative',
  },
  closeIcon: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 5,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: PRIMARY_BLACK,
    marginTop: 10,
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  otpContainer: {
    width: '100%',
    marginBottom: 30,
  },
  otpInput: {
    borderWidth: 2,
    borderColor: PRIMARY_GREEN,
    borderRadius: 12,
    width: '100%',
    padding: 18,
    fontSize: 20,
    textAlign: 'center',
    backgroundColor: '#f8f9fa',
    letterSpacing: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalBtn: {
    flex: 0.48,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelBtn: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  verifyBtn: {
    backgroundColor: PRIMARY_GREEN,
  },
  cancelBtnText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  verifyBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  rejectBtn: {
    backgroundColor: SECONDARY_RED,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
    shadowColor: SECONDARY_RED,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  rejectText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  reasonContainer: {
    width: '100%',
    marginBottom: 30,
  },
  reasonInput: {
    borderWidth: 2,
    borderColor: SECONDARY_RED,
    borderRadius: 12,
    width: '100%',
    padding: 18,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    textAlignVertical: 'top',
    height: 100,
  },
  rejectConfirmBtn: {
    backgroundColor: SECONDARY_RED,
  },
  rejectConfirmBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  okBtn: {
    backgroundColor: PRIMARY_GREEN,
    flex: 1,
  },
  okBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
