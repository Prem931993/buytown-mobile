import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert, TextInput, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppContext } from './../ContextAPI/ContextAPI';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from "axios";
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InnerHeader from './../components/InnerHeader';

export default function CartScreen({ navigation }) {
  const { apiToken, accessTokens, cartRefresh, onRefereshCart, getTotal } = useContext(AppContext);
  const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/cart`;
  const API_URL_CART = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/cart/update`;

  const [cartData, setCartData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [clearCartModalVisible, setClearCartModalVisible] = useState(false);
  const [clearingCart, setClearingCart] = useState(false);


  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axios.get(API_URL, {
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'X-User-Token': `Bearer ${accessTokens}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.data.statusCode === 200) {
          setCartData(response.data.cart_items);
          setSummary(response.data.summary);
          getTotal(response.data.summary.total_amount);
          onRefereshCart(false);
        }
      } catch (error) {
        console.error(
          'Error fetching cart:',
          error.response?.data || error.message
        );
        if (error.response?.data == "Invalid or expired API token.") {
          await onRefereshCart(true);
          // Retry the API call after token regeneration
          await fetchCart();
        }
      }
    };

    fetchCart();
  }, [cartRefresh]);

  const handleQuantityChange = async(item, change) => {
    const newQuantity = item.quantity + change;
    if (newQuantity > 0) {
      const cartItem = {
        cart_item_id: item?.cart_item_id,
        quantity: newQuantity
      }
      try {
        const response = await axios.put(`${API_URL_CART}`, cartItem, {
          headers: {
            'Authorization': `Bearer ${apiToken}`, // API token
            'X-User-Token': `Bearer ${accessTokens}`, // User token
            'Content-Type': 'application/json'
          }
        })
        Toast.show({ type: 'success', text1: 'Quantity updated successfully!' });
        onRefereshCart(true);
      } catch (error) {
        console.error("Error fetching add to cart:", error.response?.data || error.message);
        if (error.response?.data == "Invalid or expired API token.") {
          await onRefereshCart(true);
          // Retry the API call after token regeneration
          await handleQuantityChange(item, change);
        }
      }
    } else {
      Alert.alert(
        "Remove Item",
        "Do you want to remove this item from cart?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Remove", onPress: () => removeFromCart(item.cart_item_id) }
        ]
      );
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const response = await axios.delete(`${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/cart/remove`, {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'X-User-Token': `Bearer ${accessTokens}`,
          'Content-Type': 'application/json'
        },
        data: {
          cart_item_id: cartItemId
        }
      });
      Toast.show({ type: 'success', text1: 'Item removed from cart!' });
      onRefereshCart(true);
      } catch (error) {
        console.error("Error removing from cart:", error.response?.data || error.message);
        if (error.response?.data == "Invalid or expired API token.") {
          await onRefereshCart(true);
          // Retry the API call after token regeneration
          await removeFromCart(cartItemId);
        }
      }
  };

  const applyCoupon = () => {
    setShowComingSoonModal(true);
  };

  const clearCart = () => {
    setClearCartModalVisible(true);
  };

  const confirmClearCart = async () => {
    setClearingCart(true);
    try {
      for (const item of cartData) {
        await axios.delete(`${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/cart/clear`, {
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'X-User-Token': `Bearer ${accessTokens}`,
            'Content-Type': 'application/json'
          },
          data: {
            cart_item_id: item.cart_item_id
          }
        });
      }
      Toast.show({ type: 'success', text1: 'Cart cleared successfully!' });
      onRefereshCart(true);
    } catch (error) {
      console.error("Error clearing cart:", error.response?.data || error.message);
      Toast.show({ type: 'error', text1: 'Failed to clear cart. Please try again.' });
      if (error.response?.data == "Invalid or expired API token.") {
        await onRefereshCart(true);
      }
    } finally {
      setClearingCart(false);
      setClearCartModalVisible(false);
    }
  };

  const renderCartItem = ({ item }) => (
    <TouchableOpacity style={styles.cartItem} onPress={() => navigation.navigate('ProductDetailsScreen', { product: { id: item.product_id } })}>
      <Image source={{ uri: item.images[0]?.path }} style={styles.productImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.productName} numberOfLines={2}>{item.product_name}</Text>
        <Text style={styles.productMeta}>{item.brand_name} • {item.category_name}</Text>
        <Text style={styles.productSku}>SKU: {item.sku_code}</Text>
        <Text style={styles.productPrice}>₹{item.price}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityBtn}
            onPress={() => handleQuantityChange(item, -1)}
          >
            <Icon name="remove" size={16} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityBtn}
            onPress={() => handleQuantityChange(item, 1)}
          >
            <Icon name="add" size={16} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity style={styles.removeBtn} onPress={() => Alert.alert(
        "Remove Item",
        "Do you want to remove this item from cart?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Remove", onPress: () => removeFromCart(item.cart_item_id) }
        ]
      )}>
        <Icon name="trash-outline" size={24} color="#f44336" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyCart}>
      <Icon name="cart-outline" size={80} color="#ccc" />
      <Text style={styles.emptyText}>Your cart is empty</Text>
      <TouchableOpacity
        style={styles.shopBtn}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.shopText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSummaryFooter = () => {
    if (!summary) return null;
    return (
      <View style={styles.summaryContainer}>
        {/* Delivery Info */}
        <View style={styles.deliveryInfo}>
          <View style={styles.deliveryRow}>
            <Icon name="time-outline" size={20} color="#f67179" />
            <Text style={styles.deliveryText}>Estimated Delivery: 2-3 business days</Text>
          </View>
          <View style={styles.deliveryRow}>
            <Icon name="location-outline" size={20} color="#f67179" />
            <Text style={styles.deliveryText}>Free delivery on orders above ₹500</Text>
          </View>
        </View>

        {/* Coupon Section */}
        <View style={styles.couponSection}>
          <Text style={styles.couponTitle}>Have a Coupon?</Text>
          <View style={styles.couponInputContainer}>
            <TextInput
              style={styles.couponInput}
              placeholder="Enter coupon code"
              value={couponCode}
              onChangeText={setCouponCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.applyBtn} onPress={applyCoupon}>
              <Text style={styles.applyText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.footer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items:</Text>
            <Text style={styles.summaryValue}>{summary.total_items}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Quantity:</Text>
            <Text style={styles.summaryValue}>{summary.total_quantity}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>₹{parseFloat(summary.subtotal).toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax:</Text>
            <Text style={styles.summaryValue}>₹{parseFloat(summary.tax_amount).toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalAmount}>₹{parseFloat(summary.total_amount).toFixed(2)}</Text>
          </View>

          <TouchableOpacity
            style={styles.checkoutBtn}
            onPress={() => navigation.navigate('CheckoutScreen')}
          >
            <Text style={styles.checkoutText}>Proceed to Checkout</Text>
          </TouchableOpacity>

          {/* Minimal footer with logo and terms */}
          <View style={styles.minimalFooter}>
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>By proceeding, you agree to </Text>
              <TouchableOpacity onPress={() => navigation.navigate('TermsScreen')}>
                <Text style={styles.termsLink}>Terms & Conditions</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <InnerHeader showSearch={false} />
      {cartData.length > 0 && (
        <View style={styles.cartHeader}>
          <Text style={styles.cartTitle}>Your Cart ({cartData.length})</Text>
          <TouchableOpacity style={styles.clearCartBtn} onPress={clearCart}>
            <Icon name="trash-outline" size={20} color="#f44336" />
            <Text style={styles.clearCartText}>Clear Cart</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={{ flex: 1 }}>
        <FlatList
          data={cartData}
          keyExtractor={(item) => item?.cart_item_id?.toString()}
          renderItem={renderCartItem}
          ListEmptyComponent={renderEmptyCart}
          ListFooterComponent={renderSummaryFooter}
          contentContainerStyle={styles.cartList}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Coming Soon Modal */}
      <Modal
        visible={showComingSoonModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowComingSoonModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Icon name="time-outline" size={60} color="#4CAF50" />
            <Text style={styles.modalTitle}>Coming Soon!</Text>
            <Text style={styles.modalMessage}>Coupon feature is coming soon!</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowComingSoonModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Clear Cart Confirmation Modal */}
      <Modal
        visible={clearCartModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setClearCartModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Icon name="trash-outline" size={60} color="#f44336" />
            <Text style={styles.modalTitle}>Clear Cart</Text>
            <Text style={styles.modalMessage}>Are you sure you want to clear all items from your cart?</Text>
            {clearingCart ? (
              <Text style={{ marginVertical: 20, fontSize: 16, color: '#666' }}>Clearing cart...</Text>
            ) : (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                <TouchableOpacity
                  style={[styles.cancelModalButton, { flex: 1, marginRight: 10 }]}
                  onPress={() => setClearCartModalVisible(false)}
                  disabled={clearingCart}
                >
                  <Text style={styles.cancelModalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.clearModalButton, { flex: 1, marginLeft: 10 }]}
                  onPress={confirmClearCart}
                  disabled={clearingCart}
                >
                  <Text style={styles.clearModalButtonText}>Clear All</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  shopBtn: {
    backgroundColor: '#f67179',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    elevation: 3,
  },
  shopText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cartList: { 
    paddingHorizontal: 15, 
    marginTop:15,
    paddingBottom: 0,
    flexGrow: 1,
    backgroundColor: "#ffffff",
  },
  summaryContainer: {
    paddingHorizontal: 10,
    paddingBottom: 0,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  productImage: { width: 80, height: 80, resizeMode: 'contain', marginRight: 15, borderRadius: 8 },
  itemDetails: { flex: 1 },
  productName: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 5 },
  productMeta: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  productSku: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  productPrice: { fontSize: 18, fontWeight: 'bold', color: '#f67179', marginBottom: 10 },
  quantityContainer: { flexDirection: 'row', alignItems: 'center' },
  quantityBtn: {
    backgroundColor: '#ffffff',
    width: 35,
    height: 35,
    borderRadius: 17.5,
    borderWidth:1,
    borderColor:"#cccccc",
    justifyContent: 'center',
    alignItems: 'center',
    // elevation: 2,
  },
  quantity: { marginHorizontal: 20, fontSize: 18, fontWeight: 'bold', color: '#333' },
  removeBtn: { padding: 8 },
  footer: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12,
    marginTop: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: { fontSize: 16, color: '#666' },
  summaryValue: { fontSize: 16, fontWeight: '600', color: '#333' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  totalAmount: { fontSize: 20, fontWeight: 'bold', color: '#f67179' },
  checkoutBtn: {
    backgroundColor: '#000000',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
  },
  checkoutText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  deliveryInfo: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deliveryText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  couponSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginTop: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  couponTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  couponInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginRight: 10,
  },
  applyBtn: {
    backgroundColor: '#000000',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 2,
  },
  applyText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  minimalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingBottom: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 5,
    marginBottom: 50,
  },
  termsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginLeft: 0,
  },
  termsText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginRight: 2,
    flexWrap: 'wrap',
  },
  termsLink: {
    fontSize: 10,
    color: '#f67179',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
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
  modalButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  clearCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  clearCartText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f44336',
    marginLeft: 5,
  },
  cancelModalButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelModalButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  clearModalButton: {
    backgroundColor: '#f44336',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
