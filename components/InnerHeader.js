import React, { useState, useContext, useEffect, memo, useCallback } from 'react';
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
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { AppContext } from './../ContextAPI/ContextAPI';

const NotificationItem = memo(({ item, onMarkAsRead, onDelete }) => {
  return (
    <View style={styles.notificationItem}>
      <TouchableOpacity style={styles.notificationContent} onPress={() => onMarkAsRead(item.id)}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>V.</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationDate}>{item.date}</Text>
          </View>
          <Text style={styles.notificationDescription}>{item.description}</Text>
        </View>
        {!item.read && <View style={styles.dot} />}
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteIcon} onPress={() => Alert.alert(
        "Delete Notification",
        "Are you sure you want to delete this notification?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "OK", onPress: () => onDelete(item.id) },
        ]
      )}>
        <Icon name="trash-outline" size={20} color="#eb1f2a" />
      </TouchableOpacity>
    </View>
  );
});

export default function InnerHeader({ showSearch = true, showBackButton = true }) {
  const navigation = useNavigation();
  const { apiToken, accessTokens } = useContext(AppContext);

  const [searchText, setSearchText] = useState('');
  const [searchResultsProducts, setSearchResultsProducts] = useState([]);
  const [searchResultsCategories, setSearchResultsCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationPage, setNotificationPage] = useState(1);
  const [loadingMoreNotifications, setLoadingMoreNotifications] = useState(false);
  const [hasMoreNotifications, setHasMoreNotifications] = useState(false);
  const [categories, setCategories] = useState([]);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    if (searchText.length > 2) {
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => {
        searchAPI(abortController);
      }, 500);
      return () => {
        clearTimeout(timeoutId);
        abortController.abort();
      };
    } else {
      setSearchResultsProducts([]);
      setSearchResultsCategories([]);
      setShowResults(false);
    }
  }, [searchText]);

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  useEffect(() => {
    if (modalVisible) {
      setNotificationPage(1);
      fetchNotifications(1, true);
    }
  }, [modalVisible]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      const interval = setInterval(() => {
        setPlaceholderIndex((prevIndex) => (prevIndex + 1) % categories.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [categories]);

  const searchAPI = async (abortController) => {
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
          signal: abortController.signal,
        }
      );
      if (response.data.statusCode === 200) {
        setSearchResultsProducts(response.data.products || []);
        setSearchResultsCategories(response.data.categories || []);
        setShowResults(true);
      }
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error('Search error:', error);
      }
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

  const fetchNotifications = async (page = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setLoadingNotifications(true);
      } else if (page > 1) {
        setLoadingMoreNotifications(true);
      } else {
        setLoadingNotifications(true);
      }

      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/notifications?page=${page}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'X-User-Token': `Bearer ${accessTokens}`,
          },
        }
      );
      if (response.data.success) {
        // Map API response to component state format
        const notificationsData = response.data.data?.notifications || response.data.notifications || [];
        const mappedNotifications = notificationsData.map((notif) => ({
          id: notif.id,
          title: notif.title,
          description: notif.message,
          date: new Date(notif.created_at).toLocaleString(),
          read: notif.is_read,
        }));

        if (isRefresh || page === 1) {
          setNotifications(mappedNotifications);
        } else {
          setNotifications(prev => [...prev, ...mappedNotifications]);
        }

        setNotificationPage(page);
        setHasMoreNotifications(response.data.data?.pagination?.has_next_page || false);
      }
    } catch (error) {
      console.error('Fetch notifications error:', error);
    } finally {
      setLoadingNotifications(false);
      setLoadingMoreNotifications(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/notifications/unread-count`,
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'X-User-Token': `Bearer ${accessTokens}`,
          },
        }
      );
      if (response.data.success) {
        const unreadCount = response.data.data?.unreadCount || response.data.unreadCount || 0;
        setUnreadCount(unreadCount);
      }
    } catch (error) {
      console.error('Fetch unread count error:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/categories`,
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'X-User-Token': `Bearer ${accessTokens}`,
          },
        }
      );
      if (response.data.statusCode === 200) {
        setCategories(response.data.categories || []);
      }
    } catch (error) {
      console.error('Fetch categories error:', error);
    }
  };

  const markNotificationAsRead = useCallback(async (notificationId) => {
    try {
      await axios.put(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'X-User-Token': `Bearer ${accessTokens}`,
          },
        }
      );
      // Update local state to mark notification as read
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      // Update unread count
      setUnreadCount((prevCount) => (prevCount > 0 ? prevCount - 1 : 0));
    } catch (error) {
      console.error('Mark notification as read error:', error);
    }
  }, [apiToken, accessTokens]);

  const markAllAsRead = useCallback(async () => {
    try {
      await axios.put(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/notifications/mark-all-read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'X-User-Token': `Bearer ${accessTokens}`,
          },
        }
      );
      // Update local state to mark all as read
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) => ({ ...notif, read: true }))
      );
      // Reset unread count
      setUnreadCount(0);
    } catch (error) {
      console.error('Mark all as read error:', error);
    }
  }, [apiToken, accessTokens]);

  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await axios.delete(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/notifications/${notificationId}`,
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'X-User-Token': `Bearer ${accessTokens}`,
          },
        }
      );
      // Update local state to remove the notification
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notif) => notif.id !== notificationId)
      );
      // Update unread count if it was unread
      const deletedNotif = notifications.find((n) => n.id === notificationId);
      if (deletedNotif && !deletedNotif.read) {
        setUnreadCount((prevCount) => (prevCount > 0 ? prevCount - 1 : 0));
      }
    } catch (error) {
      console.error('Delete notification error:', error);
    }
  }, [apiToken, accessTokens, notifications]);

  const [onEndReachedCalledDuringMomentum, setOnEndReachedCalledDuringMomentum] = React.useState(false);

  const loadMoreNotifications = () => {
    if (hasMoreNotifications && !loadingMoreNotifications) {
      fetchNotifications(notificationPage + 1, false);
    }
  };

  const renderFooter = () => {
    if (!loadingMoreNotifications) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#eb1f2a" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {showBackButton && (
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back-outline" size={24} color="#000" />
          </TouchableOpacity>
        )}
        <View style={styles.logoContainer}>
          <Image source={require('./../assets/logo-brand.png')} style={styles.logo} />
        </View>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.notificationIconContainer}>
          <Icon name="notifications-outline" size={24} color="#000000" />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      {showSearch && (
        <>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder={`Search '${categories[placeholderIndex]?.name?.toLowerCase()}'`}
              placeholderTextColor="#999"
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
                        <Icon name="cube-outline" size={20} color="#eb1f2a" style={styles.itemIcon} />
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
                        <Icon name="folder-outline" size={20} color="#eb1f2a" style={styles.itemIcon} />
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

     {/* Notification Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <View style={styles.modalHeaderRight}>
                <TouchableOpacity onPress={() => Alert.alert(
                  "Mark All as Read",
                  "Are you sure you want to mark all notifications as read?",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "OK", onPress: markAllAsRead },
                  ]
                )} style={styles.markAllButton}>
                  <Text style={styles.markAllText}>Mark All Read</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Icon name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>
            </View>
            {loadingNotifications ? (
              <ActivityIndicator size="large" color="#eb1f2a" style={{ marginTop: 20 }} />
            ) : (
              <View style={{ flex: 1 }}>
            <FlatList
              data={notifications}
              renderItem={({ item }) => <NotificationItem item={item} onMarkAsRead={markNotificationAsRead} onDelete={deleteNotification} />}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ paddingBottom: 10 }}
              onEndReachedThreshold={0.5}
              ListFooterComponent={renderFooter}
              scrollEventThrottle={400}
              onMomentumScrollBegin={() => {
                // Reset onEndReached flag to allow multiple calls
                setOnEndReachedCalledDuringMomentum(false);
              }}
              onEndReached={() => {
                if (!onEndReachedCalledDuringMomentum) {
                  loadMoreNotifications();
                  setOnEndReachedCalledDuringMomentum(true);
                }
              }}
            />
              </View>
            )}
          </View>
        </View>
      </Modal>
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
    paddingBottom: 10,
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
    borderRadius: 12,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    maxHeight: 300,
    zIndex: 20,
  },
  resultsContent: {
    paddingHorizontal: 10,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#f8f9fa',
    color: '#495057',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  itemIcon: {
    marginRight: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 19,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: '#00000055',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markAllButton: {
    marginRight: 10,
  },
  markAllText: {
    fontSize: 14,
    color: '#eb1f2a',
    fontWeight: '500',
  },
  notificationContent: {
    flex: 1,
    flexDirection: 'row',
  },
  deleteIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 10,
  },
  notificationItem: {
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: 10,
  },
  avatar: {
    backgroundColor: '#F9CEDF',
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#000',
    fontWeight: 'bold',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  notificationTitle: {
    fontWeight: '600',
    flex: 1,
  },
  notificationDate: {
    fontSize: 12,
    color: '#999',
    marginLeft: 10,
  },
  notificationDescription: {
    fontSize: 13,
    color: '#333',
    marginTop: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00AEEF',
    alignSelf: 'center',
    marginLeft: 5,
  },
  notificationIconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#eb1f2a',
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  footerText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  loadMoreButton: {
    backgroundColor: '#eb1f2a',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 10,
    alignSelf: 'center',
  },
  loadMoreText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
