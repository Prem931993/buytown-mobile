import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import { useContext, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
  const [pin, setPin] = useState(['', '', '', '']);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const { apiToken, otp, otpCode, setAccessTokenState } = useContext(AppContext);

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

  const refs = {};

  const handleSetPinPress = async () => {
    const joinedPin = pin.join('');
    if (joinedPin.length === 4) {
      await setPinApiCall();
    } else {
      Alert.alert('Error', 'Please enter a 4-digit PIN');
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
        navigation.navigate('ProfileScreen');
      } else {
        Alert.alert('Error', 'Failed to agree to terms. Please try again.');
      }
    } catch (error) {
      console.error('Error agreeing terms:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to agree to terms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const setPinApiCall = async () => {
    const joinedPin = pin.join('');
    try {
      const userId = await AsyncStorage.getItem("userId");
      const response = await axios.post(`${API_URL}`, {userId: userId, otp:otpCode,  newPassword: joinedPin}, {
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
        setAccessTokenState(response.data.accessToken);
        // Show terms modal after PIN is set
        setModalVisible(true);
      } else {
        Alert.alert('Error', 'Failed to set PIN. Please try again.');
      }
    } catch (error) {
      console.error("Error setting PIN:", error.response?.data || error.message);
      Alert.alert('Error', 'Failed to set PIN. Please try again.');
    }
  };

  const handleForgot = () => {
    navigation.navigate('ForgotPassword');
  }
  const [otpValue, setOtpValue] = useState(otpCode)
  const handleOTPChange = (value) => {
    setOtpValue(value)
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <Image source={require('./../assets/userImage.png')} style={styles.avatar} />
      <Text style={styles.welcome}>Welcome user</Text>
      <Text style={styles.instruction}>Enter OTP</Text>
      <TextInput
        placeholder=""
        value={otpValue}
        keyboardType=""
        autoCapitalize="none"
        style={styles.otpInput}
      />
      <Text style={styles.instruction}>Set New 4-digit Pin</Text>
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

      <TouchableOpacity style={styles.button} onPress={handleSetPinPress}>
        <Text style={styles.buttonText}>Set Pin</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center', flex: 1, justifyContent: 'center', backgroundColor: '#eb1f2a', },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 20 },
  welcome: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color:"#ffffff" },
  instruction: { fontSize: 16, marginBottom: 20, color: '#ffffff' },
  pinContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '80%' },
  pinInput: {
    borderBottomWidth: 2,
    borderColor: '#ffffff',
    width: 50,
    height: 50,
    textAlign: 'center',
    fontSize: 24,
    marginHorizontal: 5,
    color: '#ffffff'
  },
  otpInput: {
    width: "100%",
    maxWidth: "80%",
    height: 50,
    borderWidth: 1,
    borderColor: '#ffffff',
    color:"#ffffff",
    paddingHorizontal:15,
    borderRadius: 6,
    marginBottom: 50,
  },
  forgot: {
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    marginTop:30
  },
  buttonText: { color: '#eb1f2a', fontSize: 16 },
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
