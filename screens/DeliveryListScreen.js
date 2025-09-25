import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, Image, Modal, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const orders = [
  {
    id: '1',
    status: 'Upcoming',
    orderId: 'ORD-000123',
    orderDate: '2025-07-22',
    deliveryDate: '2025-07-24',
    km: '12.5 km',
    name: 'John Doe',
    phone: '9876543210',
    email: 'john@example.com',
    address: '123 Street, Green City',
    totalPrice: '₹1,200',
    otp: '123456',
    image: require('./../assets/product-img.jpeg'),
  },
  {
    id: '2',
    status: 'Completed',
    orderId: 'ORD-000124',
    orderDate: '2025-07-18',
    deliveryDate: '2025-07-20',
    km: '8.2 km',
    name: 'Alice Smith',
    phone: '9090909090',
    email: 'alice@example.com',
    address: '456 Avenue, Red Town',
    totalPrice: '₹850',
    otp: '654321',
    image: require('./../assets/product-img-2.jpeg'),
  },
  {
    id: '3',
    status: 'Upcoming',
    orderId: 'ORD-000124',
    orderDate: '2025-07-18',
    deliveryDate: '2025-07-20',
    km: '8.2 km',
    name: 'Alice Smith',
    phone: '9090909090',
    email: 'alice@example.com',
    address: '456 Avenue, Red Town',
    totalPrice: '₹850',
    otp: '654321',
    image: require('./../assets/product-img-2.jpeg'),
  },
  {
    id: '4',
    status: 'Upcoming',
    orderId: 'ORD-000124',
    orderDate: '2025-07-18',
    deliveryDate: '2025-07-20',
    km: '8.2 km',
    name: 'Alice Smith',
    phone: '9090909090',
    email: 'alice@example.com',
    address: '456 Avenue, Red Town',
    totalPrice: '₹850',
    otp: '654321',
    image: require('./../assets/product-img-2.jpeg'),
  },
];

export default function DeliveryListScreen() {
    const navigation = useNavigation();
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // const handleComplete = () => {
  //   if (enteredOtp === selectedOrder.otp) {
  //     setOrders(prev =>
  //       prev.map(order =>
  //         order.id === selectedOrder.id ? { ...order, status: 'Completed' } : order
  //       )
  //     );
  //     setOtpModalVisible(false);
  //     setEnteredOtp('');
  //     Alert.alert('Success', 'Order marked as completed!');
  //   } else {
  //     Alert.alert('Invalid OTP', 'Please enter correct OTP.');
  //   }
  // };

  // const handleCancel = (orderId) => {
  //   setOrders(prev =>
  //     prev.map(order =>
  //       order.id === orderId ? { ...order, status: 'Cancelled' } : order
  //     )
  //   );
  // };


  const [selectedTab, setSelectedTab] = useState('Upcoming');
  const tabs = ['Upcoming', 'Completed', 'Cancelled'];

  const filteredOrders = orders.filter(item => item.status === selectedTab);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Tabs */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Delivery Details</Text>
        <View style={styles.tabWrapper}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setSelectedTab(tab)}
              style={[
                styles.tabButton,
                selectedTab === tab && styles.activeTab
              ]}
            >
              <Text style={[
                styles.tabText,
                selectedTab === tab && styles.activeTabText
              ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Order List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <Image source={item.image} style={styles.image} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.phone}>📞 {item.phone}</Text>
                <Text style={styles.address}>📍 {item.address}</Text>
              </View>
            </View>

            <View style={styles.detailBlock}>
              <Text style={styles.label}>Order ID:</Text>
              <Text style={styles.value}>{item.orderId}</Text>
            </View>

            <View style={styles.detailBlock}>
              <Text style={styles.label}>Order Date:</Text>
              <Text style={styles.value}>{item.orderDate}</Text>
            </View>

            <View style={styles.detailBlock}>
              <Text style={styles.label}>Delivery Date:</Text>
              <Text style={styles.value}>{item.deliveryDate}</Text>
            </View>

            <View style={styles.detailBlock}>
              <Text style={styles.label}>KM:</Text>
              <Text style={styles.value}>{item.km}</Text>
            </View>

            <View style={styles.detailBlock}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{item.email}</Text>
            </View>

            <View style={styles.detailBlock}>
              <Text style={styles.label}>Price:</Text>
              <Text style={styles.value}>{item.totalPrice}</Text>
            </View>

            {/* Action Buttons */}
            {selectedTab === 'Upcoming' && (
              <View style={styles.buttonRow}>
                <TouchableOpacity style={[styles.actionBtn]}
                  onPress={() => setCancelModalVisible(true)}
                >
                  <Text style={styles.btnText}>Cancel Order</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.btnCompleted, {
                  borderRightWidth: 1,
                  borderRightColor: '#fee0e0',
                }]}>
                  <Text style={styles.btnTextComplete} 
                    // onPress={() => {
                    //   setSelectedOrder(item);
                    //   setOtpModalVisible(true);
                    // }}
                    onPress={() => navigation.navigate('DeliveryConfirmation', { item })}
                  >Complete Order</Text>
                </TouchableOpacity>
                
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 30, color: '#999' }}>
            No {selectedTab} orders found.
          </Text>
        }
      />

      <Modal
        visible={cancelModalVisible}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Cancel Order</Text>
            <Text style={styles.modalSubtitle}>Please enter the reason for cancellation</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter reason..."
              placeholderTextColor="#999"
              multiline
              value={cancelReason}
              onChangeText={setCancelReason}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#ccc' }]}
                onPress={() => setCancelModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#ff4444' }]}
                onPress={() => {
                  console.log('Cancel Reason:', cancelReason);
                  setCancelModalVisible(false);
                  // Call API or perform cancel logic here
                }}
              >
                <Text style={styles.modalButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* <Modal
        visible={otpModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setOtpModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Enter Delivery OTP</Text>
            <TextInput
              style={styles.otpInput}
              placeholder="Enter OTP"
              keyboardType="numeric"
              value={enteredOtp}
              maxLength={6}
              onChangeText={setEnteredOtp}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#F44336' }]}
                onPress={() => {
                  setOtpModalVisible(false);
                  setEnteredOtp('');
                }}
              >
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#4CAF50' }]}
                onPress={() => {
                  if (enteredOtp === selectedOrder?.otp) {
                    Alert.alert('Success', 'Order marked as completed!');
                    setOtpModalVisible(false);
                    setEnteredOtp('');
                    // 👉 You can also update status in your real data here
                  } else {
                    Alert.alert('Invalid OTP', 'Please enter correct OTP');
                  }
                }}
              >
                <Text style={styles.btnText}>Verify</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View> 
      </Modal> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffffff', paddingBottom:50 },

  header: {
    backgroundColor: '#F44336',
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },

  tabWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },

  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 25,
    backgroundColor: '#ffffff88',
    borderRadius: 6,
  },

  activeTab: {
    backgroundColor: '#ffffff',
  },

  tabText: {
    fontWeight: '600',
    color: '#fff',
  },

  activeTabText: {
    color: '#F44336',
  },

  listContainer: {
    padding: 20,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    paddingBottom:0,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },

  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },

  phone: {
    color: '#555',
    fontSize: 13,
  },

  address: {
    color: '#555',
    fontSize: 13,
  },

  detailBlock: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  label: {
    fontWeight: '600',
    color: '#666',
  },

  value: {
    fontWeight: '600',
    color: '#000',
  },

  buttonRow: {
    marginTop: 20,
    marginHorizontal:-15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    // borderTopWidth:1,
    // borderTopColor:"#fee0e0"
    // backgroundColor:"#ff0000"
  },

  actionBtn: {
    flex: 0.5,
    paddingVertical: 20,
    // borderBottomEndRadius: 8,
    borderBottomLeftRadius: 8,
    alignItems: 'center',
    backgroundColor:"#eb1f2a"
  },
  btnCompleted: {
    backgroundColor:"#8ec742",
    borderBottomLeftRadius: 0,
    borderBottomEndRadius: 8,
  },

  btnText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  btnTextComplete: {
    color: '#ffffff',
    fontWeight: 'bold',
    
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    width: '100%',
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalBtn: {
    flex: 0.48,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginLeft: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

});
