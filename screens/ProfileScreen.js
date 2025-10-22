import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import { Formik } from 'formik';
import { useContext, useEffect, useState } from 'react';
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
  street: Yup.string().required('Street Address is required'),
  city: Yup.string().required('City is required'),
  state: Yup.string().required('State is required'),
  zip_code: Yup.string().required('Zip Code is required').matches(/^[0-9]{6}$/, 'Zip Code must be 6 digits'),
  country: Yup.string().required('Country is required'),
});

export default function ProfileScreen({ navigation }) {
  const { apiToken, accessTokens, logout } = useContext(AppContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gstLoading, setGstLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

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

  const fetchGSTDetails = async (gstNumber) => {
    if (!gstNumber || gstNumber.length < 15) return;
    setGstLoading(true);
    try {
      const response = await axios.post('https://gst-verification.p.rapidapi.com/v3/tasks/sync/verify_with_source/ind_gst_certificate', {
        task_id: '74f4c926-250c-43ca-9c53-453e87ceacd1',
        group_id: '8e16424a-58fc-4ba4-ab20-5bc8e7c3c41e',
        data: { gstin: gstNumber }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-host': 'gst-verification.p.rapidapi.com',
          'x-rapidapi-key': 'dde12f15eemsha9b21be25825a20p1e707ajsn9091b64f86f0'
        }
      });
      if (response.data && response.data.status === 'completed' && response.data.result?.source_output?.status === 'id_found') {
        const address = response.data.result.source_output.principal_place_of_business_fields?.principal_place_of_business_address;
        return {
          street: address?.street || '',
          city: address?.location || '',
          state: address?.state_name || '',
          zip_code: address?.pincode || '',
        };
      } else {
        Alert.alert('GST Error', 'Invalid GST number or unable to fetch details.');
        return null;
      }
    } catch (error) {
      console.error('GST fetch error:', error);
      if (error.response?.status === 429) {
        Alert.alert('Rate Limit Exceeded', 'Too many requests. Please try again later.');
      } else {
        Alert.alert('Error', 'Failed to fetch GST details.');
      }
      return null;
    } finally {
      setGstLoading(false);
    }
  };

  const handleGSTChange = async (text, setFieldValue) => {
    setFieldValue('gstin', text);
    if (text.length === 15) {
      const gstDetails = await fetchGSTDetails(text);
      if (gstDetails) {
        setFieldValue('street', gstDetails.street);
        setFieldValue('city', gstDetails.city);
        setFieldValue('state', gstDetails.state);
        setFieldValue('zip_code', gstDetails.zip_code);
      }
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setSubmitting(true);
    try {
      const address = JSON.stringify({
        street: values.street,
        city: values.city,
        state: values.state,
        zip_code: values.zip_code,
        country: values.country,
        gstin: values.gstin
      });

      const payload = {
        firstname: values.firstname,
        lastname: values.lastname,
        email: values.email,
        phone_no: values.phone,
        address: address,
        gstin: values.gstin
      };

      const response = await axios.put(UPDATE_PROFILE_API, payload, {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'X-User-Token': `Bearer ${accessTokens}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.statusCode === 200) {
        setModalMessage('Profile updated successfully!');
        setSuccessModalVisible(true);
        setTimeout(() => {
          setSuccessModalVisible(false);
          navigation.navigate('MainTabs');
        }, 2000);
      } else {
        setModalMessage('Failed to update profile. Please try again.');
        setErrorModalVisible(true);
      }
    } catch (error) {
      console.error('Error updating profile:', error.response?.data || error.message);
      setModalMessage('Failed to update profile. Please try again.');
      setErrorModalVisible(true);
    } finally {
      setSubmitting(false);
    }
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
            gstin: (() => {
              let parsedAddress = {};
              if (profile?.address) {
                if (typeof profile.address === 'string') {
                  try {
                    parsedAddress = JSON.parse(profile.address);
                  } catch (e) {
                    console.error('Error parsing address:', e);
                  }
                } else if (typeof profile.address === 'object') {
                  parsedAddress = profile.address;
                }
              }
              return parsedAddress.gstin || profile?.gstin || '';
            })(),
            firstname: profile?.firstname || '',
            lastname: profile?.lastname || '',
            email: profile?.email || '',
            phone: profile?.phone_no?.slice(-10) || '',
            street: (() => {
              let parsedAddress = {};
              if (profile?.address) {
                if (typeof profile.address === 'string') {
                  try {
                    parsedAddress = JSON.parse(profile.address);
                  } catch (e) {
                    console.error('Error parsing address:', e);
                  }
                } else if (typeof profile.address === 'object') {
                  parsedAddress = profile.address;
                }
              }
              return parsedAddress.street || '';
            })(),
            city: (() => {
              let parsedAddress = {};
              if (profile?.address) {
                if (typeof profile.address === 'string') {
                  try {
                    parsedAddress = JSON.parse(profile.address);
                  } catch (e) {
                    console.error('Error parsing address:', e);
                  }
                } else if (typeof profile.address === 'object') {
                  parsedAddress = profile.address;
                }
              }
              return parsedAddress.city || '';
            })(),
            state: (() => {
              let parsedAddress = {};
              if (profile?.address) {
                if (typeof profile.address === 'string') {
                  try {
                    parsedAddress = JSON.parse(profile.address);
                  } catch (e) {
                    console.error('Error parsing address:', e);
                  }
                } else if (typeof profile.address === 'object') {
                  parsedAddress = profile.address;
                }
              }
              return parsedAddress.state || '';
            })(),
            zip_code: (() => {
              let parsedAddress = {};
              if (profile?.address) {
                if (typeof profile.address === 'string') {
                  try {
                    parsedAddress = JSON.parse(profile.address);
                  } catch (e) {
                    console.error('Error parsing address:', e);
                  }
                } else if (typeof profile.address === 'object') {
                  parsedAddress = profile.address;
                }
              }
              return parsedAddress.zip_code || '';
            })(),
            country: (() => {
              let parsedAddress = {};
              if (profile?.address) {
                if (typeof profile.address === 'string') {
                  try {
                    parsedAddress = JSON.parse(profile.address);
                  } catch (e) {
                    console.error('Error parsing address:', e);
                  }
                } else if (typeof profile.address === 'object') {
                  parsedAddress = profile.address;
                }
              }
              return parsedAddress.country || 'IN';
            })()
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting, setFieldValue }) => (
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>GSTIN Number</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.input, touched.gstin && errors.gstin && styles.inputError]}
                    placeholder="Enter your GSTIN number"
                    value={values.gstin}
                    onChangeText={(text) => handleGSTChange(text, setFieldValue)}
                    onBlur={handleBlur('gstin')}
                    autoCapitalize="characters"
                    maxLength={15}
                  />
                  {gstLoading && <ActivityIndicator size="small" color="#eb1f2a" style={styles.loader} />}
                </View>
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
                  editable={false}
                />
                {touched.phone && errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Street Address</Text>
                <TextInput
                  style={[styles.input, touched.street && errors.street && styles.inputError]}
                  placeholder="Enter your street address"
                  value={values.street}
                  onChangeText={handleChange('street')}
                  onBlur={handleBlur('street')}
                  autoCapitalize="words"
                />
                {touched.street && errors.street && <Text style={styles.errorText}>{errors.street}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>City</Text>
                <TextInput
                  style={[styles.input, touched.city && errors.city && styles.inputError]}
                  placeholder="Enter your city"
                  value={values.city}
                  onChangeText={handleChange('city')}
                  onBlur={handleBlur('city')}
                  autoCapitalize="words"
                />
                {touched.city && errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>State</Text>
                <TextInput
                  style={[styles.input, touched.state && errors.state && styles.inputError]}
                  placeholder="Enter your state"
                  value={values.state}
                  onChangeText={handleChange('state')}
                  onBlur={handleBlur('state')}
                  autoCapitalize="words"
                />
                {touched.state && errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Zip Code</Text>
                <TextInput
                  style={[styles.input, touched.zip_code && errors.zip_code && styles.inputError]}
                  placeholder="Enter your zip code"
                  value={values.zip_code}
                  onChangeText={handleChange('zip_code')}
                  onBlur={handleBlur('zip_code')}
                  keyboardType="numeric"
                  maxLength={6}
                />
                {touched.zip_code && errors.zip_code && <Text style={styles.errorText}>{errors.zip_code}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Country</Text>
                <TextInput
                  style={[styles.input, touched.country && errors.country && styles.inputError]}
                  placeholder="Enter your country"
                  value={values.country}
                  onChangeText={handleChange('country')}
                  onBlur={handleBlur('country')}
                  autoCapitalize="words"
                />
                {touched.country && errors.country && <Text style={styles.errorText}>{errors.country}</Text>}
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
                </View>
              )}
            </View>
          )}
        </Formik>
        )}
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={successModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIcon}>
              <Icon name="checkmark-circle" size={60} color="#4CAF50" />
            </View>
            <Text style={styles.modalTitle}>Success!</Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
          </View>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal
        visible={errorModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setErrorModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.errorIcon}>
              <Icon name="close-circle" size={60} color="#F44336" />
            </View>
            <Text style={styles.modalTitle}>Error</Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setErrorModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  inputWrapper: {
    position: 'relative',
  },
  loader: {
    position: 'absolute',
    right: 10,
    top: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '80%',
    maxWidth: 300,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  successIcon: {
    marginBottom: 20,
  },
  errorIcon: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#eb1f2a',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

});
