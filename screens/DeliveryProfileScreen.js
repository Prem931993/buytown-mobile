import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import { Formik } from 'formik';
import { useContext, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Yup from 'yup';
import CustomDropdown from '../components/CustomDropdown';
import { AppContext } from './../ContextAPI/ContextAPI';

const PROFILE_API = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/dashboard/delivery-person/profile`;
const UPDATE_PROFILE_API = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/dashboard/delivery-person/profile`;

const PRIMARY_GREEN = '#8BC34A';
const PRIMARY_BLACK = '#000000';
const SECONDARY_RED = '#E53935';
const SECONDARY_LIGHT_GRAY = '#F5F5F5';

const validationSchema = Yup.object().shape({
  firstname: Yup.string().required('First Name is required').min(2, 'First Name must be at least 2 characters'),
  lastname: Yup.string().required('Last Name is required').min(2, 'Last Name must be at least 2 characters'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string().required('Phone Number is required').matches(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
  drivingLicense: Yup.mixed().required('Driving license is required'),
  vehicles: Yup.array()
    .of(
      Yup.object().shape({
        type: Yup.string().required('Vehicle type is required'),
        registrationNumber: Yup.string().required('Registration number is required'),
      })
    )
    .max(5, 'You can add up to 5 vehicles only'),
});

export default function DeliveryProfileScreen({ navigation }) {
  const { apiToken, accessTokens, logout } = useContext(AppContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vehiclesList, setVehiclesList] = useState([]);
  const fileInputRef = useRef(null);

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
        if (response.data.success) {
          setProfile(response.data.data); // Assuming the user data is in response.data.data
        }
      } catch (error) {
        console.error('Error fetching profile:', error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchVehicles = async () => {
      try {
        const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/api/v1/dashboard/delivery-person/vehicles`, {
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'X-User-Token': `Bearer ${accessTokens}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.data.success) {
          setVehiclesList(response.data.data); // Assuming vehicles array is in data
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error.response?.data || error.message);
      }
    };

    if (apiToken && accessTokens) {
      fetchProfile();
      fetchVehicles();
    }
  }, [apiToken, accessTokens]);

  const handleSubmit = async (values, { setSubmitting }) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('firstname', values.firstname);
      formData.append('lastname', values.lastname);
      formData.append('email', values.email);
      formData.append('phone', values.phone);
      formData.append('vehicles', JSON.stringify(values.vehicles.map(vehicle => ({
        vehicle_id: vehicle.type,
        vehicle_number: vehicle.registrationNumber
      }))));

      if (values.drivingLicense && (values.drivingLicense.uri && !values.drivingLicense.uri.startsWith('http')) || values.drivingLicense.file) {
        if (values.drivingLicense.file) {
          // Web: append the File object directly
          formData.append('license', values.drivingLicense.file);
        } else if (Platform.OS === 'web') {
          // Web fallback
          formData.append('license', {
            uri: values.drivingLicense.uri,
            name: values.drivingLicense.name || 'drivingLicense.jpg',
            type: values.drivingLicense.mimeType || values.drivingLicense.type || 'image/jpeg',
          });
        } else {
          // Mobile: read file as base64 and create blob
          try {
            const fileInfo = await FileSystem.getInfoAsync(values.drivingLicense.uri);
            if (fileInfo.exists) {
              const base64 = await FileSystem.readAsStringAsync(values.drivingLicense.uri, {
                encoding: FileSystem.EncodingType.Base64,
              });
              const blob = new Blob([Uint8Array.from(atob(base64), c => c.charCodeAt(0))], {
                type: values.drivingLicense.mimeType || 'image/jpeg',
              });
              formData.append('license', blob, values.drivingLicense.name || 'drivingLicense.jpg');
            }
          } catch (error) {
            console.error('Error reading file for upload:', error);
            Alert.alert('Error', 'Failed to read the selected file. Please try again.');
            setSubmitting(false);
            return;
          }
        }
      }

      const response = await axios.put(UPDATE_PROFILE_API, formData, {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'X-User-Token': `Bearer ${accessTokens}`,
        }
      });
      if (response.data.success) {
        Alert.alert('Success', 'Profile updated successfully');
        navigation.goBack();
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
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_GREEN} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Delivery Profile</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image source={require('./../assets/userImage.png')} style={styles.profileImage} />
            <View style={styles.avatarBadge}>
              <MaterialIcons name="delivery-dining" size={16} color="#fff" />
            </View>
          </View>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.subtitle}>Keep your delivery profile up to date</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PRIMARY_GREEN} />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        ) : (
          <Formik
          initialValues={{
            firstname: profile?.firstname || '',
            lastname: profile?.lastname || '',
            email: profile?.email || '',
            phone: profile?.phone_no?.slice(-10) || '',
            drivingLicense: profile?.license ? { uri: profile.license } : null,
            vehicles: profile?.vehicles?.length > 0 ? profile.vehicles.map(v => ({ type: v.vehicle_id, registrationNumber: v.vehicle_number })) : [{ type: '', registrationNumber: '' }],
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting, setFieldValue }) => (
            <View style={styles.formContainer}>
              {/* Personal Information Section */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <MaterialIcons name="person" size={20} color={PRIMARY_GREEN} />
                  <Text style={styles.sectionTitle}>Personal Information</Text>
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputWrapperRow}>
                    <Text style={styles.label}>First Name</Text>
                    <View style={[styles.inputContainer, touched.firstname && errors.firstname && styles.inputError]}>
                      <Icon name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                      <TextInput
                        style={styles.inputField}
                        placeholder="Enter first name"
                        value={values.firstname}
                        onChangeText={handleChange('firstname')}
                        onBlur={handleBlur('firstname')}
                        autoCapitalize="words"
                      />
                    </View>
                    {touched.firstname && errors.firstname && <Text style={styles.errorText}>{errors.firstname}</Text>}
                  </View>

                  <View style={styles.inputWrapperRowLast}>
                    <Text style={styles.label}>Last Name</Text>
                    <View style={[styles.inputContainer, touched.lastname && errors.lastname && styles.inputError]}>
                      <Icon name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                      <TextInput
                        style={styles.inputField}
                        placeholder="Enter last name"
                        value={values.lastname}
                        onChangeText={handleChange('lastname')}
                        onBlur={handleBlur('lastname')}
                        autoCapitalize="words"
                      />
                    </View>
                    {touched.lastname && errors.lastname && <Text style={styles.errorText}>{errors.lastname}</Text>}
                  </View>
                </View>

                <View style={[styles.inputWrapper, {marginTop: 12}]}>
                  <Text style={styles.label}>Email Address</Text>
                  <View style={[styles.inputContainer, touched.email && errors.email && styles.inputError]}>
                    <Icon name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.inputField}
                      placeholder="Enter your email"
                      value={values.email}
                      onChangeText={handleChange('email')}
                      onBlur={handleBlur('email')}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Phone Number</Text>
                  <View style={[styles.inputContainer, touched.phone && errors.phone && styles.inputError]}>
                    <Icon name="call-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.inputField}
                      placeholder="Enter phone number"
                      value={values.phone}
                      onChangeText={handleChange('phone')}
                      onBlur={handleBlur('phone')}
                      keyboardType="phone-pad"
                      maxLength={10}
                    />
                  </View>
                  {touched.phone && errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Driving License</Text>
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={async () => {
                      if (Platform.OS === 'web') {
                        fileInputRef.current.click();
                      } else {
                        try {
                          const result = await DocumentPicker.getDocumentAsync({
                            type: 'image/*',
                            copyToCacheDirectory: true,
                          });
                          if (result.type === 'success') {
                            setFieldValue('drivingLicense', result);
                          }
                        } catch (error) {
                          console.error('Error picking document:', error);
                          Alert.alert('Error', 'Failed to pick document. Please try again.');
                        }
                      }
                    }}
                  >
                    <Text style={styles.uploadButtonText}>
                      {values.drivingLicense ? 'Change Image' : 'Upload Image'}
                    </Text>
                  </TouchableOpacity>
                  {values.drivingLicense && values.drivingLicense.uri && (
                    <Image source={{ uri: values.drivingLicense.uri }} style={styles.previewImage} />
                  )}
                  {Platform.OS === 'web' && (
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setFieldValue('drivingLicense', {
                            uri: URL.createObjectURL(file),
                            name: file.name,
                            type: file.type,
                            file: file,
                          });
                        }
                      }}
                      accept="image/*"
                    />
                  )}
                  {touched.drivingLicense && errors.drivingLicense && <Text style={styles.errorText}>{errors.drivingLicense}</Text>}
                </View>
              </View>

              {/* Vehicle Information Section */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <MaterialIcons name="two-wheeler" size={20} color={PRIMARY_GREEN} />
                  <Text style={styles.sectionTitle}>Vehicle Information</Text>
                </View>

                {values.vehicles.map((vehicle, index) => (
                  <View key={index} style={[styles.sectionCard, {marginBottom: 12}]}>
                    <View style={styles.inputWrapper}>
                      <Text style={styles.label}>Vehicle Type</Text>
                      <View style={[styles.inputContainer, touched.vehicles?.[index]?.type && errors.vehicles?.[index]?.type && styles.inputError]}>
                        <MaterialIcons name="directions-bike" size={20} color="#666" style={styles.inputIcon} />
                        <CustomDropdown
                          selectedValue={vehicle.type}
                          onValueChange={(itemValue) => setFieldValue(`vehicles[${index}].type`, itemValue)}
                          items={vehiclesList.map((v) => ({ label: v.vehicle_type, value: v.id }))}
                          placeholder="Select vehicle type"
                          style={{ flex: 1, marginLeft: 32, borderWidth: 0, shadowOpacity: 0, elevation: 0, backgroundColor: 'transparent', paddingHorizontal: 0 }}
                        />
                      </View>
                      {touched.vehicles?.[index]?.type && errors.vehicles?.[index]?.type && (
                        <Text style={styles.errorText}>{errors.vehicles[index].type}</Text>
                      )}
                    </View>

                    <View style={styles.inputWrapper}>
                      <Text style={styles.label}>Vehicle Number</Text>
                      <View style={[styles.inputContainer, touched.vehicles?.[index]?.registrationNumber && errors.vehicles?.[index]?.registrationNumber && styles.inputError]}>
                        <MaterialIcons name="tag" size={20} color="#666" style={styles.inputIcon} />
                        <TextInput
                          style={styles.inputField}
                          placeholder="Enter registration number"
                          value={vehicle.registrationNumber}
                          onChangeText={text => setFieldValue(`vehicles[${index}].registrationNumber`, text)}
                          onBlur={handleBlur(`vehicles[${index}].registrationNumber`)}
                          autoCapitalize="characters"
                        />
                      </View>
                      {touched.vehicles?.[index]?.registrationNumber && errors.vehicles?.[index]?.registrationNumber && (
                        <Text style={styles.errorText}>{errors.vehicles[index].registrationNumber}</Text>
                      )}
                    </View>

                    {index > 0 && (
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => {
                          const newVehicles = [...values.vehicles];
                          newVehicles.splice(index, 1);
                          setFieldValue('vehicles', newVehicles);
                        }}
                      >
                        <Text style={styles.removeButtonText}>Remove Vehicle</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}

                {values.vehicles.length < 5 && (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                      setFieldValue('vehicles', [...values.vehicles, { type: '', registrationNumber: '' }]);
                    }}
                  >
                    <Text style={styles.addButtonText}>Add Vehicle</Text>
                  </TouchableOpacity>
                )}
              </View>

              {isSubmitting ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={PRIMARY_GREEN} />
                  <Text style={styles.loadingText}>Updating profile...</Text>
                </View>
              ) : (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
                    <Icon name="checkmark-circle-outline" size={20} color="#fff" style={styles.buttonIcon} />
                    <Text style={styles.primaryButtonText}>Save Changes</Text>
                  </TouchableOpacity>

                  <View style={styles.secondaryActions}>
                    <TouchableOpacity style={styles.secondaryButton} onPress={handleSkip}>
                      <Text style={styles.secondaryButtonText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.dangerButton} onPress={() => logout(navigation)}>
                      <Icon name="log-out-outline" size={18} color="#fff" style={styles.buttonIcon} />
                      <Text style={styles.dangerButtonText}>Logout</Text>
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
    backgroundColor: '#F2F8F5',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
    minWidth: 50,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
    textAlign: 'center',
    marginLeft: -32,
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: PRIMARY_GREEN,
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: SECONDARY_LIGHT_GRAY,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    flex: 1,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginLeft: 12,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputWrapperRow: {
    flex: 1,
    marginRight: 8,
  },
  inputWrapperRowLast: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    paddingVertical: 0,
  },
  inputError: {
    borderColor: '#dc3545',
    borderWidth: 2,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 60,
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 32,
  },
  primaryButton: {
    backgroundColor: PRIMARY_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 14,
    marginBottom: 16,
    elevation: 4,
    shadowColor: PRIMARY_GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 0,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#dee2e6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  uploadButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  uploadButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '600',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 12,
    resizeMode: 'cover',
  },
  addButton: {
    backgroundColor: PRIMARY_GREEN,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
    elevation: 2,
    shadowColor: PRIMARY_GREEN,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: SECONDARY_RED,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
    elevation: 2,
    shadowColor: SECONDARY_RED,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButton: {
    flex: 1,
    backgroundColor: SECONDARY_RED,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginLeft: 8,
    elevation: 2,
    shadowColor: SECONDARY_RED,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  dangerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
});
