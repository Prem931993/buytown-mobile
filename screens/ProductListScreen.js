import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import { useContext, useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import InnerHeader from './../components/InnerHeader';
import { AppContext } from './../ContextAPI/ContextAPI';

const { width } = Dimensions.get('window');

export default function ProductListScreen({ route, navigation }) {
  const { category_id, name } = route.params;
  const { apiToken, accessTokens, onGenerateToken } = useContext(AppContext);

  const [brands, setBrands] = useState([]); // Will fetch dynamically or static
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [productList, setProductList] = useState([]);
  const [page, setPage] = useState(1);

  const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/products`;

  useEffect(() => {
    const fetchProducts = async () => {
      if (!apiToken || !accessTokens) return;

      try {
        const response = await axios.post(
          API_URL,
          { page, category_id },
          {
            headers: {
              'Authorization': `Bearer ${apiToken}`,
              'X-User-Token': `Bearer ${accessTokens}`,
              'Content-Type': 'application/json'
            }
          }
        );
        if (response.data.statusCode === 200) {
          const products = response.data.products;

          // Extract unique brands from products
          const uniqueBrands = products
            .map(p => p.brand_name || 'Others')
            .filter((v, i, a) => a.indexOf(v) === i);

          setBrands(uniqueBrands);
          setSelectedBrand(uniqueBrands[0] || null); // default first brand
          setProductList(products);
        }
      } catch (error) {
        console.error("Error fetching products:", error.response?.data || error.message);
        if (error.response?.status === 401) {
          await AsyncStorage.removeItem("accessToken");
          await AsyncStorage.removeItem("apiToken");
          onGenerateToken(true);
        }
      }
    };

    fetchProducts();
  }, [apiToken, accessTokens, page]);

  // Filter products by selected brand
  const filteredProducts = selectedBrand
    ? productList.filter(item => (item.brand_name || 'Others') === selectedBrand)
    : productList;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <InnerHeader />

      <ScrollView contentContainerStyle={{ paddingBottom: 0, paddingHorizontal: 15, backgroundColor:"#ffffff" }}>
        <Text style={styles.categoryTitle}>{name}</Text>

        {/* Brand Tabs */}
        

        {/* Product Grid */}
        {productList?.length > 0 ? 
        <FlatList
          data={productList}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          scrollEnabled={false} // disable FlatList scroll inside ScrollView
          renderItem={({ item }) => (
            <View style={styles.productCard}>
              {item.discount && (
                <Text style={styles.discountLabel}>{item.discount} OFF</Text>
              )}

              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('ProductDetailsScreen', { product: item })
                }
              >
                {/* Show first image as thumbnail */}
                <Image
                  source={{ uri: item.images?.[0]?.path }}
                  style={styles.productImage}
                />
                <Text numberOfLines={2} style={styles.productName}>
                  {item.name}
                </Text>
              </TouchableOpacity>

              <Text style={styles.productPrice}>
                <Text style={styles.strikeOut}>₹{item.price}</Text> - ₹{item?.selling_price}
              </Text>

              <Icon
                style={styles.whislistIcon}
                name="heart-outline"
                size={24}
                color="#787878ff"
              />

              <TouchableOpacity
                style={styles.addBtn}
                onPress={() =>
                  navigation.navigate('ProductDetailsScreen', { product: item })
                }
              >
                <Text style={styles.addText}>View Product</Text>
              </TouchableOpacity>
            </View>
          )}
        />
        :
        <>
          <View style={{flex: 1, height:"100%", justifyContent: 'center', backgroundColor:"#ffffff"}}>
            <Text>No Product Found</Text>
          </View>
        </>
        }
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F44336', paddingBottom:0, },
  categoryTitle: {
    // paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom:10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  brandTabs: { paddingVertical: 10, paddingLeft: 10 },
  brandTab: {
    marginRight: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  activeBrandTab: { backgroundColor: '#f67179', borderColor: '#f67179' },
  brandText: { color: '#333' },
  activeBrandText: { color: '#fff', fontWeight: 'bold' },

  productCard: {
    flex: 1,
    margin: 5,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 6,
    elevation: 2,
  },
  discountLabel: {
    backgroundColor: 'red',
    color: '#fff',
    paddingHorizontal: 4,
    fontSize: 10,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  productImage: {
    width: (width / 2) - 20,
    height: 120,
    resizeMode: 'contain',
  },
  productName: { fontWeight: '600', marginTop: 6 },
  productPrice: { fontSize: 14, fontWeight: 'bold', color: '#000' },
  addBtn: {
    marginTop: 6,
    backgroundColor: '#f67179',
    paddingVertical: 6,
    borderRadius: 4,
    alignItems: 'center',
  },
  addText: { fontWeight: 'bold', color: '#fff', fontSize: 13 },
  whislistIcon: { position: 'absolute', top: 5, right: 5 },
  strikeOut: {
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
    color: "#999999",
  },
});
