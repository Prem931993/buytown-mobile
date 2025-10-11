import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useContext, useEffect, useState } from 'react';
import {
  Image,
  Linking,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RFValue } from "react-native-responsive-fontsize";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from './../ContextAPI/ContextAPI';


export default function WelcomeScreen() {
  const navigation = useNavigation();
 const { onGenerateToken } = useContext(AppContext);
 const [isLogin, setIsLogin] = useState(false);
  // AsyncStorage.removeItem("isLoggedIn");
  // useEffect(() => {
  //     const clearLogin = async () => {
  //       try {
  //         await AsyncStorage.setItem("isLoggedIn", "false");
  //       } catch (e) {
  //         console.error("Error removing isLoggedIn:", e);
  //       }
  //     };
  
  //     clearLogin();
  //   }, []);
 

   useEffect(() => {
    const isLogin = async () => {
      try {
        const value = await AsyncStorage.getItem("isLoggedIn");
        // if(value) {
          
        //   navigation.navigate('MainTabs');
        // }
        const isLoggedIn = JSON.parse(value);
        if (value !== null) {

          // Convert string to boolean if you expect boolean
          // const isLoggedIn = value === "true";

          if(isLoggedIn) {
            
            setIsLogin(true);
          }
        }
      } catch (e) {
        console.error("Error removing isLoggedIn:", e);
      }
    };

    isLogin();
  }, []);

  useEffect(()=> {
    if(isLogin) {
      navigation.navigate('MainTabs');
    }
  }, [isLogin])


 useEffect(()=> {
    onGenerateToken(true);
 }, [])
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      {/* Top Image */}
      {/* Text Content */}
      {isLogin ? <>
      </>
      :  
        <View style={styles.content}>
          <Image
          source={require('./../assets/welcomeScreenImg.png')} // replace with your image path
          style={styles.topImage}
        />

          {/* <Text style={styles.welcome}>Welcome to BuyTown!</Text> */}
          <Image source={require('./../assets/logo-brand.png')} style={{ width: 250, height: 55, resizeMode: 'contain', marginBottom: 0 }}/>
          <Text style={styles.description}>
            Get ready to style your space with trendsetting interiors.
          </Text>

          {/* Get Started Button */}
          <TouchableOpacity
            style={styles.getStartedBtn}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>

          <Text
            style={styles.loginText}
            onPress={() => Linking.openURL('tel:+919566999793')}
          >
            <Text style={styles.highlightText}>For Registration</Text>
            {/* <Icon style={styles.callIcon} name='call-outline' size={20} /> */}
            <Text style={styles.callText}>&nbsp; Call Us Now.</Text>
          </Text>
        </View>
      }
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf4f4ff',
    padding:10,
    paddingTop:50,
    // alignItems: 'center',
  },
  topImage: {
    // width: '100%',
    // height: 350,
    width: wp('100%'),
    height: hp('40%'),
    // aspectRatio: 9 / 3,
    // width: width - 40,     // dynamic width (screen width - margin)
    // height: undefined,     // height will adjust automatically
    aspectRatio: 4 / 3,   // keep aspect ratio (can adjust like 4/3 or 1)
    resizeMode: 'contain',
    borderRadius:20,
  },
  content: {
    padding: 0,
    paddingTop:25,
    alignItems: 'center',
  },
  title: {
    // fontSize: RFValue(22),
    fontWeight: 'bold',
    marginTop: 16,
    color: '#333',
    
  },
  subtitle: {
    fontSize: RFValue(14),
    textAlign: 'center',
    color: '#666',
    marginTop: 8,
    marginBottom: 16,
  },
  welcome: {
    fontSize: 16,
    color: '#eb1f2a',
    marginTop: 10,
  },
  description: {
    fontSize: RFValue(27),
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
    color: '#000',
    paddingHorizontal:20
  },
  getStartedBtn: {
    backgroundColor: '#eb1f2a',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 10,
    width:"90%",
    textAlign: 'center',
  },
  getStartedText: {
    color: '#fff',
    fontSize: RFValue(14),
    textAlign: 'center',
  },
  loginText: {
    marginTop: 18,
    color: '#444',
  },
  loginLink: {
    color: '#eb1f2a',
    fontWeight: 'bold',
  },
});
