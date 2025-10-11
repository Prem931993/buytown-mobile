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
  const [selectedFilter, setSelectedFilter] = useState('all');

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/checkout/orders?page=1&limit=10`, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'X-User-Token': `Bearer ${accessTokens}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.data.statusCode === 200) {
        console.log("response.data", response.data)
        setOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error('Orders fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (apiToken && accessTokens) fetchOrders();
    else setLoading(false);
  }, [apiToken, accessTokens]);

  const filteredOrders = orders.filter(order => {
    if (selectedFilter === 'all') return true;
    return order.status?.toLowerCase() === selectedFilter;
  });

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderDetailScreen', { order: item })}
      activeOpacity={0.8}
    >
      <View style={styles.orderTopRow}>
        <Text style={styles.orderId}>#{item.order_number}</Text>
        <Text style={[styles.statusText, getStatusColor(item.status)]}>
          {item.status?.replace('_', ' ').toUpperCase()}
        </Text>
      </View>

      <View style={styles.routeRow}>
        <Text style={styles.cityText}>{item.source_city || 'RS Puram'}</Text>
        <View style={styles.dotLine} />
        <Text style={styles.cityText}>{item.destination_city || 'Gandhipuram'}</Text>
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.footerLabel}>
          {item.status === 'delivered' ? 'Delivered:' : 'Created:'}
        </Text>
        <Text style={styles.footerDate}>
          {new Date(item.order_date).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return { color: '#f39c12' };
      case 'completed':
        return { color: '#27ae60' };
      case 'cancelled':
        return { color: '#e74c3c' };
      default:
        return { color: '#2980b9' };
    }
  };

  const filters = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Delivered', value: 'completed' },
    { label: 'Canceled', value: 'cancelled' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <InnerHeader showSearch={false} />

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {filters.map(f => (
          <TouchableOpacity
            key={f.value}
            style={[
              styles.filterButton,
              selectedFilter === f.value && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter(f.value)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === f.value && styles.filterTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : filteredOrders.length > 0 ? (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOrderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="bag-handle-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No orders found</Text>
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
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginTop: 10,
    elevation: 2,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterButtonActive: {
    backgroundColor: '#000000',
  },
  filterText: {
    fontSize: 14,
    color: '#444',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  orderCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  orderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderId: {
    fontWeight: '600',
    fontSize: 15,
    color: '#2c3e50',
  },
  statusText: {
    fontWeight: '600',
    fontSize: 13,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  cityText: {
    fontSize: 14,
    color: '#333',
  },
  dotLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
    marginHorizontal: 8,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerLabel: {
    fontSize: 13,
    color: '#777',
  },
  footerDate: {
    fontSize: 13,
    color: '#555',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#555',
    marginTop: 12,
  },
});
