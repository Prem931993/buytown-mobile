import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import { useContext, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import InnerHeader from './../components/InnerHeader';
import { AppContext } from './../ContextAPI/ContextAPI';

const { width, height } = Dimensions.get('window');

export default function ProductListScreen({ route, navigation }) {
  const { category_id, name } = route.params;
  const { apiToken, accessTokens, onGenerateToken } = useContext(AppContext);

  const [filters, setFilters] = useState({});
  const [brands, setBrands] = useState([]); // Will use filters.brands
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [productList, setProductList] = useState([]);
  const [page, setPage] = useState(1);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizeDimensions, setSelectedSizeDimensions] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState({ min: '', max: '' });
  const [isBrandOpen, setIsBrandOpen] = useState(true);
  const [isColorOpen, setIsColorOpen] = useState(true);
  const [isSizeOpen, setIsSizeOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);

  const slideAnim = useRef(new Animated.Value(width * 0.8)).current;

  const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/products`;

  useEffect(() => {
    const fetchFilters = async () => {
      if (!apiToken || !accessTokens) return;

      try {
        const response = await axios.get(
          `${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/products/filters?category_id=${category_id}`,
          {
            headers: {
              'Authorization': `Bearer ${apiToken}`,
              'X-User-Token': `Bearer ${accessTokens}`,
              'Content-Type': 'application/json'
            }
          }
        );
        if (response.data.statusCode === 200) {
          setFilters(response.data.filters);
          setBrands(response.data.filters.brands);
          setSelectedBrands([]);
          setSelectedPriceRange({ min: response.data.filters.priceRange.min, max: response.data.filters.priceRange.max });
        }
      } catch (error) {
        console.error("Error fetching filters:", error.response?.data || error.message);
        if (error.response?.status === 401) {
          await AsyncStorage.removeItem("accessToken");
          await AsyncStorage.removeItem("Token");
          onGenerateToken(true);
        }
      }
    };

    fetchFilters();
  }, [apiToken, accessTokens, category_id]);

  const fetchProducts = async (filters = {}) => {
    if (!apiToken || !accessTokens) return;

    try {
      const response = await axios.post(
        API_URL,
        { page, category_id, ...(filters || {}) },
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
        setProductList(products);
      }
    } catch (error) {
      console.error("Error fetching products:", error.response?.data || error.message);
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem("accessToken");
        await AsyncStorage.removeItem("Token");
        onGenerateToken(true);
      }
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [apiToken, accessTokens, page]);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: drawerVisible ? 0 : width * 0.8,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [drawerVisible]);



  const renderHeader = () => (
    <View style={{ 
      paddingHorizontal: 15, 
      backgroundColor: "#ffffff", 
      flex: 0,
      flexDirection: "row", 
      justifyContent: "space-between", 
      alignItems: "center"
    }}>
      <Text style={styles.categoryTitle}>{name}</Text>

      <TouchableOpacity 
        onPress={() => setDrawerVisible(true)} 
        style={styles.filterButton}
      >
        <Icon name="filter" size={24} color="#000" />
        <Text> Filter</Text>
      </TouchableOpacity>
    </View>

  );

  const renderEmptyComponent = () => (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ffffff",
        paddingHorizontal: 20,
      }}
    >
      {/* Icon */}
      <Icon name="cube-outline" size={80} color="#ccc" style={{ marginBottom: 20 }} />

      {/* Title */}
      <Text style={{ fontSize: 20, fontWeight: "600", color: "#333", marginBottom: 8 }}>
        No Products Found
      </Text>

      {/* Subtitle */}
      <Text style={{ fontSize: 14, color: "#777", textAlign: "center", marginBottom: 20 }}>
        Looks like we couldn’t find any products for this category.  
        Try exploring other categories.
      </Text>

      {/* Action Button */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          backgroundColor: "#000000",
          paddingVertical: 12,
          paddingHorizontal: 25,
          borderRadius: 25,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 5,
          elevation: 3,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "500" }}>
          Go Back Category
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <InnerHeader />

      {productList?.length > 0 ? (
        <FlatList
          data={productList}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={null}
          renderItem={({ item }) => (
            <View style={styles.productCard}>
              {item.discount && (
                <Text style={styles.discountLabel}>{item.discount} OFF</Text>
              )}

              <TouchableOpacity
                onPress={() =>
                  navigation.push('ProductDetailsScreen', { product: item })
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
          contentContainerStyle={{ paddingBottom: 20, backgroundColor: "#ffffff" }}
        />
      ) : (
        <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
          {renderHeader()}
          {renderEmptyComponent()}
        </View>
      )}

      <Modal
        visible={drawerVisible}
        animationType="none"
        transparent={true}
        onRequestClose={() => setDrawerVisible(false)}
      >
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.overlay} onPress={() => setDrawerVisible(false)} />
          <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Text style={styles.drawerTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setDrawerVisible(false)}>
                <Icon name="close-outline" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.drawerScroll} showsVerticalScrollIndicator={false}>
              {/* Brand Section */}
              <TouchableOpacity
                style={styles.accordionHeader}
                onPress={() => setIsBrandOpen(!isBrandOpen)}
              >
                <Text style={styles.filterSection}>Brand</Text>
                <Icon
                  name={isBrandOpen ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
              {isBrandOpen && (
                <View style={styles.tagContainer}>
                  {brands.map(brand => (
                    <TouchableOpacity key={brand.id} onPress={() => {
                      if (selectedBrands.includes(brand.id)) {
                        setSelectedBrands(selectedBrands.filter(b => b !== brand.id));
                      } else {
                        setSelectedBrands([...selectedBrands, brand.id]);
                      }
                    }} style={[
                      styles.filterOption,
                      selectedBrands.includes(brand.id) && styles.selectedFilterOption
                    ]}>
                      <Text style={[
                        styles.optionText,
                        selectedBrands.includes(brand.id) && styles.selectedOptionText
                      ]}>{brand.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Color Section */}
              <TouchableOpacity
                style={styles.accordionHeader}
                onPress={() => setIsColorOpen(!isColorOpen)}
              >
                <Text style={styles.filterSection}>Color</Text>
                <Icon
                  name={isColorOpen ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
              {isColorOpen && (
                <View style={styles.tagContainer}>
                  {filters.colors?.map(color => (
                    <TouchableOpacity key={color} onPress={() => {
                      if (selectedColors.includes(color)) {
                        setSelectedColors(selectedColors.filter(c => c !== color));
                      } else {
                        setSelectedColors([...selectedColors, color]);
                      }
                    }} style={[
                      styles.filterOption,
                      selectedColors.includes(color) && styles.selectedFilterOption
                    ]}>
                      <Text style={[
                        styles.optionText,
                        selectedColors.includes(color) && styles.selectedOptionText
                      ]}>{color}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Size Section */}
              <TouchableOpacity
                style={styles.accordionHeader}
                onPress={() => setIsSizeOpen(!isSizeOpen)}
              >
                <Text style={styles.filterSection}>Size/Dimensions</Text>
                <Icon
                  name={isSizeOpen ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
              {isSizeOpen && (
                <View style={styles.tagContainer}>
                  {filters.sizeDimensions?.map(size => (
                    <TouchableOpacity key={size} onPress={() => {
                      if (selectedSizeDimensions.includes(size)) {
                        setSelectedSizeDimensions(selectedSizeDimensions.filter(s => s !== size));
                      } else {
                        setSelectedSizeDimensions([...selectedSizeDimensions, size]);
                      }
                    }} style={[
                      styles.filterOption,
                      selectedSizeDimensions.includes(size) && styles.selectedFilterOption
                    ]}>
                      <Text style={[
                        styles.optionText,
                        selectedSizeDimensions.includes(size) && styles.selectedOptionText
                      ]}>{size}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Price Range Section */}
              <TouchableOpacity
                style={styles.accordionHeader}
                onPress={() => setIsPriceOpen(!isPriceOpen)}
              >
                <Text style={styles.filterSection}>Price Range</Text>
                <Icon
                  name={isPriceOpen ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
              {isPriceOpen && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 20 }}>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Min"
                    value={selectedPriceRange.min}
                    onChangeText={(text) => setSelectedPriceRange(prev => ({ ...prev, min: text }))}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Max"
                    value={selectedPriceRange.max}
                    onChangeText={(text) => setSelectedPriceRange(prev => ({ ...prev, max: text }))}
                    keyboardType="numeric"
                  />
                </View>
              )}
            </ScrollView>

            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={() => {
                setSelectedBrands([]);
                setSelectedColors([]);
                setSelectedSizeDimensions([]);
                setSelectedPriceRange({ min: '', max: '' });
              }} style={styles.clearButton}>
                <Text style={styles.clearText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                // setPage(1);
                fetchProducts({
                  brand_id: selectedBrands.length > 0 ? selectedBrands : "",
                  colors: selectedColors.length > 0 ? selectedColors : "",
                  size_dimensions: selectedSizeDimensions.length > 0 ? selectedSizeDimensions : "",
                  // priceRange: selectedPriceRange
                });
                setDrawerVisible(false);
              }} style={styles.applyButton}>
                <Text style={styles.applyText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000ff', paddingBottom:0, },
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
  productName: { fontWeight: '600', marginTop: 6, marginBottom:5, },
  productPrice: { fontSize: 14, fontWeight: 'bold', color: '#f67179', marginBottom:5, },
  addBtn: {
    marginTop: 6,
    backgroundColor: '#ecececff',
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  addText: { fontWeight: 'bold', color: '#000000ff', fontSize: 13 },
  whislistIcon: { position: 'absolute', top: 5, right: 5 },
  strikeOut: {
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
    color: "#999999",
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f3f2f2ff',
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 10,
    marginTop:10,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: width * 0.8,
    backgroundColor: '#fff',
    flex: 1,
    padding:10,
    justifyContent: 'space-between',
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 0,
    
  },
  filterSection: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 0,
    marginBottom: 10,
    
    paddingTop:20,
    // width:"90%"
  },
  optionText: {
    fontSize: 14,
  },
  selectedOption: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f67179',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 0,
    borderColor: '#ccc',
    backgroundColor:"#f4f4f4ff",
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedFilterOption: {
    backgroundColor: '#F44336',
    borderColor: '#F44336',
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  clearButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F44336',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  clearText: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  applyButton: {
    backgroundColor: '#F44336',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    flex: 1,
  },
  applyText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  priceInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    width: '45%',
    borderRadius: 4,
  },
  drawerScroll: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal:5,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 10,
    borderTopWidth:1,
    borderColor: '#ccc',
  },
});
