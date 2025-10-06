import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { AppContext } from './../ContextAPI/ContextAPI';
import InnerHeader from './../components/InnerHeader';

export default function MyWishlistScreen({ navigation }) {
  const { apiToken, accessTokens, onRefereshCart } = useContext(AppContext);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [moveToCartModalVisible, setMoveToCartModalVisible] = useState(false);
  const [movingToCartId, setMovingToCartId] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const API_URL_GET_WISHLIST = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/wishlist`;
  const API_URL_REMOVE_WISHLIST = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/wishlist/remove`;
  const API_URL_MOVE_TO_CART = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/wishlist/move-to-cart`;

  useEffect(() => {
    fetchWishlist(1, true);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchWishlist(1, true);
    });

    return unsubscribe;
  }, [navigation]);

  const fetchWishlist = async (page = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (page > 1) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await axios.get(`${API_URL_GET_WISHLIST}?page=${page}&limit=20`, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'X-User-Token': `Bearer ${accessTokens}`,
        },
      });
      if (response.data.statusCode === 200) {
        const newItems = response.data.data || [];
        if (isRefresh || page === 1) {
          setWishlistItems(newItems);
        } else {
          setWishlistItems(prev => [...prev, ...newItems]);
        }
        setPagination(response.data.pagination);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      Alert.alert('Error', 'Failed to load wishlist');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = () => {
    fetchWishlist(1, true);
  };

  const loadMore = () => {
    if (pagination?.has_next_page && !loadingMore) {
      fetchWishlist(currentPage + 1);
    }
  };

  const showDeleteConfirmation = (wishlistItemId) => {
    setItemToDelete(wishlistItemId);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      const response = await axios.delete(API_URL_REMOVE_WISHLIST, {
        data: {
          wishlist_item_id: itemToDelete,
        },
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'X-User-Token': `Bearer ${accessTokens}`,
        },
      });
      if (response.data.statusCode === 200) {
        setWishlistItems(prev => prev.filter(item => item.wishlist_item_id !== itemToDelete));
        Alert.alert('Success', 'Item removed from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to remove item');
    } finally {
      setDeleteModalVisible(false);
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setItemToDelete(null);
  };

  const moveToCart = async (wishlistItemId) => {
    try {
      setMovingToCartId(wishlistItemId);
      const response = await axios.post(API_URL_MOVE_TO_CART, {
        wishlist_item_id: wishlistItemId,
      }, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'X-User-Token': `Bearer ${accessTokens}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.data.statusCode === 200) {
        setMoveToCartModalVisible(true);
      }
    } catch (error) {
      console.error('Error moving to cart:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to move item to cart');
    } finally {
      setMovingToCartId(null);
    }
  };

  const onMoveToCartModalOk = () => {
    setMoveToCartModalVisible(false);
    fetchWishlist();
    onRefereshCart(true);
  };

  const renderWishlistItem = ({ item }) => (
    <View style={styles.wishlistItem}>
      <TouchableOpacity
        style={styles.productInfo}
        onPress={() => navigation.navigate('ProductDetailsScreen', { product: { id: item.product_id } })}
      >
        <Image source={{ uri: item.images?.[0]?.path }} style={styles.productImage} />
        <View style={styles.productDetails}>
          <Text style={styles.productName} numberOfLines={2}>{item.product_name}</Text>
          <Text style={styles.productPrice}>
            <Text style={styles.strikeOut}>₹{item.price}</Text> - ₹{item.selling_price}
          </Text>
        </View>
      </TouchableOpacity>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => moveToCart(item.wishlist_item_id)}
          disabled={movingToCartId === item.wishlist_item_id}
        >
          {movingToCartId === item.wishlist_item_id ? (
            <ActivityIndicator size="small" color="#F44336" />
          ) : (
            <>
              <Icon name="bag-add" size={20} color="#F44336" />
              <Text style={styles.actionText}>Move to Cart</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => showDeleteConfirmation(item.wishlist_item_id)}
        >
          <Icon name="trash" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Icon name="heart-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
      <Text style={styles.emptySubtitle}>Add items you love to your wishlist</Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
      >
        <Text style={styles.shopButtonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <InnerHeader showSearch={false} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F44336" />
          <Text style={styles.loadingText}>Loading wishlist...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <InnerHeader showSearch={false} />
      <View style={styles.content}>
        <Text style={styles.title}>My Wishlist</Text>
        <FlatList
          data={wishlistItems}
          keyExtractor={(item) => item.wishlist_item_id.toString()}
          renderItem={renderWishlistItem}
          ListEmptyComponent={renderEmptyComponent}
          ListFooterComponent={() => loadingMore ? <ActivityIndicator size="small" color="#F44336" style={{ marginVertical: 20 }} /> : null}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </View>
      {moveToCartModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Icon name="checkmark-circle" size={60} color="#4CAF50" />
            <Text style={styles.modalTitle}>Item Moved to Cart!</Text>
            <Text style={styles.modalMessage}>The item has been successfully moved to your cart.</Text>
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={styles.modalSecondaryButton}
                onPress={onMoveToCartModalOk}
              >
                <Text style={styles.modalSecondaryButtonText}>Continue</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalPrimaryButton}
                onPress={() => {
                  onMoveToCartModalOk();
                  navigation.navigate('MainTabs', { screen: 'Cart' });
                }}
              >
                <Text style={styles.modalPrimaryButtonText}>Go to Cart</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      {deleteModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Icon name="trash" size={60} color="#F44336" />
            <Text style={styles.modalTitle}>Remove Item</Text>
            <Text style={styles.modalMessage}>Are you sure you want to remove this item from your wishlist?</Text>
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={styles.modalSecondaryButton}
                onPress={cancelDelete}
              >
                <Text style={styles.modalSecondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalPrimaryButton}
                onPress={confirmDelete}
              >
                <Text style={styles.modalPrimaryButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  wishlistItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  productDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F44336',
  },
  strikeOut: {
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
    color: '#999',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#F44336',
    marginLeft: 4,
    fontWeight: '500',
  },
  removeButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  shopButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    maxWidth: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  modalSecondaryButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalSecondaryButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  modalPrimaryButton: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalPrimaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
