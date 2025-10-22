import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Linking,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import * as DocumentPicker from 'expo-document-picker';
import InnerHeader from '../components/InnerHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../ContextAPI/ContextAPI';

export default function CustomerSupportScreen({ navigation }) {
  const { apiToken, accessTokens } = useContext(AppContext);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [generalSettings, setGeneralSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

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

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true,
      });
      if (result.canceled) return;
      setAttachments(prev => [...prev, ...result.assets]);
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const showModal = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!name || !subject || !message) {
      showModal('Error', 'Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('subject', subject);
      formData.append('message', message);
      attachments.forEach((attachment, index) => {
        formData.append('attachments', {
          uri: attachment.uri,
          name: attachment.name,
          type: attachment.mimeType,
        });
      });

      const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/notifications/support-email`, formData, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'X-User-Token': `Bearer ${accessTokens}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        showModal('Success', 'Your enquiry has been submitted');
        setName('');
        setSubject('');
        setMessage('');
        setAttachments([]);
      } else {
        showModal('Error', 'Failed to submit enquiry');
      }
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      showModal('Error', 'Failed to submit enquiry');
    } finally {
      setSubmitting(false);
    }
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
            <Text style={styles.label}>Subject *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter subject"
              value={subject}
              onChangeText={setSubject}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Message *</Text>
            <TextInput
              style={[styles.input, styles.messageInput]}
              placeholder="Enter your message"
              value={message}
              onChangeText={setMessage}
              multiline
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Attachments</Text>
            <TouchableOpacity style={styles.attachButton} onPress={pickDocument}>
              <Icon name="attach-outline" size={20} color="#000" />
              <Text style={styles.attachText}>
                {attachments.length > 0 ? `${attachments.length} file(s) selected` : 'Select files'}
              </Text>
            </TouchableOpacity>
            {attachments.length > 0 && (
              <View style={styles.attachmentsList}>
                {attachments.map((file, index) => (
                  <View key={index} style={styles.attachmentContainer}>
                    <Text style={styles.attachmentItem}>
                      {file.name}
                    </Text>
                    <TouchableOpacity onPress={() => removeAttachment(index)} style={styles.removeButton}>
                      <Icon name="close-circle" size={20} color="#eb1f2a" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitText}>Submit Enquiry</Text>
            )}
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
            onPress={() => navigation.navigate('About')}
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
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
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  attachText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  attachmentsList: {
    marginTop: 10,
  },
  attachmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  attachmentItem: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  removeButton: {
    padding: 5,
  },
  submitButton: {
    backgroundColor: '#000000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  modalButton: {
    backgroundColor: '#eb1f2a',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 5,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});