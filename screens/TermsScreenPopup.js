import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useWindowDimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { WebView } from 'react-native-webview';
import RenderHtml from 'react-native-render-html';
import axios from 'axios';
import { AppContext } from '../ContextAPI/ContextAPI';

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
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Terms & Conditions</Text>
        </View>
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
          <ActivityIndicator size="large" color="#eb1f2a" />
        </View>

        {/* 📃 Terms Content */}
      {/* <WebView source={{ html: pageData?.content }} style={styles.webview} /> */}

      
      </View>
    );
  }

  const htmlContent = pageData?.content || '<p>No content available</p>';

  return (
    <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="black" />
      {/* 🔼 Topbar */}
      <View style={styles.header}>
        {/* <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#fff" />
        </TouchableOpacity> */}

        <Text style={styles.headerTitle}>{pageData?.title || 'Terms & Conditions'}</Text>
      </View>
      <ScrollView>
      <RenderHtml
        contentWidth={width}
        source={{ html: htmlContent }}
        baseStyle={{
          color: '#333',
          fontSize: 16,
          lineHeight: 25,
          padding:20,
          paddingBottom:0
        }}
      />
      </ScrollView>
      {/* 📃 Terms Content */}
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom:20,
  },
  header: {
    backgroundColor: '#eb1f2a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 15,
    marginBottom:20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    paddingLeft:5,
    
  },
  content: {
    padding: 20,
    paddingBottom:30
  },
  webview: {
    flex: 1,
  },
});
