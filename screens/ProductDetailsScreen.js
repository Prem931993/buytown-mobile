import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, Image, TouchableOpacity, Modal, ActivityIndicator,
  StyleSheet, ScrollView, FlatList, StatusBar, Share, Alert, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import Toast from 'react-native-toast-message';

import { AppContext } from './../ContextAPI/ContextAPI';
import InnerHeader from './../components/InnerHeader';

const { width } = Dimensions.get('window');

export default function ProductDetailsScreen({ route, navigation }) {
  const { apiToken, accessTokens, cart, onRefereshCart, decreaseQuantity } =useContext(AppContext);
  const [productDetails, setProductDetails] = useState();
  const [isInWishlist, setIsInWishlist] = useState(false);

  const { product } = route.params;

  const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/products/${product.id}`;
  const API_URL_CART = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/cart/add`;


  useEffect(()=> {
    const fetchSingleProduct = async () => {
    try {
      //setLoading(true);
      const response = await axios.get(
        API_URL,
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'X-User-Token': `Bearer ${accessTokens}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.data.statusCode === 200) {
        setProductDetails(response.data.product)
        setIsInWishlist(response.data.product.is_wishlisted || false)
      }
    } catch (error) {
      console.error(
        'Error fetching products Details:',
        error.response?.data || error.message
      );
      if (error.response?.status === 401) {

      }
    } finally {
      // setLoading(false);
    }
  };

  fetchSingleProduct()
  }, [product]);



  const addToCartAPI = async(productId, quantity) => {
      setLoading(true);
      try {
        const response = await axios.post(`${API_URL_CART}`, {
          product_id: productId,
          quantity: quantity || 1
        }, {
          headers: {
            'Authorization': `Bearer ${apiToken}`, // API token
            'X-User-Token': `Bearer ${accessTokens}`, // User token
            'Content-Type': 'application/json'
          }
        })
          setLoading(false);
          if(response.data.statusCode === 200) {
              onRefereshCart(true);
              setShowSuccessModal(true);
          }
        } catch (error) {
          console.error("Error fetching add to cart:", error.response?.data || error.message);
          setLoading(false);
          if (error.response?.status === 400) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to add item to cart');
          } else if (error.response?.status === 401) {

          }

        }
    }

  const toggleWishlist = async () => {
    try {
      await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/wishlist/${productDetails?.id}/toggle`, {}, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'X-User-Token': `Bearer ${accessTokens}`,
        },
      });
      // Update local wishlist status
      setIsInWishlist(!isInWishlist);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      Alert.alert('Error', `Failed to update wishlist: ${error.response?.data?.message || error.message}`);
    }
  };

  // useEffect(()=> {
  //   if(cart) {
  //       addToCartAPI()
  //   }
  // }, [cart])

  const [selectedImage, setSelectedImage] = useState(
    productDetails?.images?.[0]?.path || null
  );

  const [quantity, setQuantity] = useState(1);
  const [expandedSections, setExpandedSections] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Check out this product: ${productDetails?.name}\nPrice: ₹${productDetails?.selling_price}\n\n${productDetails?.description?.replace(/<[^>]+>/g, '')}`,
        url: productDetails?.images?.[0]?.path,
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share this product');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#000000" />
      <InnerHeader showSearch={false} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
       

        {/* Product Image Card */}
        <View style={styles.imageCard}>
          <View style={styles.imageContainer}>
            {selectedImage && (
              <Image source={{ uri: selectedImage }} style={styles.mainImage} />
            )}
            {!selectedImage && (
              <Image source={{ uri: productDetails?.images[0]?.path }} style={styles.mainImage} />
            )}
            <View style={styles.priceBadge}>
              <Text style={styles.priceText}>₹{productDetails?.selling_price}</Text>
            </View>
          </View>

          {/* Enhanced Image Thumbnails */}
          <View style={styles.thumbnailContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailContent}
            >
              {productDetails?.images?.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setSelectedImage(item.path)}
                  style={[
                    styles.thumbnailWrapper,
                    item.path === selectedImage && styles.activeThumbnailWrapper
                  ]}
                >
                  <Image source={{ uri: item.path }} style={styles.thumbnail} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Product Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.productHeader}>
            <View style={styles.productTitleRow}>
              <Text style={styles.productName}>{productDetails?.name}</Text>
              <TouchableOpacity onPress={toggleWishlist} style={styles.wishlistButton}>
                <Icon
                  name={isInWishlist ? "heart" : "heart-outline"}
                  size={24}
                  color={isInWishlist ? "#F44336" : "#666"}
                />
              </TouchableOpacity>
            </View>

          </View>

          {/* Accordion Sections */}
          <View style={styles.accordionContainer}>
            {/* Product Details Accordion */}
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => toggleSection('details')}
            >
              <View style={styles.accordionTitleRow}>
                <Icon name="information-circle" size={20} color="#000000" />
                <Text style={styles.accordionTitle}>Product Details</Text>
              </View>
              <Icon
                name={expandedSections.details ? "chevron-up" : "chevron-down"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
            {expandedSections.details && (
              <View style={styles.accordionContent}>
                <View style={styles.detailsGrid}>
                  {productDetails?.brand_name && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Brand</Text>
                      <Text style={styles.detailValue}>{productDetails.brand_name}</Text>
                    </View>
                  )}
                  {productDetails?.sku_code && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>SKU</Text>
                      <Text style={styles.detailValue}>{productDetails.sku_code}</Text>
                    </View>
                  )}
                  {productDetails?.color && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Color</Text>
                      <Text style={styles.detailValue}>{productDetails.color}</Text>
                    </View>
                  )}
                  {productDetails?.size_dimension && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Size</Text>
                      <Text style={styles.detailValue}>{productDetails.size_dimension}</Text>
                    </View>
                  )}
                  {productDetails?.weight_kg && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Weight</Text>
                      <Text style={styles.detailValue}>{productDetails.weight_kg} kg</Text>
                    </View>
                  )}
                  {productDetails?.stock && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Stock</Text>
                      <Text style={styles.detailValue}>{productDetails.stock} units</Text>
                    </View>
                  )}
                  {productDetails?.gst && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>GST</Text>
                      <Text style={styles.detailValue}>{productDetails.gst}%</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Description Accordion */}
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => toggleSection('description')}
            >
              <View style={styles.accordionTitleRow}>
                <Icon name="document-text" size={20} color="#000000" />
                <Text style={styles.accordionTitle}>Description</Text>
              </View>
              <Icon
                name={expandedSections.description ? "chevron-up" : "chevron-down"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
            {expandedSections.description && (
              <View style={styles.accordionContent}>
                <Text style={styles.description}>
                  {productDetails?.description?.replace(/<[^>]+>/g, '')}
                </Text>
              </View>
            )}

            {/* Specifications Accordion */}
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => toggleSection('specs')}
            >
              <View style={styles.accordionTitleRow}>
                <Icon name="hardware-chip" size={20} color="#000000" />
                <Text style={styles.accordionTitle}>Specifications</Text>
              </View>
              <Icon
                name={expandedSections.specs ? "chevron-up" : "chevron-down"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
            {expandedSections.specs && (
              <View style={styles.accordionContent}>
                <View style={styles.specsGrid}>
                  <View style={styles.specItem}>
                    <Text style={styles.specLabel}>Length</Text>
                    <Text style={styles.specValue}>{productDetails?.length_mm} mm</Text>
                  </View>
                  <View style={styles.specItem}>
                    <Text style={styles.specLabel}>Width</Text>
                    <Text style={styles.specValue}>{productDetails?.width_mm} mm</Text>
                  </View>
                  <View style={styles.specItem}>
                    <Text style={styles.specLabel}>Height</Text>
                    <Text style={styles.specValue}>{productDetails?.height_mm} mm</Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Modern Quantity & Cart Section */}
          <View style={styles.actionCard}>
            <View style={styles.quantitySection}>
              <Text style={styles.quantityLabel}>Quantity</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Icon name="remove" size={20} color="#fff" />
                </TouchableOpacity>
                <View style={styles.qtyDisplay}>
                  <Text style={styles.qtyText}>{quantity}</Text>
                </View>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => setQuantity(quantity + 1)}
                >
                  <Icon name="add" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.addToCartBtn}
              onPress={() => addToCartAPI(productDetails?.id, quantity)}
              disabled={loading}
            >
              <LinearGradient
                colors={['#000000', '#333333']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientBtn}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Icon name="bag-add" size={20} color="#fff" />
                    <Text style={styles.addToCartText}>Add to Cart</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Related Products Section */}
        {productDetails?.relatedProducts?.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.sectionTitle}>Related Products</Text>
            <FlatList
              data={productDetails.relatedProducts}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={styles.relatedList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.relatedCard}
                  onPress={() => navigation.navigate('ProductDetailsScreen', { product: item })}
                >
                  <View style={styles.relatedImageContainer}>
                    <Image
                      source={{ uri: item.images?.[0]?.path }}
                      style={styles.relatedImage}
                    />
                  </View>
                  <View style={styles.relatedInfo}>
                    <Text style={styles.relatedName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={styles.relatedPrice}>₹{item.price}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Success Modal */}
        <Modal
          visible={showSuccessModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowSuccessModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Icon name="checkmark-circle" size={60} color="#4CAF50" />
              <Text style={styles.modalTitle}>Product Added to Cart!</Text>
              <Text style={styles.modalMessage}>{`${productDetails?.name} has been added successfully.`}</Text>
              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity
                  style={styles.modalSecondaryButton}
                  onPress={() => setShowSuccessModal(false)}
                >
                  <Text style={styles.modalSecondaryButtonText}>Shop</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalPrimaryButton}
                  onPress={() => {
                    setShowSuccessModal(false);
                    navigation.navigate('MainTabs', { screen: 'Cart' });
                  }}
                >
                  <Text style={styles.modalPrimaryButtonText}>Cart</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingBottom: 60,
    backgroundColor:"#ffffff"
  },

  // Image Section
  imageCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
  },
  imageContainer: {
    height: 280,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  priceBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  priceText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  thumbnailContainer: {
    padding: 16,
  },
  thumbnailContent: {
    paddingHorizontal: 8,
  },
  thumbnailWrapper: {
    marginHorizontal: 4,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeThumbnailWrapper: {
    borderColor: '#000000',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },

  // Info Card
  infoCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
  },
  productHeader: {
    marginBottom: 20,
  },
  productTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    lineHeight: 32,
    flex: 1,
    marginRight: 16,
  },
  wishlistButton: {
    padding: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },

  // Accordion
  accordionContainer: {
    marginBottom: 24,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  accordionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 12,
  },
  accordionContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: -4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  detailsGrid: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  specsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  specItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  specLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  specValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '700',
  },

  // Action Card
  actionCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  quantitySection: {
    marginBottom: 16,
  },
  quantityLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 4,
    alignSelf: 'flex-start',
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyDisplay: {
    minWidth: 50,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  qtyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  addToCartBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },

  // Related Products
  relatedSection: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  relatedList: {
    paddingHorizontal: 4,
    paddingBottom: 10,
  },
  relatedCard: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  relatedImageContainer: {
    height: 120,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  relatedImage: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  relatedInfo: {
    padding: 12,
  },
  relatedName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    lineHeight: 18,
  },
  relatedPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
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
