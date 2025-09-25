import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import InnerHeader from './../components/InnerHeader';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppContext } from './../ContextAPI/ContextAPI';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from "axios";

export default function CartScreen({ navigation }) {
  const { apiToken, accessTokens, cartRefresh, onRefereshCart, getTotal } = useContext(AppContext);
  const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/cart`;
  const API_URL_CART = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/cart/update`;

  const [cartData, setCartData] = useState([]);
  const [summary, setSummary] = useState(null);

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

      console.log('cartItem', cartItem);
      // updateQuantity(item.cart_item_id, newQuantity);
      // const cartItem = cartData?.filter(cartItem => cartItem?.cart_item_id === item?.cart_item_id).map(cartItem => cartItem);
      // cartItem?.map(cartItem => {
        try {
          const response = await axios.put(`${API_URL_CART}`, cartItem, {
            headers: {
              'Authorization': `Bearer ${apiToken}`, // API token
              'X-User-Token': `Bearer ${accessTokens}`, // User token
              'Content-Type': 'application/json'
            }
          })
          console.log('Add to Cart', response);
          // setLoading(false);
          // if(response.data.statusCode === 200) {
              onRefereshCart(true);
          // }
        } catch (error) {
          console.error("Error fetching add to cart:", error.response?.data || error.message);
          if (error.response?.status === 401) {
          
          }
          
        }
      // })
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

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.images[0]?.path }} style={styles.productImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.productName}>{item.product_name}</Text>
        <Text style={styles.productPrice}>₹{item.price}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityBtn}
            onPress={() => handleQuantityChange(item, -1)}
          >
            <Text style={styles.quantityText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityBtn}
            onPress={() => handleQuantityChange(item, 1)}
          >
            <Text style={styles.quantityText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity style={styles.removeBtn}>
        <Icon name="trash-outline" size={20} color="#f44336" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* <InnerHeader /> */}
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 15, backgroundColor:"#ffffff" }}
      >
        <Text style={styles.title}>My Cart</Text>
        {cartData?.length === 0 ? (
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
        ) : (
          <>
            <FlatList
              data={cartData}
              keyExtractor={(item) => item?.cart_item_id?.toString()}
              renderItem={renderCartItem}
              contentContainerStyle={styles.cartList}
            />

            {summary && (
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
                  <Text style={styles.summaryValue}>₹{summary.subtotal}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tax:</Text>
                  <Text style={styles.summaryValue}>₹{summary.tax_amount}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalAmount}>₹{summary.total_amount}</Text>
                </View>

                <TouchableOpacity
                  style={styles.checkoutBtn}
                  onPress={() => navigation.navigate('CheckoutScreen')}
                >
                  <Text style={styles.checkoutText}>Proceed to Checkout</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F44336' },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 10,
    textAlign:"center"
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
    marginBottom: 20,
  },
  shopBtn: {
    backgroundColor: '#f67179',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  shopText: { color: '#fff', fontWeight: 'bold' },
  cartList: { padding: 10 },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
    elevation: 2,
    alignItems: 'center',
  },
  productImage: { width: 60, height: 60, resizeMode: 'contain', marginRight: 10 },
  itemDetails: { flex: 1 },
  productName: { fontWeight: '600', marginBottom: 4, color:"#000" },
  productPrice: { fontSize: 16, fontWeight: 'bold', color: '#000', marginBottom: 8 },
  quantityContainer: { flexDirection: 'row', alignItems: 'center' },
  quantityBtn: {
    backgroundColor: '#f67179',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  quantity: { marginHorizontal: 15, fontSize: 16, fontWeight: 'bold' },
  removeBtn: { padding: 5 },
  footer: {
    backgroundColor: '#fff',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    borderRadius: 6,
    marginTop: 10,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: { fontSize: 16, color: '#444' },
  summaryValue: { fontSize: 16, fontWeight: '600' },
  totalLabel: { fontSize: 18, fontWeight: 'bold' },
  totalAmount: { fontSize: 18, fontWeight: 'bold', color: '#f67179' },
  checkoutBtn: {
    backgroundColor: '#f67179',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 15,
  },
  checkoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
