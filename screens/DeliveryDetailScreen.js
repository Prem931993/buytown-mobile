import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, TextInput, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function DeliveryDetailScreen({ route }) {
  const { order } = route.params;
  const [enteredOTP, setEnteredOTP] = useState('');
  const navigation = useNavigation();

  const handleVerify = () => {
    if (enteredOTP === order.otp) {
      Alert.alert('Success', 'Delivery Verified!');
    } else {
      Alert.alert('Error', 'Incorrect OTP. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
        
      <Text style={styles.title}>
        <Icon style={styles.backIcon} onPress={() => navigation.goBack()} name="arrow-back-outline" size={24} color="#fff" />
        <Text style={styles.titleText}>Delivery Details</Text>
      </Text>
      <View style={styles.customDetails}>
        <Text style={styles.customerStyles}>Customer: {order.customerName}</Text>
        <Text style={styles.customerStyles}>Phone: {order.phone}</Text>
        <Text style={styles.customerStyles}>Email: {order.email}</Text>
        <Text style={styles.customerStyles}>Address: {order.address}</Text>
        <Text style={styles.customerStyles}>Total Price: {order.totalPrice}</Text>
      
      <View style={styles.otpSection}>
        <TextInput
          placeholder="Enter Delivery OTP"
          style={styles.input}
          keyboardType="number-pad"
          onChangeText={setEnteredOTP}
          value={enteredOTP}
        />
        <Button title="Verify OTP" onPress={handleVerify} />
      </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1,  backgroundColor: '#fff' },
  title: { 
    fontSize: 20, 
    paddingTop:40, 
    paddingHorizontal:20, 
    paddingBottom:20, 
    fontWeight: 'bold', 
    marginBottom: 12,  
    backgroundColor: '#F44336',  
    color:"#ffffff",
    flexDirection: 'row',
    alignItems:"center"
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 20, // spacing between icon and text
  },
  backIcon: {
    marginTop:10,
  },
  customDetails: {
    padding:20,
  },
  customerStyles: {
    paddingBottom:10,
  },
  otpSection: { marginTop: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
});
