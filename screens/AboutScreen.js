import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { AppContext } from '../ContextAPI/ContextAPI';
import InnerHeader from '../components/InnerHeader';

const teamMembers = [
  {
    id: 1,
    name: 'John Doe',
    role: 'CEO',
    image: 'https://via.placeholder.com/150', // Replace with actual image URL
    description: 'Visionary leader with 10+ years in e-commerce and retail management.',
  },
  {
    id: 2,
    name: 'Jane Smith',
    role: 'Manager',
    image: 'https://via.placeholder.com/150', // Replace with actual image URL
    description: 'Operations expert focused on streamlining processes and customer satisfaction.',
  },
  {
    id: 3,
    name: 'Mike Johnson',
    role: 'Delivery Head',
    image: 'https://via.placeholder.com/150', // Replace with actual image URL
    description: 'Logistics specialist ensuring timely and efficient delivery services.',
  },
  {
    id: 4,
    name: 'Sarah Wilson',
    role: 'Support',
    image: 'https://via.placeholder.com/150', // Replace with actual image URL
    description: 'Customer service champion dedicated to resolving queries and building relationships.',
  },
];

export default function AboutScreen({ navigation }) {
  const { apiToken, accessTokens } = useContext(AppContext);
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPage = async (slug) => {
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/pages/slug/${slug}`, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'X-User-Token': `Bearer ${accessTokens}`,
        },
      });
      if (response.data.success) {
        setPageData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching page:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage('about-us');
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <InnerHeader showSearch={false} showBackButton={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#eb1f2a" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <InnerHeader showSearch={false} showBackButton={true} />
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
        <View style={styles.contentWrapper}>
          <Text style={styles.pageTitle}>{pageData?.title || 'About Us'}</Text>

          {/* Company Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Our Story</Text>
            <Text style={styles.description}>
              {pageData?.content || 'Welcome to BuyTown Mobile, your trusted partner for quality hardware and home improvement products. We are committed to providing exceptional service and innovative solutions for all your construction and renovation needs.'}
            </Text>
          </View>

          {/* Team Members */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meet Our Team</Text>
            {teamMembers.map((member) => (
              <View key={member.id} style={styles.teamMember}>
                <Image source={{ uri: member.image }} style={styles.memberImage} />
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberRole}>{member.role}</Text>
                  <Text style={styles.memberDescription}>{member.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Mission/Vision */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Our Mission</Text>
            <Text style={styles.description}>
              To empower homeowners, contractors, and businesses with high-quality products and expert guidance, making every project a success.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Our Vision</Text>
            <Text style={styles.description}>
              To be the leading provider of hardware solutions, recognized for our commitment to quality, innovation, and customer satisfaction.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 80, // Space for bottom navigation
  },
  contentWrapper: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#eb1f2a',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  teamMember: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  memberImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  memberRole: {
    fontSize: 14,
    color: '#eb1f2a',
    fontWeight: '600',
    marginBottom: 5,
  },
  memberDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
