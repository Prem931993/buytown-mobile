import React, { useState, useCallback, useContext  } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, RefreshControl, Image, StatusBar
} from 'react-native';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { AppContext } from './../ContextAPI/ContextAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/auth/user/forgot-password`; // replace with your token endpoint

export default function LoginScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
   const { apiToken, onOTP } = useContext(AppContext);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
      
    }, 1500);
  }, []);

  const loginValidationSchema = Yup.object().shape({
    email: Yup.string().required('Phone No is required'),
    // password: Yup.string().required('Password is required'),
  });

  const handleLogin = async(values) => {
    // navigation.replace('Home');
    await AsyncStorage.getItem("Identity");
    if(apiToken) {
      try {
        const response = await axios.post(`${API_URL}`, {phone_no: values.email}, {
          headers: {
            'Authorization': `Bearer ${apiToken}`, // Replace `apiToken` with your actual token
            'Content-Type': 'application/json'
          }
        })
        if(response.data.statusCode === 200) {
          onOTP(response.data.opt)
          navigation.navigate('SetPin');
          // setLoginResponse(response.data);
          // if(response.data.hasPassword === false) {
          //   navigation.navigate('SetPin');
          // } else {
          //   navigation.navigate('Pin');
          // }
        }
      } catch (error) {
        console.error("Error fetching token:", error.response?.data || error.message);
        // await AsyncStorage.removeItem("apiToken");
        // if(error.response?.data == "Invalid or expired API token.") {
        //   onGenerateToken(true)
        // }
        throw error;
      }
    } else {
      // onGenerateToken(true);
    }

  };

  if (!fontsLoaded) return null;

  const handleForgot = () => {
    navigation.replace('Login')
  }

  const handleResetForgot = () => {
    navigation.replace('ResetPin')
  }

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, backgroundColor:"#ffffff" }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="black" />
        

        <View style={styles.loginSection}>
          <View style={styles.loginTop}>
            {/* <View style={styles.logoWrap}> */}
                <Image source={require('./../assets/logo-brand.png')} style={{ width: 200, height: 65, resizeMode: 'contain', marginBottom: 10 }}/>
            {/* </View> */}
            <Text style={styles.title}>Reset your Password</Text>
            <Text style={styles.subTitle}>Enter your Email</Text>
            <Text style={styles.subTitle}>or Phone No to Reset the PIN</Text>
          </View>
          <View style={styles.loginBox}>
            <Formik
              initialValues={{ email: ''}}
              validationSchema={loginValidationSchema}
              onSubmit={handleLogin}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <>
                  <TextInput
                    // style={styles.input}
                    placeholder="Email or Phone Number"
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                     style={[styles.input, isFocused && styles.inputFocused]}
                    onFocus={() => setIsFocused(true)}
                    value={values.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {touched.email && errors.email && <Text style={styles.error}>{errors.email}</Text>}

                  

                  <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Send</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.forgotPassword} >
                    <Text style={styles.forgotPasswordText} onPress={handleResetForgot}>Reset PIN</Text>
                    <Text style={styles.forgotPasswordText} onPress={handleForgot}>Return to Login</Text>
                  </TouchableOpacity>
                </>
              )}
            </Formik>
          </View>
          
        </View>

        
      </View>
      <View style={styles.policyBlock}>
            <Text
              style={styles.linkTextBottom}
              onPress={() =>  navigation.navigate('Terms')}
            >
              Terms and Conditions
            </Text>
            <Text
              style={styles.linkTextBottom}
              onPress={() => navigation.navigate('PrivacyPolicy')}
            >
              Refund Policy
            </Text>
        </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  title: {
    fontSize: 36,
    marginBottom: 15,
    textAlign: 'center',
    color: "#21306b",
    paddingLeft: 20,
    paddingRight: 20,
    fontFamily: "Inter_700Bold",
  },
  subTitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#21306b',
    paddingHorizontal:50,
  },
  input: {
    borderWidth: 1,
    borderColor: '#EDF1F3',
    padding: 18,
    borderRadius: 8,
    marginBottom: 10,
  },
  inputFocused: {
    borderColor: '#8ec93b', // Change to your preferred focus color
    shadowColor: '#fae3e3ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation:2, // Android shadow
  },
  loginTop: {
    backgroundColor: '#ffffff',
    paddingTop: 50,
    paddingBottom: 0,
    flexGrow:1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginSection: {
    backgroundColor: 'white',
    alignItems: 'center',
    // flexGrow: 1,
  },
  loginBox: {
    width: '90%',
    backgroundColor: "#ffffff",
    padding: 30,
    borderRadius: 16,
    // marginTop: -50,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 3 },
    // shadowOpacity: 0.1,
    // shadowRadius: 5,
    // elevation: 5
  },
  logoWrap: {
    textAlign:"center",
  },
  logo: {
    width:150,
    height:"auto"
  },
  button: {
    backgroundColor: '#000000',
    padding: 18,
    borderRadius: 8,
  },
  buttonText: {
    textAlign: "center",
    color: "#ffffff",
    fontSize: 16,
  },
  forgotPassword: {
    paddingTop:15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  forgotPasswordText: {
    textAlign: "right",
    color:"#999999"
  },
  // logo: { width: 250, height: 200, resizeMode: 'contain' },
 registerBlock: {
    textAlign: "center",
    backgroundColor: '#fffff',
    paddingLeft:25,
    paddingRight:25,
    paddingTop:45,
    fontSize:16,
  },
  registerBlockText:  {
    textAlign: "center",
    color:"#999999",
    fontSize:16,
  },
  linkText: {
    color: '#007bff',
    textDecorationLine: 'underline',
    fontSize:16,
    textAlign: "center",
  },
  highlightText: {
    color:"#000000",
    textAlign: "center",
    fontSize:16,
  },
  policyBlock: {
    width: '100%',
    backgroundColor: '#f2f2f2',
    // paddingVertical: 20,
    paddingTop:20,
    paddingBottom:50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },

  linkTextBottom: {
    color: '#999999',
    textDecorationLine: 'underline',
    fontSize: 12,
    marginVertical: 5,
    textAlign: 'center',
    marginHorizontal:10,
  },
  error: {
    color: 'red',
    marginBottom: 10
  }
});
