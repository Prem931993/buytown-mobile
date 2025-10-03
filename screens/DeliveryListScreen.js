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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppContext } from '../ContextAPI/ContextAPI';

const statusColors = {
  approved: '#3498db',
  pending: '#f39c12',
  completed: '#27ae60',
  rejected: '#e74c3c',
};

const tabs = ['Upcoming', 'Completed', 'Cancelled'];

export default function DeliveryListScreen() {
  const navigation = useNavigation();
  const { apiToken, accessTokens } = useContext(AppContext);

  const [orders, setOrders] = useState([]);
  const [selectedTab, setSelectedTab] = useState('Upcoming');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

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
      if (!response.ok) {
        const json = await response.json();
        if (json.error === "Invalid or expired API token." || json.error === "jwt malformed") {
          if (retryCount < 1) {
            // Retry once after a short delay
            setTimeout(() => fetchDeliveryData(retryCount + 1), 1000);
            return;
          } else {
            throw new Error('Session expired. Please login again.');
          }
        } else {
          throw new Error('Failed to fetch delivery data');
        }
      }

      const json = await response.json();
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
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#2ecc71" />
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
        transparent={true}
        animationType="slide"
        onRequestClose={() => setRejectModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reject Order</Text>
            <TextInput
              style={styles.reasonInput}
              placeholder="Enter reason for rejection"
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline={true}
              numberOfLines={4}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setRejectModalVisible(false)}
              >
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={() => {
                  // TODO: handle reject with reason
                  console.log('Reject reason:', rejectReason);
                  setRejectModalVisible(false);
                }}
              >
                <Text style={styles.btnText}>Submit</Text>
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
    backgroundColor: '#2ecc71',
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
},

completeBtn: {
  flex: 1,
  marginLeft: 8,
  marginRight: 8,
  backgroundColor: '#2ecc71',
  borderRadius: 10,
  paddingVertical: 10,
  alignItems: 'center',
},

mapBtn: {
  width: 50,
  backgroundColor: '#3498db',
  borderRadius: 10,
  paddingVertical: 10,
  alignItems: 'center',
  justifyContent: 'center',
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
    backgroundColor: '#2ecc71',
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
    backgroundColor: '#2ecc71',
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d2d2d',
    marginBottom: 16,
    textAlign: 'center',
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelBtn: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#ccc',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitBtn: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
});
