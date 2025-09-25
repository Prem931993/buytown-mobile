import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import { useContext, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { AppContext } from './../ContextAPI/ContextAPI';

const PROFILE_API = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/auth/user/update-profile`; // hypothetical endpoint

export default function ProfileScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const { apiToken, logout } = useContext(AppContext);

  const handleSubmit = async () => {
    if (!name || !email || !phone) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem("userId");
      const response = await axios.post(PROFILE_API, { userId, name, email, phone }, {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.data.statusCode === 200) {
        Alert.alert('Success', 'Profile updated successfully');
        navigation.navigate('MainTabs'); // Navigate to home or next screen
      } else {
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigation.navigate('MainTabs');
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <Text style={styles.title}>Set Personal Details</Text>
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      {loading ? (
        <ActivityIndicator size="large" color="#eb1f2a" />
      ) : (
        <>
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Save Details</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button2} onPress={handleSkip}>
            <Text style={styles.buttonText2}>Update Later</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={() => logout(navigation)}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#eb1f2a',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#ffffff',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#ffffff',
    color: '#333',
  },
  button: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#eb1f2a',
    fontSize: 16,
  },
  button2: {
    paddingTop: 20,
    textAlign: 'center',
  },
  buttonText2: {
     color: '#ffffff',
     textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
