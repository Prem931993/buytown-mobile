import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import { useContext, useEffect, useState } from 'react';
import {
  Image,
  Keyboard,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { AppContext } from './../ContextAPI/ContextAPI';

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/auth/user/set-password`;

export default function PinEntryScreen({ navigation, route }) {
  const { apiToken, otp, setAccessTokenState } = useContext(AppContext);
  const [pin, setPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [otpCode, setOtpCode] = useState(otp ? otp.split('') : ['', '', '', '', '', '']);
  const routeOtp = route?.params?.otp;
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

 

  const handlePinChange = (value, index) => {
    const updatedPin = [...pin];
    updatedPin[index] = value;
    setPin(updatedPin);

    // Auto focus to next field
    if (value && index < 3) {
      const nextInput = `pin${index + 1}`;
      refs[nextInput]?.focus();
    } else if (value && index === 3) {
      // Close keyboard when last digit is entered
      Keyboard.dismiss();
    }
  };

  const handleConfirmPinChange = (value, index) => {
    const updatedConfirmPin = [...confirmPin];
    updatedConfirmPin[index] = value;
    setConfirmPin(updatedConfirmPin);

    // Auto focus to next field
    if (value && index < 3) {
      const nextInput = `confirmPin${index + 1}`;
      refs[nextInput]?.focus();
    } else if (value && index === 3) {
      // Close keyboard when last digit is entered
      Keyboard.dismiss();
    }
  };

  const handleOtpChange = (value, index) => {
    const updatedOtp = [...otpCode];
    updatedOtp[index] = value;
    setOtpCode(updatedOtp);

    // Auto focus to next field
    if (value && index < 5) {
      const nextInput = `otp${index + 1}`;
      refs[nextInput]?.focus();
    } else if (value && index === 5) {
      // Close keyboard when last digit is entered
      Keyboard.dismiss();
    }
  };

  const handleBackspace = (type) => {
    let array, setArray, prefix;
    if (type === 'pin') { array = pin; setArray = setPin; prefix = 'pin'; }
    else if (type === 'confirmPin') { array = confirmPin; setArray = setConfirmPin; prefix = 'confirmPin'; }
    else if (type === 'otp') { array = otpCode; setArray = setOtpCode; prefix = 'otp'; }

    // Find the last index with value
    let lastIndex = -1;
    for (let i = array.length - 1; i >= 0; i--) {
      if (array[i] !== '') {
        lastIndex = i;
        break;
      }
    }
    if (lastIndex >= 0) {
      const updated = [...array];
      updated[lastIndex] = '';
      setArray(updated);
      const input = `${prefix}${lastIndex}`;
      refs[input]?.focus();
    }
  };

  const refs = {};

  const handleSetPinPress = async () => {
    const joinedPin = pin.join('');
    const joinedConfirmPin = confirmPin.join('');
    if (joinedPin.length !== 4) {
      setErrorMessage('Please enter a 4-digit PIN');
      setErrorModalVisible(true);
    } else if (joinedConfirmPin.length !== 4) {
      setErrorMessage('Please confirm your 4-digit PIN');
      setErrorModalVisible(true);
    } else if (joinedPin !== joinedConfirmPin) {
      setErrorMessage('PIN and Confirm PIN do not match');
      setErrorModalVisible(true);
    } else {
      await setPinApiCall();
    }
  };



  const setPinApiCall = async () => {
    const joinedPin = pin.join('');
    const joinedOtp = otpCode?.join('')
    const userId = await AsyncStorage.getItem("userId");
    try {
      
      const response = await axios.post(`${API_URL}`, {userId: userId, otp:joinedOtp,  newPassword: joinedPin}, {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        }
      });
      if(response.data.statusCode === 200) {
        await AsyncStorage.setItem("accessToken", String(response.data.accessToken));
        await AsyncStorage.setItem("refreshToken", String(response.data.refreshToken));
        await AsyncStorage.setItem("userId", String(response.data.user.id));
        await AsyncStorage.setItem("isLoggedIn", "true");
        await AsyncStorage.setItem("role", String(response.data.user.role_id));
        setAccessTokenState(response.data.accessToken);
        // Navigate to home screen after PIN is set
        const role = await AsyncStorage.getItem("role");
        let targetScreen = 'ProfileScreen';
        if(role == 2) {
          targetScreen = 'MainTabs';
        } else if(role == 3) {
          targetScreen = 'DeliveryListScreen';
        }
        navigation.navigate(targetScreen);
      } else {
        setErrorMessage('Failed to set PIN. Please try again.');
        setErrorModalVisible(true);
      }
    } catch (error) {
      console.error("Error setting PIN:", error.response?.data || error.message);
      setErrorMessage('Failed to set PIN. Please try again.');
      setErrorModalVisible(true);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="black" />
        <Image source={require('./../assets/userImage.png')} style={styles.avatar} />
        <Text style={styles.welcome}>Welcome user</Text>
        <Text style={styles.instruction}>Enter 6-digit OTP</Text>
        {(otp || routeOtp) && <Text style={styles.otpMessage}>OTP: {routeOtp || otp}</Text>}
        <View style={styles.pinContainer}>
          {otpCode.map((digit, index) => (
            <TextInput
              key={index}
              style={styles.otpPinInput}
              keyboardType="number-pad"
              maxLength={1}
              ref={(input) => (refs[`otp${index}`] = input)}
              onChangeText={(value) => handleOtpChange(value, index)}
              value={digit ? '•' : ''}
              secureTextEntry={false}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace') {
                  handleBackspace('otp');
                }
              }}
            />
          ))}
        </View>
        <Text style={styles.instruction}>Set New 4-digit PIN</Text>
        <View style={styles.pinContainer}>
          {pin.map((digit, index) => (
            <TextInput
              key={index}
              style={styles.pinInput}
              keyboardType="number-pad"
              maxLength={1}
              ref={(input) => (refs[`pin${index}`] = input)}
              onChangeText={(value) => handlePinChange(value, index)}
              value={digit ? '•' : ''}
              secureTextEntry={true}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace') {
                  handleBackspace('pin');
                }
              }}
            />
          ))}
        </View>
        <Text style={styles.instruction}>Confirm 4-digit PIN</Text>
        <View style={styles.pinContainer}>
          {confirmPin.map((digit, index) => (
            <TextInput
              key={index}
              style={styles.pinInput}
              keyboardType="number-pad"
              maxLength={1}
              ref={(input) => (refs[`confirmPin${index}`] = input)}
              onChangeText={(value) => handleConfirmPinChange(value, index)}
              value={digit ? '•' : ''}
              secureTextEntry={true}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace') {
                  handleBackspace('confirmPin');
                }
              }}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSetPinPress}>
          <Text style={styles.buttonText}>Confirm PIN</Text>
        </TouchableOpacity>



        {/* Error Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={errorModalVisible}
          onRequestClose={() => {
            setErrorModalVisible(false);
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Error</Text>
              <Text style={styles.modalText}>{errorMessage}</Text>
              <TouchableOpacity style={styles.agreeButton} onPress={() => setErrorModalVisible(false)}>
                <Text style={styles.agreeButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center', flex: 1, justifyContent: 'center', backgroundColor: '#ffffff', },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 20 },
  welcome: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color:"#000000" },
  instruction: { fontSize: 16, marginBottom: 20, color: '#000000' },
  otpMessage: { fontSize: 14, marginBottom: 10, color: '#000000', textAlign: 'center' },
  pinContainer: { flexDirection: 'row', marginBottom: 30, justifyContent: 'space-between', width: '80%' },
  pinInput: {
    borderBottomWidth: 2,
    borderColor: '#000000',
    width: 50,
    height: 60,
    textAlign: 'center',
    fontSize: 24,
    marginHorizontal: 5,
    color: '#000000'
  },
  otpPinInput: {
    borderBottomWidth: 2,
    borderColor: '#000000',
    width: 30,
    height: 60,
    textAlign: 'center',
    fontSize: 24,
    marginHorizontal: 5,
    color: '#000000'
  },
  forgot: {
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#000000',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    marginTop:30
  },
  buttonText: { color: '#ffffff', fontSize: 16 },
  passwordInstead: {
    marginTop: 20,
    color: '#333',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '100%',
    maxHeight: '100%',
    height:"100%",
    padding: 0,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  agreeButton: {
    backgroundColor: '#eb1f2a',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  agreeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

// BuyTownUser@123
