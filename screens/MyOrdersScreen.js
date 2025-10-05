import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { AppContext } from './../ContextAPI/ContextAPI';
import InnerHeader from './../components/InnerHeader';

export default function MyOrdersScreen({ navigation }) {
  const { apiToken, accessTokens } = useContext(AppContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchOrders = async (pageNum = 1, append = false) => {
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/checkout/orders?page=${pageNum}&limit=10`, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'X-User-Token': `Bearer ${accessTokens}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.data.statusCode === 200) {
        const newOrders = response.data.orders || [];
        const pagination = response.data.pagination || {};
        if (append) {
          setOrders(prev => [...prev, ...newOrders]);
        } else {
          setOrders(newOrders);
        }
        setHasMore(pageNum < pagination.totalPages);
      }
    } catch (error) {
      console.error('Orders fetch error:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (apiToken && accessTokens) {
      fetchOrders(1, false);
    } else {
      setLoading(false);
    }
  }, [apiToken, accessTokens]);

  const loadMoreOrders = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);
      fetchOrders(nextPage, true);
    }
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderItem}
      onPress={() => navigation.navigate('OrderDetailScreen', { order: item })}
      activeOpacity={0.7}
    >
      <View style={styles.orderContent}>
        <View style={styles.orderInfo}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderNumber}>Order #{item.order_number}</Text>
            <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
              <Text style={styles.statusText}>
                {item.status.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.orderDate}>
            {new Date(item.order_date).toLocaleDateString()}
          </Text>
          <Text style={styles.orderTotal}>₹{parseFloat(item.total_amount).toFixed(2)}</Text>
        </View>
        <Icon name="chevron-forward-outline" size={20} color="#ccc" style={styles.arrowIcon} />
      </View>
    </TouchableOpacity>
  );

  const getStatusStyle = (status) => {
    const baseStyle = styles.statusBadge;
    switch (status) {
      case 'awaiting_confirmation':
      case 'pending':
        return [baseStyle, styles.statusPending];
      case 'confirmed':
        return [baseStyle, styles.statusConfirmed];
      case 'shipped':
        return [baseStyle, styles.statusShipped];
      case 'delivered':
        return [baseStyle, styles.statusDelivered];
      case 'cancelled':
        return [baseStyle, styles.statusCancelled];
      default:
        return [baseStyle, styles.statusDefault];
    }
  };



  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <InnerHeader showSearch={false} />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F44336" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      ) : orders.length > 0 ? (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOrderItem}
          onEndReached={loadMoreOrders}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color="#F44336" />
              <Text style={styles.footerText}>Loading more orders...</Text>
            </View>
          ) : null}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="bag-handle-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No orders found</Text>
          <Text style={styles.emptySubtext}>Your order history will appear here</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 16,
  },
  orderItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  orderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  orderInfo: {
    flex: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'solid',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusPending: {
    backgroundColor: '#fff3cd',
    color: '#856404',
    borderColor: '#ffeaa7',
  },
  statusConfirmed: {
    backgroundColor: '#d1ecf1',
    color: '#0c5460',
    borderColor: '#bee5eb',
  },
  statusShipped: {
    backgroundColor: '#d4edda',
    color: '#155724',
    borderColor: '#c3e6cb',
  },
  statusDelivered: {
    backgroundColor: '#d4edda',
    color: '#155724',
    borderColor: '#c3e6cb',
  },
  statusCancelled: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderColor: '#f5c6cb',
  },
  statusDefault: {
    backgroundColor: '#e9ecef',
    color: '#495057',
    borderColor: '#dee2e6',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginTop: 4,
  },
  arrowIcon: {
    marginLeft: 12,
    color: '#bdc3c7',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
