import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import InnerHeader from '../components/InnerHeader';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CustomerSupportScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

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
    phone: '+1-123-456-7890',
    email: 'support@buytown.com',
    address: '123 Main St, City, State, ZIP',
  };

  const socialMedia = [
    { name: 'logo-facebook', url: 'https://facebook.com/buytown' },
    { name: 'logo-instagram', url: 'https://instagram.com/buytown' },
    { name: 'logo-twitter', url: 'https://twitter.com/buytown' },
  ];

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
          <Text style={styles.contactText}>Phone: {contactDetails.phone}</Text>
          <Text style={styles.contactText}>Email: {contactDetails.email}</Text>
          <Text style={styles.contactText}>Address: {contactDetails.address}</Text>
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
});
