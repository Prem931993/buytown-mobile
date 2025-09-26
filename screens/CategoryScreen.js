// import React from 'react';
// import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, SafeAreaView, TextInput } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import { useNavigation } from '@react-navigation/native';

// const categories = [
//   // { id: '1', label: 'Featured', icon: 'ribbon-outline' },
//   { id: '1', label: 'Screw', image: require('./../assets/screw.png') },
//   { id: '2', label: 'Handles', image: require('./../assets/door-handle.png') },
//   { id: '3', label: 'PVC', image: require('./../assets/window.png') },
// ];

// const products = [
//   {
//     id: '1',
//     name: 'PVC Door 1',
//     price: '₹164',
//     oldPrice: '₹210',
//     discount: '22%',
//     image: require('./../assets/product-img.jpeg'),
//     rating: '4.4',
//     reviews: '42,321',
//     weight: '1 Door',
//   },
//   {
//     id: '2',
//     name: 'PVC Door 2',
//     price: '₹164',
//     oldPrice: '₹210',
//     discount: '22%',
//     image: require('./../assets/product-img-2.jpeg'),
//     rating: '4.4',
//     reviews: '42,321',
//     weight: '1 Door',
//   },
//   {
//     id: '3',
//     name: 'PVC Door 2',
//     price: '₹164',
//     oldPrice: '₹210',
//     discount: '22%',
//     image: require('./../assets/product-img-2.jpeg'),
//     rating: '4.4',
//     reviews: '42,321',
//     weight: '1 Door',
//   },
//   {
//     id: '4',
//     name: 'PVC Door 2',
//     price: '₹164',
//     oldPrice: '₹210',
//     discount: '22%',
//     image: require('./../assets/product-img.jpeg'),
//     rating: '4.4',
//     reviews: '42,321',
//     weight: '1 Door',
//   },
//   {
//     id: '5',
//     name: 'PVC Door 2',
//     price: '₹164',
//     oldPrice: '₹210',
//     discount: '22%',
//     image: require('./../assets/product-img-2.jpeg'),
//     rating: '4.4',
//     reviews: '42,321',
//     weight: '1 Door',
//   },
//   {
//     id: '6',
//     name: 'PVC Door 2',
//     price: '₹164',
//     oldPrice: '₹210',
//     discount: '22%',
//     image: require('./../assets/product-img.jpeg'),
//     rating: '4.4',
//     reviews: '42,321',
//     weight: '1 Door',
//   },
//   // Add more products
// ];

// export default function CategoryScreen() {
//     const navigation = useNavigation();
//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <Icon onPress={() => navigation.navigate('Home')} name="arrow-back-outline" size={24} color="#fff" />
//         <Text style={styles.headerText}>Category ▼</Text>
//         <TextInput
//           style={styles.searchBar}
//           placeholder="Search glue, PVC, Skew..."
//         />
//       </View>

//       {/* Content */}
//       <View style={styles.content}>
//         {/* Left Category List */}
//         <View style={styles.sidebar}>
//           <FlatList
//             data={categories}
//             keyExtractor={(item) => item.id}
//             renderItem={({ item }) => (
//               <TouchableOpacity style={styles.categoryItem}>
//                 {/* <Icon name={item.icon} size={24} /> */}
//                 <Image source={item.image} style={styles.categoryImage} />
//                 <Text style={styles.categoryText}>{item.label}</Text>
//               </TouchableOpacity>
//             )}
//           />
//         </View>

//         {/* Right Product Grid */}
//         <FlatList
//           data={products}
//           keyExtractor={(item) => item.id}
//           numColumns={2}
//           contentContainerStyle={styles.productList}
//           renderItem={({ item }) => (
//             <View style={styles.productCard}>
//               <Text style={styles.discountLabel}>{item.discount} OFF</Text>
//               <TouchableOpacity
//                 onPress={() => navigation.navigate('ProductDetailsScreen', { product: item })}
//               >
//                 <Image source={item.image} style={styles.productImage} />
//                 <Text numberOfLines={2} style={styles.productName}>{item.name}</Text>
//               </TouchableOpacity>
//               <Text style={styles.productWeight}>{item.weight}</Text>
//               <Text style={styles.productPrice}>
//                 {item.price} <Text style={styles.oldPrice}>{item.oldPrice}</Text>
//               </Text>
//               <TouchableOpacity style={styles.addBtn}>
//                 <Text style={styles.addText}>Add to Cart</Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         />
//       </View>

//       {/* Bottom Navigation */}
//       {/* <View style={styles.bottomNav}>
//         <Icon name="home-outline" size={24} />
//         <Icon name="grid-outline" size={24} />
//         <Icon name="pricetags-outline" size={24} />
//         <Icon name="reload-outline" size={24} />
//         <Icon name="cart-outline" size={24} />
//       </View> */}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   header: {
//     backgroundColor: '#eb1f2a',
//     padding: 10,
//     paddingTop:60,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   headerText: { color: '#fff', fontSize: 18, marginLeft: 10 },
//   searchBar: {
//     flex: 1,
//     backgroundColor: '#fff',
//     borderRadius: 6,
//     marginLeft: 10,
//     paddingHorizontal: 10,
//   },
//   content: { flexDirection: 'row', flex: 1 },
//   sidebar: { width: 80, paddingTop:5, backgroundColor: '#f3f3f3' },
//   categoryImage: {width: 26, height:26,},
//   categoryItem: { alignItems: 'center', paddingVertical: 15 },
//   categoryText: { fontSize: 12, marginTop: 4 },
//   productList: { padding: 10 },
//   productCard: {
//     flex: 1,
//     margin: 5,
//     backgroundColor: '#fff',
//     padding: 10,
//     borderRadius: 6,
//     elevation: 2,
//   },
//   discountLabel: {
//     backgroundColor: 'red',
//     color: '#fff',
//     paddingHorizontal: 4,
//     fontSize: 10,
//     alignSelf: 'flex-start',
//     marginBottom: 4,
//   },
//   productImage: { width: '100%', height: 120, resizeMode: 'contain' },
//   productName: { fontWeight: '600', marginTop: 6 },
//   productWeight: { fontSize: 12, color: '#777' },
//   productPrice: { fontSize: 14, fontWeight: 'bold', color: '#000' },
//   oldPrice: { textDecorationLine: 'line-through', color: '#777' },
//   addBtn: {
//     marginTop: 6,
//     backgroundColor: '#f67179',
//     paddingVertical: 6,
//     borderRadius: 4,
//     alignItems: 'center',
    
//   },
//   addText: { fontWeight: 'bold', color:"#ffffff", fontSize: 13, },
//   bottomNav: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     padding: 12,
//     borderTopWidth: 1,
//     borderColor: '#ccc',
//     backgroundColor: '#fff',
//   },
// });




import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput,
  Dimensions,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import InnerHeader from './../components/InnerHeader';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
const { width } = Dimensions.get("window");
import axios from "axios";
import { AppContext } from './../ContextAPI/ContextAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CATEGORY_DATA = [
  {
    id: '1',
    name: 'SCREWS',
    image: require('../assets/screwImg-1.jpg'),
  },
  {
    id: '2',
    name: 'GLUE PRODUCTS',
    image: require('../assets/glueProductsImg.png'),
  },
  {
    id: '3',
    name: 'KITCHEN BASKET',
    image: require('../assets/kitchenBasketImg.png'),
  },
  {
    id: '4',
    name: 'PULL OUT SLIDERS',
    image: require('../assets/PullOutSliderImg.png'),
  },
  {
    id: '5',
    name: 'HINGES',
    image: require('../assets/Hinges.png'),
  },
  {
    id: '6',
    name: 'DRILL BITS AND CUTTERS',
    image: require('../assets/Drill-bits-cutters.png'),
  },
  {
    id: '7',
    name: 'HANDLES',
    image: require('../assets/handleimg-1.png'),
  },
  {
    id: '8',
    name: 'LIGHTS AND FITTINGS',
    image: require('../assets/lights-fittings.png'),
  },
  {
    id: '9',
    name: 'PVC ITEMS',
    image: require('../assets/PvcImg.jpg'),
  },
  {
    id: '10',
    name: 'LOCKS',
    image: require('../assets/locksImg.png'),
  },
  {
    id: '11',
    name: 'ACCESORIESS',
    image: require('../assets/accessoriesImg.png'),
  },
  {
    id: '12',
    name: 'MACHINES & TOOLS ',
    image: require('../assets/machine-tools.png'),
  },
  {
    id: '13',
    name: 'LAMINATION',
    image: require('../assets/handleimg-1.png'),
  },
  {
    id: '14',
    name: 'PLYWOOD',
    image: require('../assets/handleimg-1.png'),
  },
  {
    id: '15',
    name: 'FLUTED PANELS',
    image: require('../assets/handleimg-1.png'),
  },
  {
    id: '16',
    name: 'CLEANPACK',
    image: require('../assets/handleimg-1.png'),
  },
];

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/categories`; // replace with your token endpoint


export default function CategoryScreen() {
  const [selectedCategory, setSelectedCategory] = useState(CATEGORY_DATA[0]);
  const navigation = useNavigation();

  const { apiToken, accessTokens, onGenerateToken } = useContext(AppContext);
  const [categories, setCategories]= useState([])

  useEffect(()=> {
    const fetchTopSelling = async() => {
      // setLoading(true);
      try {
        const response = await axios.get(`${API_URL}`, {
          headers: {
            'Authorization': `Bearer ${apiToken}`, // API token
            'X-User-Token': `Bearer ${accessTokens}`, // User token
            'Content-Type': 'application/json'
          }
        })
        // setLoading(false);
        if(response.data.statusCode === 200) {
          setCategories(response.data.categories)
        }
      } catch (error) {
        console.error("Error fetching top-selling products:", error.response?.data || error.message);
        if (error.response?.status === 401) {
          // Clear invalid tokens
          await AsyncStorage.removeItem("accessToken");
          await AsyncStorage.removeItem("apiToken");
          // Regenerate API token
          onGenerateToken(true);
        }
        // setLoading(false);
        // Don't throw to avoid uncaught promise rejection
      }
    }

    if(apiToken && accessTokens) {
      fetchTopSelling()
    }

  }, [apiToken, accessTokens, onGenerateToken])


  const renderSidebarItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.sidebarItem,
        item.id === selectedCategory.id && styles.activeSidebar,
      ]}
      onPress={() => navigation.navigate('ProductListScreen', {category_id: item?.id, name: item?.name})}
    >
      <Image source={{uri: item?.image}} style={styles.sidebarIcon} />
      <Text
        style={[
          styles.sidebarText,
          item.id === selectedCategory.id && styles.activeSidebarText,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderSubCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.subItem}
      onPress={() =>
        navigation.navigate('ProductListScreen', {
          mainCategory: selectedCategory.name,
          subCategory: item.name,
        })
      }
    >
      <Image
        source={item?.image}
        style={styles.subIcon}
      />
      <Text style={styles.subText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <InnerHeader />
      <View style={styles.row}>
        {/* Sidebar */}
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={renderSidebarItem}
          style={styles.sidebar}
           numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }} // optional spacing
          contentContainerStyle={styles.sidebar}
          showsVerticalScrollIndicator={false}
        />

        {/* Sub Categories */}
        {/* <FlatList
          data={selectedCategory.subCategories}
          keyExtractor={(item) => item.id}
          renderItem={renderSubCategoryItem}
          numColumns={2}
          contentContainerStyle={styles.subCategoryWrap}
          style={styles.subCategoryList}
        /> */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F44336',
    paddingTop:0,
  },
  row: {
    flexDirection: 'row',
    flex: 1,
    width:"100%"
  },
  searchBar: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 6,
    marginLeft: 10,
    paddingHorizontal: 10,
  },
  sidebar: {
    width: "100%",
    backgroundColor: '#ffffffff',
    padding:7
  },
  sidebarItem: {
    width: "46%", // same as calc(50% - 14)
    alignItems: 'center',
    // paddingVertical: 15,
    // paddingHorizontal: 5,
    paddingVertical:15,
    // backgroundColor: '#f1f4feff',
    borderWidth:1,
    borderColor:"#d4d4d4ff",
    marginBottom:15,
    marginHorizontal:7,
     borderRadius: 8,
  },
  activeSidebar: {
    // backgroundColor: '#ffe5e6',
    borderLeftWidth: 0,
    // borderColor: '#eb1f2a',
  },
  sidebarIcon: {
    width: "100%",
    height: 100,
    // height: hp('15%'),
    marginBottom: 15,
    // aspectRatio: 16 / 9,   // keep aspect ratio (can adjust like 4/3 or 1)
    resizeMode: 'contain',
    // borderRadius:50,
    borderRadius: 8,
  },
  sidebarText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333333',
    fontWeight:'bold'
  },
  activeSidebarText: {
    // color: '#eb1f2a',
    // fontWeight: 'bold',
  },
  subCategoryList: {
    // flex: 1,
    width:"85%"
  },
  subCategoryWrap: {
    padding: 15,
    gap: 10,
  },
  subItem: {
    width: '48%',
    marginHorizontal: '2%',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    // elevation: 3,
    padding: 10,
  },
  subIcon: {
   width: '100%', height: 100, resizeMode: 'contain'
  },
  subText: {
    textAlign: 'center',
    fontSize: 12,
    paddingTop:7,
  },
});

