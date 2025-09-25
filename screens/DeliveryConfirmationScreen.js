
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  Image, TouchableOpacity, Modal, TextInput, Alert
} from 'react-native';

// import { Checkbox } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function DeliveryConfirmationScreen({ route, navigation }) {
  const { order } = route.params;

  // Example products (replace with real order.products)
  const products = [
    { id: '1', name: 'Main Door Handles', qty:1, price: 250, image: require('./../assets/product-img.jpeg') },
    { id: '2', name: '2 Inch Screws', qty:2, price: 200, image: require('./../assets/product-img-2.jpeg') },
    { id: '3', name: 'PVC Windows', qty:3, price: 180, image: require('./../assets/product-img.jpeg') },
    { id: '4', name: '1Kg Glue', qty:2, price: 180, image: require('./../assets/product-img-2.jpeg') },
  ];

  const [checkedItems, setCheckedItems] = useState([]);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  

  const [checked, setChecked] = React.useState(false);

  const handleComplete = (otp) => {
    console.log('enteredOtp', enteredOtp, otp);
    if (enteredOtp == otp) {
      // setOrders(prev =>
      //   prev.map(order =>
      //     order.id === selectedOrder.id ? { ...order, status: 'Completed' } : order
      //   )
      // );
      setOtpModalVisible(false);
      setEnteredOtp('');
      Alert.alert('Success', 'Order marked as completed!');
    } else {
      Alert.alert('Invalid OTP', 'Please enter correct OTP.');
    }
  };

  const toggleCheckbox = (id) => {
    setCheckedItems(prev => ({
        ...prev,
        [id]: !prev[id]
    }));
    };

  const totalPrice = products.reduce((acc, item) => acc + item.price, 0);
  const receivedAmount = 500; // Replace with actual

  return (
    <View style={styles.container}>
      <View style={styles.header}>
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
              <Text style={styles.name}>Quantity: {item.qty}</Text>
              <Text style={styles.price}>₹{item.price}</Text>
            </View>
            {/* <Checkbox.Item
                label=""
                status={checkedItems[item.id] ? 'checked' : 'unchecked'}
                onPress={() => toggleCheckbox(item.id)}
                /> */}
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
        <Text style={styles.rowText}>Payment Status: Paid</Text>
        <Text style={styles.rowText}>Total: ₹{totalPrice}</Text>
        <Text style={styles.rowText}>Payment Mode: Online</Text>
      </View>

      <TouchableOpacity style={styles.confirmBtn} 
        onPress={() => {
          setSelectedOrder();
          setOtpModalVisible(true);
        }}
      >
        <Text style={styles.confirmText}>CONFIRM</Text>
      </TouchableOpacity>

      <Modal
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
                      onPress={() => handleComplete(1234)}
                    >
                      <Text style={styles.btnText}>Verify</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
    </View>
    
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', padding: 0, paddingBottom:50, },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  listWrapper: {
    padding:20,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
  },
  image: { width: 50, height: 50, borderRadius: 6, marginRight: 10 },
  details: { flex: 1 },
  name: { fontWeight: '600', fontSize: 14 },
  price: { fontSize: 13, color: '#333' },
  summary: {
    // marginVertical: 20,
    borderTopWidth: 1,
    borderColor: '#ccc',
    padding:20,
    // paddingTop: 10,
  },
  rowText: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  confirmBtn: {
    backgroundColor: '#F44336',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    margin:15,
  },
  confirmText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  header: {
    backgroundColor: '#F44336',
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign:"center"
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
});
