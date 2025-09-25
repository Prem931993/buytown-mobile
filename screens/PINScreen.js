import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import { useContext, useEffect, useState } from 'react';
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';
import { AppContext } from './../ContextAPI/ContextAPI';

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/auth/user/login`; // replace with your token endpoint

export default function PinEntryScreen({ navigation }) {
  const [pin, setPin] = useState(['', '', '', '']);
  const [loginResponse, setLoginResponse] = useState()
  const { apiToken, onGenerateToken, setAccessTokenState, accessTokens  } = useContext(AppContext);

  useEffect(() => {
    if (accessTokens) {
      navigation.navigate('MainTabs');
    }
  }, [accessTokens, navigation]);

  const handlePinChange = (value, index) => {
    // Only handle typing digits, not backspace (handled by onKeyPress)
    if (value && value !== '') {
      const updatedPin = [...pin];
      updatedPin[index] = value;
      setPin(updatedPin);

      // Auto focus to next field when typing
      if (index < 3) {
        const nextInput = `pin${index + 1}`;
        refs[nextInput]?.focus();
      }
    }
  };

   const showToast = (message, type) => {
      Toast.show({
        type: type, // "success" | "error" | "info"
        text1: message,
        visibilityTime: 3000,
        position: "bottom", // "top" or "bottom"
      });
    };

  const refs = {};

  const handleContinue = async() => {
    const joinedPin = pin.join('');
    if (joinedPin.length === 4) {
      const Identity = await AsyncStorage.getItem("Identity");
      console.log('Identity', Identity);

      try {
        const response = await axios.post(`${API_URL}`, {identity: Identity, password: joinedPin}, {
          headers: {
            'Authorization': `Bearer ${apiToken}`, // Replace `apiToken` with your actual token
            'Content-Type': 'application/json'
          }
        })
        console.log('Login PIN Response', response);
        if(response.data.statusCode === 200) {
          setLoginResponse(response.data);
          const accessToken = response.data.setAccessTokenState;
          await AsyncStorage.setItem("accessToken", accessToken);
          await AsyncStorage.setItem("refreshToken", String(response.data.refreshToken));
          await AsyncStorage.setItem("userId", String(response.data.user.id));
          await AsyncStorage.setItem("isLoggedIn", "true");
          setAccessTokenState(accessToken);
          navigation.navigate('MainTabs');
        }
      } catch (error) {
        console.error("Error fetching token:", error.response?.data || error.message);
        await AsyncStorage.removeItem("apiToken");
        if(error.response?.data.statusCode == "401") {
          showToast("Incorrect password", "error");
        }

        if(error.response?.data == "Invalid or expired API token.") {
          onGenerateToken(true)
        }
        // For testing, even if API fails, navigate to MainTabs and set dummy data
        await AsyncStorage.setItem("accessToken", "dummy");
        await AsyncStorage.setItem("userId", "dummy");
        navigation.navigate('MainTabs');
        // throw error;
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
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <Image source={require('./../assets/userImage.png')} style={styles.avatar} />
      {/* <I
      ine" size={24} color="#ffffff" style={{ marginBottom: 10,}} /> */}
      {/* <Image source={require('./../assets/logo.png')} style={{ width: 250, height: 65, resizeMode: 'contain', marginBottom: 10 }}/> */}
      <Text style={styles.welcome}>Welcome user</Text>
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
            value={digit}
            secureTextEntry={true}
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
  skip: {
    color: '#ffffff',
    marginTop: 10,
  },
});
