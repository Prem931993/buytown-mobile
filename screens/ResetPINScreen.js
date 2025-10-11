import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';

export default function ResetPinScreen({ navigation }) {
  const [newPin, setNewPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);

  const newRefs = useRef([]);
  const confirmRefs = useRef([]);

  const handlePinChange = (value, index, type) => {
    const updated = type === 'new' ? [...newPin] : [...confirmPin];
    updated[index] = value;

    if (type === 'new') {
      setNewPin(updated);
      if (value && index < 3) newRefs.current[index + 1]?.focus();
    } else {
      setConfirmPin(updated);
      if (value && index < 3) confirmRefs.current[index + 1]?.focus();
    }
  };

  const handleSubmit = () => {
    const pin1 = newPin.join('');
    const pin2 = confirmPin.join('');

    if (pin1.length < 4 || pin2.length < 4) {
      Alert.alert('Error', 'Please enter a complete 4-digit PIN in both fields.');
      return;
    }

    if (pin1 !== pin2) {
      Alert.alert('Mismatch', 'PIN and Confirm PIN do not match.');
      return;
    }

    // Proceed to next step (save to API, navigate, etc.)
    Alert.alert('Success', 'PIN has been reset successfully.');
    navigation.navigate('Login'); // or wherever you want
  };

  const handleReturnLogin = () => {
    navigation.replace('Login')
  }

  const renderPinInput = (pinArray, refs, type) => (
    <View style={styles.pinContainer}>
      {pinArray.map((digit, index) => (
        <TextInput
          key={index}
          style={styles.pinInput}
          keyboardType="number-pad"
          maxLength={1}
          secureTextEntry
          value={digit}
          ref={(input) => (refs.current[index] = input)}
          onChangeText={(value) => handlePinChange(value, index, type)}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Image source={require('./../assets/userImage.png')} style={styles.avatar} />
      <Text style={styles.title}>Reset Your PIN</Text>

      <Text style={styles.instruction}>Enter New 4-digit PIN</Text>
      {renderPinInput(newPin, newRefs, 'new')}

      <Text style={styles.instruction}>Confirm New 4-digit PIN</Text>
      {renderPinInput(confirmPin, confirmRefs, 'confirm')}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Reset PIN</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleReturnLogin}>
        <Text style={styles.whiteText}>Return to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center', flex: 1, justifyContent: 'center', backgroundColor: '#ffffff' },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, color: '#000000' },
  instruction: { fontSize: 16, marginVertical: 10, color: '#000000' },
  pinContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '80%', marginBottom:30 },
  pinInput: {
    borderBottomWidth: 2,
    borderColor: '#000000',
    width: 50,
    height: 50,
    textAlign: 'center',
    fontSize: 24,
    marginHorizontal: 5,
    color: '#000000'
  },
  button: {
    backgroundColor: '#000000',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: { color: '#ffffff', fontSize: 16 },
  whiteText: {color: "#000000", marginTop: 20, padding: 15}
});
