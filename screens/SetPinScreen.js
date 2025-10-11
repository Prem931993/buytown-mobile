import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { AppContext } from './../ContextAPI/ContextAPI';
import TermsAndConditionsScreen from './TermsScreen';

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/auth/user/set-password`; 
const TERMS_AGREE_API = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/auth/user/agree-terms`; // hypothetical endpoint

export default function PinEntryScreen({ navigation }) {
  const { apiToken, otp, setAccessTokenState } = useContext(AppContext);
  const [pin, setPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [otpCode, setOtpCode] = useState(otp ? otp.split('') : ['', '', '', '', '', '']);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const handleAgreeTerms = async () => {
    setLoading(true);
    try {
      // Call API to mark terms agreed
      const accessToken = await AsyncStorage.getItem("accessToken");
      const response = await axios.post(TERMS_AGREE_API, { terms_agreed: true }, {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'X-User-Token': `Bearer ${accessToken}`, // User token
          'Content-Type': 'application/json'
        }
      });
      if (response.data.statusCode === 200) {
        setModalVisible(false);
        const role = await AsyncStorage.getItem("role");
        let targetScreen = 'ProfileScreen';
        if(role == 2) {
          targetScreen = 'MainTabs';
        } else if(role == 3) {
          targetScreen = 'DeliveryListScreen';
        }
        navigation.navigate(targetScreen);
      } else {
        setErrorMessage('Failed to agree to terms. Please try again.');
        setErrorModalVisible(true);
      }
    } catch (error) {
      console.error('Error agreeing terms:', error.response?.data || error.message);
      setErrorMessage('Failed to agree to terms. Please try again.');
      setErrorModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const setPinApiCall = async () => {
    const joinedPin = pin.join('');
    try {
      const userId = await AsyncStorage.getItem("userId");
      const response = await axios.post(`${API_URL}`, {userId: userId, otp:otp,  newPassword: joinedPin}, {
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
        // Show terms modal after PIN is set
        setModalVisible(true);
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

  const handleForgot = () => {
    navigation.navigate('ForgotPassword');
  }

  useEffect(()=> {
    console.log("otp", otp)
    if(otp) {
      console.log("otp", otp)
    }
  }, [otp])

  useEffect(()=> {
    if(otpCode) {
      console.log("otpCode", otpCode)
    }
  }, [otpCode])

  return (
    <View style={styles.container}>
      {/* <StatusBar barStyle="light-content" backgroundColor="black" /> */}
      <Image source={require('./../assets/userImage.png')} style={styles.avatar} />
      <Text style={styles.welcome}>Welcome user</Text>
      <Text style={styles.instruction}>Enter 6-digit OTP</Text>
      <View style={styles.pinContainer}>
        {otpCode.map((digit, index) => (
          <TextInput
            key={index}
            style={styles.otpPinInput}
            keyboardType="number-pad"
            maxLength={1}
            ref={(input) => (refs[`otp${index}`] = input)}
            onChangeText={(value) => handleOtpChange(value, index)}
            value={digit}
            secureTextEntry={false}
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
            value={digit}
            secureTextEntry={true}
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
            value={digit}
            secureTextEntry={true}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSetPinPress}>
        <Text style={styles.buttonText}>Confirm PIN</Text>
      </TouchableOpacity>

      {/* Terms and Conditions Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <TermsAndConditionsScreen />
              {/* <Text style={styles.modalTitle}>Terms and Conditions</Text>
              <Text style={styles.modalText}>
                Please read and agree to the terms and conditions before proceeding.
              </Text>
              <Text style={styles.modalText}>
                1. Goods Once Received Cannot be Returned Or Exchanged.
              </Text>
              <Text style={styles.modalText}>
                2. Delivery charges may differ based on distance.
              </Text>
              <Text style={styles.modalText}>
                3. Minimum order should be Rs. 1000 for delivery.
              </Text>
              <Text style={styles.modalText}>
                4. We ensure that the BuyTown products you order are of high quality and trustworthy.
              </Text>
              <Text style={styles.modalText}>
                5. Providing you with the best service is our top priority.
              </Text> */}
              {/* Add more terms as needed */}
            </ScrollView>
            {loading ? (
              <ActivityIndicator size="large" color="#eb1f2a" />
            ) : (
              <TouchableOpacity style={styles.agreeButton} onPress={handleAgreeTerms}>
                <Text style={styles.agreeButtonText}>I Agree</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

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
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center', flex: 1, justifyContent: 'center', backgroundColor: '#ffffff', },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 20 },
  welcome: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color:"#000000" },
  instruction: { fontSize: 16, marginBottom: 20, color: '#000000' },
  pinContainer: { flexDirection: 'row', marginBottom: 30, justifyContent: 'space-between', width: '80%' },
  pinInput: {
    borderBottomWidth: 2,
    borderColor: '#000000',
    width: 50,
    height: 40,
    textAlign: 'center',
    fontSize: 24,
    marginHorizontal: 5,
    color: '#000000'
  },
  otpPinInput: {
    borderBottomWidth: 2,
    borderColor: '#000000',
    width: 30,
    height: 40,
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
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
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
