import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RenderHtml from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';
import axios from 'axios';
import { AppContext } from '../ContextAPI/ContextAPI';
import InnerHeader from '../components/InnerHeader';
export default function TermsAndConditionsScreen({ navigation }) {
  const { width } = useWindowDimensions();
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
    fetchPage('terms-conditions');
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

  const htmlContent = pageData?.content || '<p>No content available</p>';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <InnerHeader showSearch={false} showBackButton={true} />
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
        <View style={styles.contentWrapper}>
          <RenderHtml
            contentWidth={width - 40}
            source={{ html: htmlContent }}
            baseStyle={styles.htmlContent}
            tagsStyles={{
              p: { marginBottom: 10, lineHeight: 24 },
              h1: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, color: '#333' },
              h2: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: '#333' },
              h3: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
              ul: { marginBottom: 15 },
              li: { marginBottom: 5, lineHeight: 22 },
              strong: { fontWeight: 'bold', color: '#eb1f2a' },
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 50,
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
    paddingBottom: 30,
  },
  contentWrapper: {
    padding: 20,
  },
  htmlContent: {
    color: '#333',
    fontSize: 16,
    lineHeight: 24,
  },
});
