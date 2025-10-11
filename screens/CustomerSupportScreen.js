import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import InnerHeader from '../components/InnerHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../ContextAPI/ContextAPI';

export default function CustomerSupportScreen({ navigation }) {
  const { apiToken, accessTokens } = useContext(AppContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [generalSettings, setGeneralSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchGeneralSettings = async () => {
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/general-settings`, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'X-User-Token': `Bearer ${accessTokens}`,
        },
      });
      if (response.data.success) {
        setGeneralSettings(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching general settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGeneralSettings();
  }, []);

  const handleSubmit = () => {
    if (!name || !email || !message) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    Alert.alert('Success', 'Your enquiry has been submitted');
    setName('');
    setEmail('');
    setMessage('');
  };

  const contactDetails = {
    phone: generalSettings?.phone_number || '+1-123-456-7890',
    email: generalSettings?.company_email || 'support@buytown.com',
    address: generalSettings?.company_details || '123 Main St, City, State, ZIP',
  };

  const socialMedia = [
    generalSettings?.facebook_link ? { name: 'logo-facebook', url: generalSettings.facebook_link } : null,
    generalSettings?.twitter_link ? { name: 'logo-twitter', url: generalSettings.twitter_link } : null,
    generalSettings?.instagram_link ? { name: 'logo-instagram', url: generalSettings.instagram_link } : null,
    generalSettings?.youtube_link ? { name: 'logo-youtube', url: generalSettings.youtube_link } : null,
    generalSettings?.linkedin_link ? { name: 'logo-linkedin', url: generalSettings.linkedin_link } : null,
  ].filter(item => item);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <InnerHeader showSearch={false} />
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
          <ActivityIndicator size="large" color="#eb1f2a" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <InnerHeader showSearch={false} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.content}>
        <Text style={styles.title}>Customer Support 24x7</Text>

        {/* Enquiry Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Enquiry Form</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Message</Text>
            <TextInput
              style={[styles.input, styles.messageInput]}
              placeholder="Enter your message"
              value={message}
              onChangeText={setMessage}
              multiline
            />
          </View>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit Enquiry</Text>
          </TouchableOpacity>
        </View>

        {/* Contact Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Details</Text>
          
          <View style={styles.contactCard}>
            {generalSettings?.company_name && (
              <View style={styles.contactRowEnhanced}>
                <View style={[styles.iconCircle, { backgroundColor: '#e0f3e0' }]}>
                  <Icon name="business-outline" size={20} color="#2e7d32" />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Company</Text>
                  <Text style={styles.contactValue}>{generalSettings.company_name}</Text>
                </View>
              </View>
            )}

            {generalSettings?.gstin_number && (
              <View style={styles.contactRowEnhanced}>
                <View style={[styles.iconCircle, { backgroundColor: '#f3e0e0' }]}>
                  <Icon name="document-outline" size={20} color="#b71c1c" />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>GSTIN</Text>
                  <Text style={styles.contactValue}>{generalSettings.gstin_number}</Text>
                </View>
              </View>
            )}

            <TouchableOpacity style={styles.contactRowEnhanced} onPress={() => Linking.openURL(`tel:${contactDetails.phone}`)}>
              <View style={[styles.iconCircle, { backgroundColor: '#e8f5e9' }]}>
                <Icon name="call-outline" size={20} color="#1b5e20" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={[styles.contactValue, { color: '#2e7d32' }]}>{contactDetails.phone}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactRowEnhanced} onPress={() => Linking.openURL(`mailto:${contactDetails.email}`)}>
              <View style={[styles.iconCircle, { backgroundColor: '#e3f2fd' }]}>
                <Icon name="mail-outline" size={20} color="#0d47a1" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={[styles.contactValue, { color: '#1565c0' }]}>{contactDetails.email}</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.contactRowEnhanced}>
              <View style={[styles.iconCircle, { backgroundColor: '#fff3e0' }]}>
                <Icon name="location-outline" size={20} color="#ef6c00" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Address</Text>
                <Text style={styles.contactValue}>{contactDetails.address}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Social Media */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Follow Us</Text>
          <View style={styles.socialContainer}>
            {socialMedia.map((item) => (
              <TouchableOpacity
                key={item.name}
                style={styles.socialIcon}
                onPress={() => Linking.openURL(item.url)}
              >
                <Icon name={item.name} size={30} color="#000" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More Information</Text>
          <TouchableOpacity
            style={styles.link}
            onPress={() => navigation.navigate('Terms')}
          >
            <Text style={styles.linkText}>Terms and Conditions</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.link}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          >
            <Text style={styles.linkText}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.link}
            onPress={() => navigation.navigate('AboutScreen')}
          >
            <Text style={styles.linkText}>About</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.link}
            onPress={() => navigation.navigate('RefundPolicy')}
          >
            <Text style={styles.linkText}>Refund Policy</Text>
          </TouchableOpacity>
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: { padding: 0, backgroundColor: '#f9f9f9' },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    // fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  label: {
    marginBottom:5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#000000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#666',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  socialIcon: {
    padding: 10,
  },
  link: {
    paddingVertical: 10,
  },
  linkText: {
    fontSize: 16,
    color: '#eb1f2a',
    textDecorationLine: 'underline',
  },
contactCard: {
  backgroundColor: '#fdfdfd',
  borderRadius: 12,
  paddingVertical: 10,
  paddingHorizontal: 5,
},

contactRowEnhanced: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#fff',
  borderRadius: 10,
  marginBottom: 12,
  paddingVertical: 10,
  paddingHorizontal: 12,
  elevation: 1,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
},

iconCircle: {
  width: 36,
  height: 36,
  borderRadius: 18,
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 12,
},

contactInfo: {
  flex: 1,
},

contactLabel: {
  fontSize: 13,
  color: '#999',
  marginBottom: 2,
},

contactValue: {
  fontSize: 15,
  color: '#333',
  fontWeight: '500',
},
});