import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppContext } from './../ContextAPI/ContextAPI';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from "axios";
import Toast from 'react-native-toast-message';

export default function CartScreen({ navigation }) {
  const { apiToken, accessTokens, cartRefresh, onRefereshCart, getTotal } = useContext(AppContext);
  const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/cart`;
  const API_URL_CART = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/cart/update`;

  const [cartData, setCartData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [couponCode, setCouponCode] = useState('');


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
        if (error.response?.status === 401) {
        
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
    }
  };

  const applyCoupon = () => {
    Alert.alert('Coming Soon', 'Coupon feature is coming soon!');
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
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
            <Icon name="remove" size={16} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityBtn}
            onPress={() => handleQuantityChange(item, 1)}
          >
            <Icon name="add" size={16} color="#fff" />
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
    </View>
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
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Image source={require('../assets/icon.png')} style={styles.headerLogo} />
          <Text style={styles.headerTitle}>My Cart</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity>
            <Icon name="cart-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
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
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingBottom: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 5,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  headerLogo: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    padding: 5,
  },
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
    backgroundColor: '#f67179',
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
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
    backgroundColor: '#f67179',
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
    backgroundColor: '#f67179',
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
    marginBottom: 0,
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
});
