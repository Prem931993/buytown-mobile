import { Inter_400Regular, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import axios from "axios";
import { Formik } from 'formik';
import { useCallback, useContext, useEffect, useState } from 'react';
import {
  Image,
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text, TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import * as Yup from 'yup';
// import Config from "react-native-config";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppContext } from './../ContextAPI/ContextAPI';


const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/auth/user/validate-phone`; // replace with your token endpoint




export default function LoginScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [loginResponse, setLoginResponse] = useState({})
  const [initialPhone, setInitialPhone] = useState('');
  const { apiToken, onGenerateToken, onOTPCode } = useContext(AppContext);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });

  useEffect(() => {
    const getIdentity = async () => {
      const identity = await AsyncStorage.getItem("Identity");
      if (identity) {
        const phone = identity.replace('+91', '');
        setInitialPhone(phone);
      }
    };
    getIdentity();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
      
    }, 1500);
  }, []);

  const loginValidationSchema = Yup.object().shape({
    email: Yup.string().required('Phone Number is required'),
    // password: Yup.string().required('Password is required'),
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const showModal = (message) => {
    setModalMessage(message);
    setModalVisible(true);
  };


  const loginValidate = async (values) => {
    if(apiToken) {
      try {
        const response = await axios.post(`${API_URL}`, {phone_no: values}, {
          headers: {
            'Authorization': `Bearer ${apiToken}`, // Replace `apiToken` with your actual token
            'Content-Type': 'application/json'
          }
        })
        if(response.data.statusCode === 200) {
          setLoginResponse(response.data);
          if(response.data.hasPassword === false) {
            navigation.navigate('SetPin');
            onOTPCode(response.data.message);
            await AsyncStorage.setItem("userId", String(response.data.userId));
          } else {
            navigation.navigate('Pin');
          }
        }
      } catch (error) {
        // console.error("Error fetching token:", error.response?.data);
        await AsyncStorage.removeItem("apiToken");

        if(error.response?.data.error == "User not found.") {
          showModal("Account does not exist. Please contact the administrator.");
        }
        if(error.response?.data == "Invalid or expired API token.") {
          onGenerateToken(true)
        }
        throw error;
      }
    } else {
      onGenerateToken(true);
    }
    
  };

  const handleLogin = async (values) => {
    // navigation.navigate('MainTabs');
    loginValidate("+91" + values.email)
    await AsyncStorage.setItem("Identity", "+91" + values.email);
    // if(values.email === "9876543210") {
    //   navigation.navigate('Pin');
    // }else if(values.email === "9876543211") {
    //   navigation.navigate('SetPin');
    // }

  };

  if (!fontsLoaded) return null;

  const handleForgot = () => {
    navigation.navigate('ForgotPassword');
  }

  return (
    <>
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="black" />
        

        <View style={styles.loginSection}>
          <View style={styles.loginTop}>
            {/* <View style={styles.logoWrap}> */}
                <Image source={require('./../assets/logo-brand.png')} style={{ width: 250, height: 65, resizeMode: 'contain', marginBottom: 10 }}/>
            {/* </View> */}
            <Text style={styles.title}>Sign in</Text>
            <Text style={styles.subTitle}>Enter your Phone Number</Text>
          </View>

          <View style={styles.loginBox}>
            <Formik
              initialValues={{ email: initialPhone }}
              validationSchema={loginValidationSchema}
              onSubmit={handleLogin}
              enableReinitialize={true}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <>
                  <View style={styles.phoneInputContainer}>
                    <Text style={styles.countryCode}>+91</Text>
                    <TextInput
                      placeholder="Phone Number"
                      onChangeText={handleChange('email')}
                      style={[styles.phoneInput, isFocused && styles.inputFocused]}
                      onFocus={() => setIsFocused(true)}
                      onBlur={handleBlur('email')}
                      value={values.email}
                      keyboardType="phone-pad"
                      autoCapitalize="none"
                      maxLength={10}
                    />
                  </View>
                  {touched.email && errors.email && <Text style={styles.error}>{errors.email}</Text>}

                  {/* <TextInput
                    style={styles.input}
                    placeholder="Password"
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    value={values.password}
                    secureTextEntry
                  /> */}
                  {touched.password && errors.password && (
                    <Text style={styles.error}>{errors.password}</Text>
                  )}

                  <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Login</Text>
                  </TouchableOpacity>

                  {/* <TouchableOpacity style={styles.forgotPassword} onPress={handleForgot}>
                    <Text style={styles.forgotPasswordText}>Forgot PIN</Text>
                  </TouchableOpacity> */}
                </>
              )}
            </Formik>
          </View>
          <View style={styles.registerBlock}>
              
              {/* <Text style={styles.registerBlockText}>Please contact the administrator at</Text> */}
              <Text
                style={styles.linkText}
                onPress={() => Linking.openURL('tel:+919566999793')}
              >
                <Text style={styles.highlightText}>For Registration</Text>
                {/* <Icon style={styles.callIcon} name='call-outline' size={20} /> */}
                <Text style={styles.callText}>&nbsp; Call Us Now.</Text>
              </Text>
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
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(false);
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>{modalMessage}</Text>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.modalButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', backgroundColor:"#ffffff", },
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
    color: '#9fa1b0'
  },
  input: {
    borderWidth: 1,
    borderColor: '#e4e5e6',
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
    // backgroundColor: '#ffffffff',
    paddingTop: 50,
    paddingBottom: 20,
    flexGrow:1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginSection: {
    // backgroundColor: '#ffffff',
    alignItems: 'center',
    // flexGrow: 1,
    borderRadius: 16,
  },
  loginBox: {
    width: '90%',
    backgroundColor: "#ffffff",
    paddingHorizontal: 30,
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
    width:250,
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
    paddingTop:5,
    fontSize:16,
    width:"100%"
  },
  registerBlockText:  {
    textAlign: "center",
    color:"#767881",
    fontSize:16,
    width:"100%"
  },
  linkText: {
    color: '#21306b',
    // textDecorationLine: 'underline',
    fontSize:16,
    textAlign: "center",
    // flexDirection: 'row',
    // alignItems: 'center',
    paddingTop:10,
    width:"100%",
    // backgroundColor:"#ff0000"
    
  },
  callIcon: {
    // marginRight:20,
    // marginTop:10,
    // position:"relative",
    // top:5,
    color: '#21306b',
  },
  callText: {
    // paddingLeft:10,
    // marginLeft:20,
    marginTop:-5,
  },
  highlightText: {
    color:"#9fa1b0",
    textAlign: "center",
    fontSize:16,
  },
  policyBlock: {
    width: '100%',
    backgroundColor: '#f2f2f2',
    // paddingVertical: 20,
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
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e4e5e6',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  countryCode: {
    fontSize: 16,
    paddingRight: 10,
    color: '#21306b',
    fontWeight: 'bold',
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 18,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16,
  },
  modalButton: {
    backgroundColor: '#eb1f2a',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
