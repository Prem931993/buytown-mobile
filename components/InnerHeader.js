import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { AppContext } from './../ContextAPI/ContextAPI';

export default function InnerHeader({ showSearch = true }) {
  const navigation = useNavigation();
  const { apiToken, accessTokens } = useContext(AppContext);

  const [searchText, setSearchText] = useState('');
  const [searchResultsProducts, setSearchResultsProducts] = useState([]);
  const [searchResultsCategories, setSearchResultsCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (searchText.length > 2) {
      const timeoutId = setTimeout(() => {
        searchAPI();
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResultsProducts([]);
      setSearchResultsCategories([]);
      setShowResults(false);
    }
  }, [searchText]);

  const searchAPI = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/products/global-search`,
        { search: searchText, limit: 10 },
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'X-User-Token': `Bearer ${accessTokens}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.data.statusCode === 200) {
        setSearchResultsProducts(response.data.products || []);
        setSearchResultsCategories(response.data.categories || []);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductPress = (product) => {
    setSearchText('');
    setShowResults(false);
    navigation.navigate('ProductDetailsScreen', { product });
  };

  const handleCategoryPress = (category) => {
    setSearchText('');
    setShowResults(false);
    navigation.navigate('ProductListScreen', { category_id: category.id, name: category.name });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back-outline" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Image source={require('./../assets/logo-brand.png')} style={styles.logo} />
        </View>
        <TouchableOpacity style={styles.notificationBtn}>
          <Icon name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      {showSearch && (
        <>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              value={searchText}
              onChangeText={setSearchText}
              onFocus={() => setShowResults(searchResultsProducts.length > 0 || searchResultsCategories.length > 0)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
              editable={true}
            />
            {loading && <ActivityIndicator size="small" color="#F44336" style={styles.loader} />}
          </View>
          {showResults && (
            <>
              <TouchableWithoutFeedback onPress={() => setShowResults(false)}>
                <View style={styles.overlay} />
              </TouchableWithoutFeedback>
              <ScrollView
                style={styles.resultsContainer}
                contentContainerStyle={styles.resultsContent}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
              >
                {searchResultsProducts.length > 0 && (
                  <>
                    <Text style={styles.sectionHeader}>Products</Text>
                    {searchResultsProducts.map((item) => (
                      <TouchableOpacity
                        key={`product-${item.id}`}
                        style={styles.categoryItem}
                        onPress={() => handleProductPress(item)}
                        onStartShouldSetResponder={() => true}
                      >
                        <Text style={styles.categoryName}>{item.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
                {searchResultsCategories.length > 0 && (
                  <>
                    <Text style={styles.sectionHeader}>Categories</Text>
                    {searchResultsCategories.map((item) => (
                      <TouchableOpacity
                        key={`category-${item.id}`}
                        style={styles.categoryItem}
                        onPress={() => handleCategoryPress(item)}
                        onStartShouldSetResponder={() => true}
                      >
                        <Text style={styles.categoryName}>{item.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
              </ScrollView>
            </>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 10,
    position: 'relative',
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 0,
    paddingBottom: 20,
    paddingHorizontal:15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    paddingVertical: 13,
    paddingHorizontal: 5,
    alignItems: 'center',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  logo: {
    width: 120,
    height: 50,
    resizeMode: 'contain',
  },
  searchContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    color: '#000',
  },
  loader: {
    marginLeft: 10,
  },
  resultsContainer: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 5,
    maxHeight: 300,
    zIndex: 20,
  },
  resultsContent: {
    paddingHorizontal: 10,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingVertical: 5,
    backgroundColor: '#f0f0f0',
    color: '#333',
  },
  categoryItem: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 19,
  },
  notificationBtn: {
    paddingVertical: 13,
    paddingHorizontal: 5,
    alignItems: 'center',
  },
});
