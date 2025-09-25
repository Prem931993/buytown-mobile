import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, Image, TouchableOpacity,
  StyleSheet, ScrollView, FlatList, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

import { AppContext } from './../ContextAPI/ContextAPI';




const product = {
  id: '1',
  name: 'Drywall Screw Black 50mm x 6mm',
  image: require('./../assets/DRY WALL BLACK  (50X6).png'),
  price: '₹120.99',
  rating: 4.8,
  reviews: 185,
  description:
    'Premium black phosphate drywall screw, 50mm long, 6mm diameter, made from hardened carbon steel with corrosion-resistant coating. Ideal for fixing plasterboard to timber or metal frames. Sharp point and deep thread ensure strong grip and easy installation with power drivers.',
  sizes: ['50X6', '50X8', '38X6', '38X8', '32X6', '32X8'],
};

export default function ProductDetailsScreen({ route, navigation }) {
  // const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const { apiToken, accessTokens, cart, onRefereshCart, decreaseQuantity } =useContext(AppContext);
  const [productDetails, setProductDetails] = useState();

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
      // setLoading(true);
      console.log("quantity", quantity)
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
        console.log('Add to Cart', response);
        // setLoading(false);
        if(response.data.statusCode === 200) {
            onRefereshCart(true);
        }
      } catch (error) {
        console.error("Error fetching add to cart:", error.response?.data || error.message);
        if (error.response?.status === 401) {
         
        }
        
      }
    }

  // useEffect(()=> {
  //   if(cart) {
  //       addToCartAPI()
  //   }
  // }, [cart])

  const [selectedImage, setSelectedImage] = useState(
    productDetails?.images?.[0]?.path || null
  );

  return (
     <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView>
        <StatusBar barStyle="dark-content" backgroundColor="black" />
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back-outline" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product Details</Text>
          <TouchableOpacity>
            <Icon name="heart-outline" size={22} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Main Product Image */}
        <View style={styles.imageWrapper}>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.image} />
          )}
          {!selectedImage && (
            <Image source={{ uri: productDetails?.images[0]?.path }} style={styles.image} />
          )}
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>{productDetails?.selling_price}</Text>
          </View>
        </View>

        {/* Image Thumbnails */}
        <FlatList
          data={productDetails?.images || []}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          style={styles.thumbnailList}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item.path }}
              style={[
                styles.thumbnail,
                item.path === selectedImage && styles.activeThumbnail,
              ]}
              onTouchStart={() => setSelectedImage(item.path)}
            />
          )}
        />

        {/* Info */}
        <View style={styles.infoWrapper}>
          <Text style={styles.productName}>{productDetails?.name}</Text>
          {/* <View style={styles.ratingRow}>
            <Text style={styles.rating}>★ {product.rating}</Text>
            <Text style={styles.reviewText}>({product.reviews} Review)</Text>
          </View> */}
          {productDetails?.brand_name && <Text style={styles.sectionTitle}>BRAND: {productDetails?.brand_name}</Text>}
          <View style={styles.sizes}>
            <TouchableOpacity
                  // key={index}
                  style={[
                    styles.sizeBtn,
                    // selectedSize === size && styles.activeSizeBtn,
                  ]}
                  // onPress={() => setSelectedSize(size)}
                >
                  <Text
                    style={[
                      styles.sizeText,
                      // selectedSize === size && styles.activeSizeText,
                    ]}
                  >
                    {productDetails?.size_dimension}
                  </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{productDetails?.description.replace(/<[^>]+>/g, '')}</Text>

          {/* Add to Cart + Quantity Selector in one line */}
          <View style={styles.cartRow}>
            

            {/* Quantity Selector */}
            <View style={styles.quantityWrapper}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => 
                  setProductDetails((prev) => ({
                    ...prev,
                    quantity: (prev?.quantity || 1) + 1,
                  }))
                }
              >
                <Text style={styles.qtyBtnText}>-</Text>
              </TouchableOpacity>

              <Text style={styles.qtyText}>{productDetails?.quantity || 1}</Text>

              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() =>
                  setProductDetails((prev) => ({
                    ...prev,
                    quantity: (prev?.quantity || 1) + 1,
                  }))
                }
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            {/* Add to Cart */}
            <TouchableOpacity style={styles.addToCart} 
              onPress={() => addToCartAPI(productDetails?.id, productDetails?.quantity) }
            >
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </TouchableOpacity>

            
          </View>



          {/* Additional Information */}
          <Text style={styles.sectionTitle}>Additional Information</Text>
          <View style={styles.additionalInfoBox}>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Length: </Text>
              {productDetails?.length_mm} mm
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Width: </Text>
              {productDetails?.width_mm} mm
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Height: </Text>
              {productDetails?.height_mm} mm
            </Text>
          </View>

          {/* Related Products */}
          {productDetails?.relatedProducts?.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Related Products</Text>
              <FlatList
                data={productDetails.relatedProducts}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={{ paddingVertical: 10 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.relatedCard}
                    onPress={() =>
                      navigation.push('ProductDetailsScreen', { product: item })
                    }
                  >
                    <Image
                      source={{ uri: item.images?.[0]?.path }}
                      style={styles.relatedImage}
                    />
                    <Text style={styles.relatedName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={styles.relatedPrice}>{item.selling_price}</Text>
                  </TouchableOpacity>
                )}
              />
            </>
          )}
        

          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    // paddingTop: 50,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  // imageWrapper: {
  //   marginTop: 10,
  //   paddingHorizontal: 20,
  //   position: 'relative',
  //   // backgroundColor: '#fff' 
  // },
  // image: {
  //   width: '100%',
  //   height: 300,
  //   resizeMode: 'cover',
  //   borderRadius: 14,
  //   borderWidth:3,
  //   borderColor:'#fcc2be',
  // },
  priceTag: {
    position: 'absolute',
    bottom: 10,
    right: 25,
    backgroundColor: '#F44336',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  priceText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingBottom:70,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rating: {
    fontSize: 14,
    color: '#000',
    marginRight: 6,
    fontWeight: '600',
  },
  reviewText: {
    fontSize: 13,
    color: '#777',
  },
  sectionTitle: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 6,
    marginTop: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  sizes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 10,
    marginBottom: 12,
  },
  sizeBtn: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  activeSizeBtn: {
    backgroundColor: '#F44336',
    borderColor: '#F44336',
  },
  sizeText: {
    fontSize: 14,
    color: '#000',
  },
  activeSizeText: {
    color: '#fff',
  },
  addToCart: {
    backgroundColor: '#F44336',
    marginTop: 30,
    marginBottom:20,
    paddingVertical: 14,
    borderRadius: 8,
  },
  addToCartText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  imageWrapper: { width: '100%', height: 300, marginBottom: 10, position: 'relative',  marginTop: 10,
    paddingHorizontal: 20,position: 'relative', },
  image: { width: '100%', height: '100%', resizeMode: 'contain', borderRadius: 14,
    borderWidth:3,borderColor:'#fcc2be'},
   thumbnailList: { marginVertical: 10,  paddingHorizontal: 20, },
  thumbnail: { width: 70, height: 70, marginRight: 10, borderRadius: 6, borderWidth: 1, borderColor: '#ddd' },
  activeThumbnail: { borderColor: '#f67179', borderWidth: 2 },
  additionalInfoBox: {
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 8,
  padding: 12,
  marginTop: 6,
  backgroundColor: '#fafafa',
},
infoText: {
  fontSize: 14,
  color: '#333',
  marginBottom: 4,
},
infoLabel: {
  fontWeight: '600',
},

relatedCard: {
  width: 140,
  marginRight: 12,
  borderWidth: 1,
  borderColor: '#eee',
  borderRadius: 10,
  backgroundColor: '#fff',
  padding: 8,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 4,
  elevation: 2,
},
relatedImage: {
  width: '100%',
  height: 100,
  resizeMode: 'contain',
  borderRadius: 8,
  marginBottom: 6,
},
relatedName: {
  fontSize: 13,
  fontWeight: '500',
  color: '#333',
  marginBottom: 4,
},
relatedPrice: {
  fontSize: 14,
  fontWeight: 'bold',
  color: '#F44336',
},
cartRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: 20,
},

quantityWrapper: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#fff',
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#ddd',
  paddingHorizontal: 10,
  paddingVertical: 10,
},

addToCart: {
  flex: 1,
  marginLeft: 15,
  backgroundColor: '#F44336',
  paddingVertical: 14,
  borderRadius: 8,
  alignItems: 'center',
},
qtyBtn: {
  width: 30,
  height: 30,
  borderRadius: 20,
  backgroundColor: '#e3e3e3',
  justifyContent: 'center',
  alignItems: 'center',
  marginHorizontal: 12,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 4,
  elevation: 3,
},
qtyBtnText: {
  color: '#000000',
  fontSize: 20,
  fontWeight: 'bold',
},
qtyText: {
  fontSize: 18,
  fontWeight: '600',
  color: '#333',
  minWidth: 30,
  textAlign: 'center',
},



});
