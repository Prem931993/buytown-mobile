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




import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function CategoryScreen() {
  const navigation = useNavigation();  

  return (
    <>
    {/* //   <View style={styles.header}>
    //      <Icon onPress={() => navigation.goBack()} name="arrow-back-outline" size={24} color="#fff" />
    //     {/* <Text style={styles.headerText}>Category ▼</Text> 
    //      <TextInput
    //       style={styles.searchBar}
    //       placeholder="Search glue, PVC, Skew..."
    //    />
    //  </View> */}
    {/* <StatusBar barStyle="dark-content" backgroundColor="white" /> */}
    <View style={styles.header}>
      <Icon onPress={() => navigation.goBack()} name="arrow-back-outline" size={24} color="#fff" />
        {/* <TextInput
          style={styles.searchBar}
          placeholder="Search glue, PVC, Skew..."
        /> */}

         <View style={styles.searchContainer}>
            <Icon name="search-outline" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search glue, PVC, Skew..."
              placeholderTextColor="#999"
            />
          </View>
      
    </View>
    </>
    
  );
}

const styles = StyleSheet.create({
  
  // header: {
  //   backgroundColor: '#eb1f2a',
  //   padding: 10,
  //   paddingTop:60,
  //   flexDirection: 'row',
  //   alignItems: 'center',
  // },
  // headerText: { color: '#fff', fontSize: 18, marginLeft: 10 },
  header: {
    backgroundColor: '#F44336',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal:20,
    // borderBottomLeftRadius: 20,
    // borderBottomRightRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 0,
  },
  // searchBar: {
  //   flex: 1,
  //   backgroundColor: '#fff',
  //   borderRadius: 6,
  //   marginLeft: 10,
  //   paddingHorizontal: 10,
  //   paddingVertical:15,
  //   height:50
  // },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 45,
    width:"93%"
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
 
});

