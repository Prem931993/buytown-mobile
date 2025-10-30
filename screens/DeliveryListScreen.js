import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Linking,
  Alert,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppContext } from '../ContextAPI/ContextAPI';
import CustomDropdown from '../components/CustomDropdown';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { downloadInvoice } from '../auth/paymentServices';

const statusColors = {
  approved: '#3498db',
  pending: '#f39c12',
  completed: '#27ae60',
  rejected: '#e74c3c',
};

const tabs = ['Upcoming', 'Completed', 'Cancelled'];

export default function DeliveryListScreen() {
  const navigation = useNavigation();
  const { apiToken, accessTokens, logout } = useContext(AppContext);

  const [orders, setOrders] = useState([]);
  const [selectedTab, setSelectedTab] = useState('Upcoming');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedReason, setSelectedReason] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [downloadingInvoices, setDownloadingInvoices] = useState(new Set());

  const rejectionReasons = [
    { value: 'customer_not_available', label: 'Customer not available', message: 'The customer was not available at the delivery address.' },
    { value: 'wrong_address', label: 'Wrong address', message: 'The provided delivery address was incorrect.' },
    { value: 'product_damaged', label: 'Product damaged', message: 'The product was damaged during transit.' },
    { value: 'payment_issue', label: 'Payment issue', message: 'There was an issue with the payment for the delivery.' },
    { value: 'others', label: 'Others' },
  ];

  useEffect(() => {
    if (apiToken && accessTokens) {
      fetchDeliveryData();
    }
  }, [apiToken, accessTokens]);

  const fetchDeliveryData = async (retryCount = 0) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/dashboard/delivery-person/stats`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'X-User-Token': `Bearer ${accessTokens}`,
            'Content-Type': 'application/json',
          },
        }
      );
      let json;
      try {
        const text = await response.text();
        json = JSON.parse(text);
      } catch (e) {
        throw new Error(`Invalid response from server: ${e.message}`);
      }

      if (!response.ok) {
        if (response.status === 401) {
          // Clear storage and regenerate tokens for 401 Unauthorized
          logout(navigation);
          return;
        }
        if (json.error === "Invalid or expired API token." || json.error === "jwt malformed") {
          if (retryCount < 1) {
            // Retry once after a short delay
            setTimeout(() => fetchDeliveryData(retryCount + 1), 1000);
            return;
          } else {
            // Clear storage and regenerate tokens
            logout(navigation);
            return;
          }
        } else {
          throw new Error('Failed to fetch delivery data');
        }
      }
      if (json.success) {
        setOrders(json.data.orders);
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const rejectDelivery = async (orderId, reason, setRejectModalVisible) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/orders/${orderId}/delivery-reject`,
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
      let json;
      try {
        const text = await response.text();
        json = JSON.parse(text);
      } catch (e) {
        throw new Error(`Invalid response from server: ${e.message}`);
      }

      if (!response.ok) {
        if (response.status === 401) {
          logout(navigation);
          return;
        }
        if (json.error === "Invalid or expired API token." || json.error === "jwt malformed") {
          logout(navigation);
          return;
        } else {
          throw new Error('Failed to reject delivery');
        }
      }
      if (json.success) {
        setSuccessMessage('Delivery rejected successfully.');
        setSuccessModalVisible(true);
        fetchDeliveryData(); // Refresh the list
        setRejectModalVisible(false);
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (err) {
      setErrorMessage(err.message);
      setErrorModalVisible(true);
      setRejectModalVisible(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (selectedTab === 'Upcoming') return order.status === 'approved' || order.status === 'pending';
    if (selectedTab === 'Completed') return order.status === 'completed';
    if (selectedTab === 'Cancelled') return order.status === 'rejected';
    return true;
  });

  const renderStatusBadge = (status) => (
    <View style={[styles.statusBadge, { backgroundColor: statusColors[status] || '#999' }]}>
      <Text style={styles.statusText}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </View>
  );

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            await AsyncStorage.clear();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Welcome' }],
            });
          },
        },
      ]
    );
  };

  const handleDownloadInvoice = async (orderId) => {
    setDownloadingInvoices(prev => new Set(prev).add(orderId));
    try {
      const invoiceBlob = await downloadInvoice(orderId, apiToken, accessTokens);

      // Convert blob to base64
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result.split(',')[1]; // Remove the data URL prefix
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(invoiceBlob);
      });

      // Save the base64 data to a file
      const fileUri = FileSystem.documentDirectory + `invoice_${orderId}.pdf`;
      await FileSystem.writeAsStringAsync(fileUri, base64Data, { encoding: 'base64' });

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Download Invoice',
        });
        Alert.alert('Success', 'Invoice downloaded successfully. Check your Files app or share options.');
      } else {
        Alert.alert('Error', 'Sharing is not available on this device.');
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      Alert.alert('Error', 'Failed to download invoice. Please try again.');
    } finally {
      setDownloadingInvoices(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const renderOrderCard = ({ item }) => {
    // Parse delivery address if it's a JSON string
    let deliveryAddress = item.delivery_address || item.shipping_address || {};
    if (typeof deliveryAddress === 'string') {
      try {
        deliveryAddress = JSON.parse(deliveryAddress);
      } catch (e) {
        deliveryAddress = {};
      }
    }

    // Compose delivery address string for map search
    const addressString = `${deliveryAddress.street || ''}, ${deliveryAddress.city || ''}, ${deliveryAddress.state || ''} ${deliveryAddress.zip_code || ''}, ${deliveryAddress.country || ''}`.trim();

    // Open map with address string
    const openMapWithAddress = () => {
      if (addressString) {
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressString)}`;
        Linking.openURL(url);
      } else {
        Alert.alert('Location not available', 'Delivery address is not available.');
      }
    };

    // Format order date with calendar icon
    const formattedDate = new Date(item.created_at).toLocaleDateString();

    // Determine status display (replace 'approved' with 'pending')
    const displayStatus = item.status === 'approved' ? 'pending' : item.status;

    return (
      <View style={styles.bookingCard}>
        {/* Top Header: Location left, Date right */}
          <View style={styles.topHeader}>
            <View style={styles.locationWrapper}>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text style={styles.addressText}>{addressString}</Text>
              </View>
            </View>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.dateText}>{formattedDate}</Text>
            </View>
          </View>

        {/* Top Row: Customer name, order number, status */}
        <View style={styles.topRow}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.bookingImage} />
          ) : (
            <View style={[styles.bookingImage, styles.placeholderImage]}>
              <Ionicons name="person-circle-outline" size={40} color="#ccc" />
            </View>
          )}
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.bookingTitle}>
              {item.customer.firstname} {item.customer.lastname}
            </Text>
            <Text style={styles.bookingSub}>Order No: {item.order_number}</Text>
          </View>
          <View style={styles.rightSection}>
            {renderStatusBadge(displayStatus)}
          </View>
        </View>

        {/* Order Details */}
        <View style={styles.infoRow}>
          <Text style={styles.bookingSub}>Amount: ₹{item.total_amount}</Text>
          <Text style={styles.bookingSub}>Payment Type: {item.payment_type || 'N/A'}</Text>
          <Text style={styles.bookingSub}>Payment Status: {item.payment_status || 'N/A'}</Text>
        </View>

        {/* Action Buttons */}
        {(item.status === 'approved' || item.status === 'pending') && (
          <View style={styles.bookingActions}>
            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={() => {
                setSelectedItem(item);
                setSelectedReason('');
                setRejectReason('');
                setRejectModalVisible(true);
              }}
            >
              <Ionicons name="close-circle-outline" size={18} color="#fff" />
              <Text style={styles.btnText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.completeBtn}
              onPress={() => navigation.navigate('DeliveryConfirmation', { item })}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
              <Text style={styles.btnText}>Complete</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mapBtn} onPress={openMapWithAddress}>
              <Ionicons name="map-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Download Invoice Button for Completed Orders */}
        {(item.status === 'completed' || item.status === 'approved') && (
          <View style={styles.bookingActions}>
            <TouchableOpacity
              style={styles.downloadBtn}
              onPress={() => handleDownloadInvoice(item.id)}
              disabled={downloadingInvoices.has(item.id)}
            >
              {downloadingInvoices.has(item.id) ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="download-outline" size={18} color="#fff" />
                  <Text style={styles.btnText}>Download Invoice</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#8BC34A" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Text style={{ color: 'red', fontSize: 16 }}>{error}</Text>
        <TouchableOpacity onPress={fetchDeliveryData} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Text style={styles.headerTitle}>My Bookings</Text>

      {/* Tabs */}
      <View style={styles.tabWrapper}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setSelectedTab(tab)}
            style={[styles.tabButton, selectedTab === tab && styles.activeTab]}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Orders */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOrderCard}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No {selectedTab.toLowerCase()} orders found.</Text>
        }
      />

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
                  setSelectedReason('');
                  setRejectReason('');
                }}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
              <View style={styles.modalHeader}>
                <Ionicons name="warning" size={40} color="#E53935" />
                <Text style={styles.modalTitle}>Reject Delivery</Text>
                <Text style={styles.modalSubtitle}>Please provide a reason for rejection</Text>
              </View>
              <View style={styles.reasonContainer}>
                <CustomDropdown
                  selectedValue={selectedReason}
                  onValueChange={(value) => {
                    setSelectedReason(value);
                    if (value !== 'others') {
                      setRejectReason('');
                    }
                  }}
                  items={rejectionReasons}
                  placeholder="Select rejection reason"
                  style={{ marginBottom: 20 }}
                />
                {selectedReason === 'others' && (
                  <TextInput
                    style={styles.reasonInput}
                    placeholder="Enter reason for rejection"
                    value={rejectReason}
                    onChangeText={setRejectReason}
                    multiline
                    numberOfLines={4}
                  />
                )}
              </View>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.cancelBtn]}
                  onPress={() => {
                    setRejectModalVisible(false);
                    setSelectedReason('');
                    setRejectReason('');
                  }}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.rejectConfirmBtn]}
                  onPress={() => {
                    if (!selectedReason) {
                      setErrorMessage('Please select a reason for rejection.');
                      setErrorModalVisible(true);
                      return;
                    }
                    if (selectedReason === 'others' && rejectReason.trim() === '') {
                      setErrorMessage('Please provide a reason for rejection.');
                      setErrorModalVisible(true);
                      return;
                    }
                    const reasonToSend = selectedReason === 'others' ? rejectReason : rejectionReasons.find(r => r.value === selectedReason)?.message || selectedReason;
                    rejectDelivery(selectedItem.id, reasonToSend, setRejectModalVisible);
                    setSelectedReason('');
                    setRejectReason('');
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
        visible={successModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Ionicons name="checkmark-circle" size={40} color="#8BC34A" />
              <Text style={styles.modalTitle}>Success</Text>
            </View>
            <Text style={styles.modalSubtitle}>{successMessage}</Text>
            <View style={[styles.modalButtons, styles.modalButtonsSingle]}>
              <TouchableOpacity style={[styles.modalBtn, styles.successBtn]} onPress={() => setSuccessModalVisible(false)}>
                <Text style={styles.successBtnText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={errorModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setErrorModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Ionicons name="close-circle" size={40} color="#E53935" />
              <Text style={styles.modalTitle}>Error</Text>
            </View>
            <Text style={styles.modalSubtitle}>{errorMessage}</Text>
            <View style={[styles.modalButtons, styles.modalButtonsSingle]}>
              <TouchableOpacity style={[styles.modalBtn, styles.errorBtn]} onPress={() => setErrorModalVisible(false)}>
                <Text style={styles.errorBtnText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomBtn} onPress={() => navigation.navigate('DeliveryProfileScreen')}>
          <Ionicons name="person-outline" size={24} color="#fff" />
          <Text style={styles.bottomBtnText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
          <Text style={styles.bottomBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F8F5',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2d2d2d',
    textAlign: 'center',
    marginVertical: 16,
  },

  // Tabs
  tabWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 6,
    backgroundColor: '#eaeaea',
  },
  activeTab: {
    backgroundColor: '#8BC34A',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  activeTabText: {
    color: '#fff',
  },

bookingCard: {
  backgroundColor: '#fff',
  borderRadius: 16,
  padding: 16,
  marginBottom: 16,
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 6,
  elevation: 2,
},

topRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 10,
},

bookingImage: {
  width: 70,
  height: 70,
  borderRadius: 12,
  marginRight: 12,
},

bookingTitle: {
  fontSize: 16,
  fontWeight: '700',
  color: '#2d2d2d',
},

bookingSub: {
  fontSize: 13,
  color: '#666',
  marginTop: 2,
},

infoRow: {
  marginTop: 6,
  marginBottom: 10,
},

statusBadge: {
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 12,
  marginTop: 0,
},

statusText: {
  color: '#fff',
  fontSize: 12,
  fontWeight: '600',
},

bookingActions: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 10,
  alignItems: 'center',
},

rejectBtn: {
  flex: 1,
  marginRight: 8,
  backgroundColor: '#e74c3c',
  borderRadius: 10,
  paddingVertical: 10,
  alignItems: 'center',
  minHeight: 60,
},

completeBtn: {
  flex: 1,
  marginLeft: 8,
  marginRight: 8,
  backgroundColor: '#8BC34A',
  borderRadius: 10,
  paddingVertical: 10,
  alignItems: 'center',
  minHeight: 60,
},

mapBtn: {
  width: 50,
  backgroundColor: '#000000',
  borderRadius: 10,
  paddingVertical: 10,
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 60,
},

downloadBtn: {
  flex: 1,
  backgroundColor: '#8BC34A',
  borderRadius: 10,
  paddingVertical: 10,
  alignItems: 'center',
  minHeight: 60,
},

placeholderImage: {
  backgroundColor: '#f0f0f0',
  alignItems: 'center',
  justifyContent: 'center',
},

btnText: {
  color: '#fff',
  fontWeight: '600',
  fontSize: 14,
},

btnTextDark: {
  color: '#333',
  fontWeight: '600',
  fontSize: 14,
},


  // Empty & Retry
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#888',
    fontWeight: '600',
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#8BC34A',
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  // New styles
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  pincodeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d2d2d',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
  },
  addressText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
    flex: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#8BC34A',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingBottom: 20, // Account for safe area
  },
  bottomBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  bottomBtnText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    marginTop: 4,
  },

  rightSection: {
    alignItems: 'flex-end',
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  locationWrapper: {
    flex: 1,
    flexWrap: 'wrap',
  },

  // Modal styles
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
    color: '#000000',
    marginTop: 10,
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  reasonContainer: {
    width: '100%',
    marginBottom: 30,
  },
  reasonInput: {
    borderWidth: 2,
    borderColor: '#E53935',
    borderRadius: 12,
    width: '100%',
    padding: 18,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    textAlignVertical: 'top',
    height: 100,
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
  cancelBtnText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  rejectConfirmBtn: {
    backgroundColor: '#E53935',
  },
  rejectConfirmBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  successBtn: {
    backgroundColor: '#8BC34A',
  },
  successBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorBtn: {
    backgroundColor: '#E53935',
  },
  errorBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
