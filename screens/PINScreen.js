import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import { useContext, useEffect, useState } from 'react';
import {
  Image,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { AppContext } from './../ContextAPI/ContextAPI';

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/auth/user/login`; // replace with your token endpoint

export default function PinEntryScreen({ navigation }) {
  const [pin, setPin] = useState(['', '', '', '']);
  const [loginResponse, setLoginResponse] = useState()
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const { apiToken, onGenerateToken, setAccessTokenState, accessTokens  } = useContext(AppContext);

  useEffect(() => {
    const getPhoneNumber = async () => {
      const identity = await AsyncStorage.getItem("Identity");
      setPhoneNumber(identity || '');
    };
    getPhoneNumber();
  }, []);

  const handlePinChange = (value, index) => {
    const updatedPin = [...pin];
    updatedPin[index] = value;
    setPin(updatedPin);

    // Auto focus to next field when typing (only for non-empty values)
    if (value && value !== '' && index < 3) {
      const nextInput = `pin${index + 1}`;
      refs[nextInput]?.focus();
    }
  };

  const refs = {};

  const handleContinue = async() => {
    const joinedPin = pin.join('');
    if (joinedPin.length === 4) {
      const Identity = await AsyncStorage.getItem("Identity");

      try {
        const response = await axios.post(`${API_URL}`, {identity: Identity, password: joinedPin}, {
          headers: {
            'Authorization': `Bearer ${apiToken}`, // Replace `apiToken` with your actual token
            'Content-Type': 'application/json'
          }
        })
        if(response.data.statusCode === 200) {
          setLoginResponse(response.data);
          const accessToken = response.data.token || response.data.accessToken || response.data.access_token;
          if (accessToken) {
            await AsyncStorage.setItem("accessToken", accessToken);
            setAccessTokenState(accessToken);
          }

          console.log("response.data", response.data);
          await AsyncStorage.setItem("refreshToken", String(response.data.refreshToken));
          await AsyncStorage.setItem("userId", String(response.data.user.id));
          await AsyncStorage.setItem("roleId", String(response.data.user.role_id));
          await AsyncStorage.setItem("agreedToTerms", String(response.data.user.agreedToTerms));
          await AsyncStorage.setItem("isLoggedIn", "true");
          const roleId = response.data.user.role_id;
          let targetScreen = 'MainTabs';
          if(roleId == 2) {
            targetScreen = 'MainTabs';
          } else if(roleId == 3) {
            targetScreen = 'DeliveryPage';
          }
          navigation.reset({
            index: 0,
            routes: [{ name: targetScreen }],
          });
        }
      } catch (error) {
        console.error("Error fetching token:", error.response?.data || error.message);
        await AsyncStorage.removeItem("apiToken");
        if(error.response?.data.statusCode == "401") {
          setErrorMessage('Incorrect password');
          setErrorModalVisible(true);
        }

        if(error.response?.data == "Invalid or expired API token.") {
          await onGenerateToken(true);
          // Retry the API call after token regeneration
          await handleContinue();
        } else {
          // Handle other errors, e.g., show error modal
          setErrorMessage('Login failed. Please try again.');
          setErrorModalVisible(true);
        }
      }


      // if(joinedPin === "1234") {
      //   navigation.navigate('MainTabs'); // Replace with your actual home/dashboard screen
      // } else if(joinedPin === "9876") {
      //   navigation.navigate('DeliveryPage'); // Replace with your actual home/dashboard screen
      // }
      
    }
  };

  const handleForgot = () => {
    navigation.navigate('ForgotPassword');
  }

 

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="black" />
      <Image source={require('./../assets/userImage.png')} style={styles.avatar} />
      {/* <I
      ine" size={24} color="#ffffff" style={{ marginBottom: 10,}} /> */}
      {/* <Image source={require('./../assets/logo-brand.png')} style={{ width: 250, height: 65, resizeMode: 'contain', marginBottom: 10 }}/> */}
      <Text style={styles.welcome}>{phoneNumber}</Text>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.notYou}>Not you?</Text>
      </TouchableOpacity>
      <Text style={styles.instruction}>Enter the 4-digit Pin</Text>

      <View style={styles.pinContainer}>
        {pin.map((digit, index) => (
          <TextInput
            key={index}
            style={styles.pinInput}
            keyboardType="number-pad"
            maxLength={1}
            ref={(input) => (refs[`pin${index}`] = input)}
            onChangeText={(value) => handlePinChange(value, index)}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === 'Backspace' && index > 0) {
                const prevInput = `pin${index - 1}`;
                refs[prevInput]?.focus();
                // Clear current field
                const updatedPin = [...pin];
                updatedPin[index] = '';
                setPin(updatedPin);
              }
            }}
            value={digit ? '•' : ''}
            secureTextEntry={false}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

       <TouchableOpacity onPress={handleForgot}>
        <Text style={styles.forgot}>Forgot PIN?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={async () => {
        await AsyncStorage.setItem("accessToken", "dummy");
        await AsyncStorage.setItem("userId", "dummy");
        navigation.navigate('MainTabs');
      }}>
        <Text style={styles.skip}>Skip to Main App</Text>
      </TouchableOpacity>

      {/* <TouchableOpacity>
        <Text style={styles.passwordInstead}>Use Password login instead</Text>
      </TouchableOpacity> */}

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
  welcome: { fontSize: 20, fontWeight: 'bold', marginBottom: 5, color:"#000000" },
  notYou: { fontSize: 14, marginBottom: 15, color: '#000000', textDecorationLine: 'underline' },
  instruction: { fontSize: 16, marginBottom: 20, color: '#000000' },
  pinContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '80%' },
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
  forgot: {
    color: '#000000',
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
  skip: {
    color: '#000000',
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#000000',
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
    color: '#000000',
    fontSize: 16,
  },
});
