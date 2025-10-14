import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import { Formik } from 'formik';
import { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Yup from 'yup';
import { AppContext } from './../ContextAPI/ContextAPI';
import InnerHeader from './../components/InnerHeader';

const PROFILE_API = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/auth/user/profile`;
const UPDATE_PROFILE_API = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/auth/user/update-profile`;

const validationSchema = Yup.object().shape({
  firstname: Yup.string().required('First Name is required').min(2, 'First Name must be at least 2 characters'),
  lastname: Yup.string().required('Last Name is required').min(2, 'Last Name must be at least 2 characters'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string().required('Phone Number is required').matches(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
  gstin: Yup.string().optional(),
});

export default function ProfileScreen({ navigation }) {
  const { apiToken, accessTokens, logout } = useContext(AppContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(PROFILE_API, {
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'X-User-Token': `Bearer ${accessTokens}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.data.statusCode === 200) {
          setProfile(response.data.user); // Assuming the user data is in response.data.user
        }
      } catch (error) {
        console.error('Error fetching profile:', error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    if (apiToken && accessTokens) {
      fetchProfile();
    }
  }, [apiToken, accessTokens]);

  const handleSubmit = async (values, { setSubmitting }) => {
    setSubmitting(true);
    try {
      const userId = await AsyncStorage.getItem("userId");
      const response = await axios.post(UPDATE_PROFILE_API, { userId, ...values }, {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'X-User-Token': `Bearer ${accessTokens}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.data.statusCode === 200) {
        Alert.alert('Success', 'Profile updated successfully');
        navigation.navigate('MainTabs');
      } else {
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    navigation.navigate('MainTabs');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <InnerHeader showSearch={false} />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          {profile && profile.firstname && profile.lastname ? (
            <View style={styles.initialsContainer}>
              <Text style={styles.initialsText}>
                {`${profile.firstname.charAt(0)}${profile.lastname.charAt(0)}`.toUpperCase()}
              </Text>
            </View>
          ) : (
            <Image source={require('./../assets/userImage.png')} style={styles.profileImage} />
          )}
          <Text style={styles.subtitle}>Help us personalize your experience</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#eb1f2a" />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        ) : (
          <Formik
          initialValues={{
            gstin: profile?.gstin || '',
            firstname: profile?.firstname || '',
            lastname: profile?.lastname || '',
            email: profile?.email || '',
            phone: profile?.phone_no?.slice(-10) || ''
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>GSTIN Number</Text>
                <TextInput
                  style={[styles.input, touched.gstin && errors.gstin && styles.inputError]}
                  placeholder="Enter your GSTIN number"
                  value={values.gstin}
                  onChangeText={handleChange('gstin')}
                  onBlur={handleBlur('gstin')}
                  autoCapitalize="characters"
                />
                {touched.gstin && errors.gstin && <Text style={styles.errorText}>{errors.gstin}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                  style={[styles.input, touched.firstname && errors.firstname && styles.inputError]}
                  placeholder="Enter your first name"
                  value={values.firstname}
                  onChangeText={handleChange('firstname')}
                  onBlur={handleBlur('firstname')}
                  autoCapitalize="words"
                />
                {touched.firstname && errors.firstname && <Text style={styles.errorText}>{errors.firstname}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  style={[styles.input, touched.lastname && errors.lastname && styles.inputError]}
                  placeholder="Enter your last name"
                  value={values.lastname}
                  onChangeText={handleChange('lastname')}
                  onBlur={handleBlur('lastname')}
                  autoCapitalize="words"
                />
                {touched.lastname && errors.lastname && <Text style={styles.errorText}>{errors.lastname}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={[styles.input, touched.email && errors.email && styles.inputError]}
                  placeholder="Enter your email"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={[styles.input, touched.phone && errors.phone && styles.inputError]}
                  placeholder="Enter your phone number"
                  value={values.phone}
                  onChangeText={handleChange('phone')}
                  onBlur={handleBlur('phone')}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
                {touched.phone && errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
              </View>

              {isSubmitting ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#eb1f2a" />
                  <Text style={styles.loadingText}>Updating profile...</Text>
                </View>
              ) : (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
                    <Text style={styles.saveButtonText}>Save Profile</Text>
                  </TouchableOpacity>

                  <View style={styles.secondaryActions}>
                    <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                      <Text style={styles.skipButtonText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.logoutButton} onPress={() => logout(navigation)}>
                      <Text style={styles.logoutButtonText}>Logout</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}
        </Formik>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginLeft: -24, // Adjust for back button width
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  initialsContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  initialsText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  buttonContainer: {
    marginTop: 30,
  },
  saveButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  skipButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#eb1f2a',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
    elevation: 1,
  },
  skipButtonText: {
    color: '#eb1f2a',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#666',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 10,
    elevation: 1,
  },
  logoutButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});
