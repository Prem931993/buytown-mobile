import React, { useState } from 'react';
import {
  View,
  TextInput,
  Image,
  StyleSheet,
  Text,
  StatusBar,
  Modal,
  TouchableOpacity,
  FlatList
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const notifications = [
  {
    id: '1',
    title: '🆕 New Arrivals Alert!',
    date: 'Aug 7, 2025',
    description: 'Discover the latest in premium handles, kitchen cutlery, and more. Stock up today!',
  },
  {
    id: '2',
    title: '🛒 Your Order Is Still Pending',
    date: 'Aug 6, 2025',
    description: 'Finalize your purchase to avoid delays. Your perfect interiors are just a click away!',
  },
  {
    id: '3',
    title: '🔧 Complete Your Orders',
    date: 'Aug 5, 2025',
    description: 'You still have items waiting to be processed. Let’s get your workspace moving!',
  },
  {
    id: '4',
    title: '📦 Back in Stock!',
    date: 'Aug 4, 2025',
    description: 'Popular plywood and accessories are back—grab them before they’re gone again!',
  },
  {
    id: '5',
    title: '🧰 Need Screws or Hinges?',
    date: 'Aug 3, 2025',
    description: 'New functional designs just landed in our hardware section. Upgrade today!',
  },
  {
    id: '6',
    title: '💡 Stylish Add-ons Available',
    date: 'Aug 2, 2025',
    description: 'Elegant kitchen cutlery and cabinet handles now in stock. Add the finishing touch.',
  },
  {
    id: '7',
    title: '⏳ Don’t Miss Out!',
    date: 'Aug 1, 2025',
    description: 'Items in your cart may run out soon. Complete your order to secure your picks.',
  },
  {
    id: '8',
    title: '✅ Order Completed!',
    date: 'Jul 31, 2025',
    description: 'Your kitchen hardware order has been successfully delivered. Thank you for shopping with us!',
  },
  {
    id: '9',
    title: '🎉 All Done!',
    date: 'Jul 30, 2025',
    description: 'Your recent plywood and accessories order is complete. We hope you loved it!',
  },
  {
    id: '10',
    title: '❌ Order Canceled',
    date: 'Jul 29, 2025',
    description: 'Your recent order was canceled. Need help reordering? We’re here to assist.',
  },
  {
    id: '11',
    title: '⚠️ Canceled Due to Payment Issue',
    date: 'Jul 28, 2025',
    description: 'Your order couldn’t be processed. Please check your payment method and try again.',
  },
];


export default function HeaderBar() {
  const [modalVisible, setModalVisible] = useState(false);

  const renderNotification = ({ item }) => (
    <View style={styles.notificationItem}>
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
      <View style={styles.dot} />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* <StatusBar barStyle="white-content" backgroundColor="black" /> */}
      
      {/* Top Row */}
      <View style={styles.topRow}>
        <Image
          source={require('./../assets/logo-brand.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Icon name="notifications-outline" size={24} color="#000000" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search-outline" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products"
          placeholderTextColor="#999"
        />
      </View>

      {/* Location Row */}
      <View style={styles.locationRow}>
        <Icon name="location-outline" size={18} color="#000000" style={{ marginRight: 5 }} />
        <Text style={styles.locationText}>Coimbatore, Tamil Nadu</Text>
      </View>

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
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={notifications}
              renderItem={renderNotification}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 10 }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    // paddingTop: 50,
    paddingBottom: 50,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  logo: {
    width: 120,
    height: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 45,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  locationText: {
    color: '#000000',
    fontSize: 14,
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
    maxHeight: '80%',
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
});
