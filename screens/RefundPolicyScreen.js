import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import { AppContext } from '../ContextAPI/ContextAPI';

export default function RefundPolicyScreen({ navigation }) {
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
    fetchPage('refund-policy');
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Refund Policy</Text>
        </View>
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
          <ActivityIndicator size="large" color="#eb1f2a" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 🔼 Topbar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{pageData?.title || 'Refund Policy'}</Text>

      </View>

      {/* 📃 Terms Content */}
      <WebView source={{ html: pageData?.content }} style={styles.webview} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom:50,
  },
  header: {
    backgroundColor: '#eb1f2a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    paddingLeft:5
  },
  content: {
    padding: 20,
    paddingBottom:30
  },
  webview: {
    flex: 1,
  },
});
