// // HomeScreen.js

// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   StyleSheet,
//   FlatList,
//   Image,
//   TouchableOpacity,
//   SafeAreaView,
//   ScrollView,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import Swiper from 'react-native-swiper';
// import Banner1 from './../assets/banner-1.jpg';
// import { useNavigation } from '@react-navigation/native';

// const categories = [
//   { id: '1', label: 'Skrew', icon: 'home-outline' },
//   { id: '2', label: 'Handles', icon: 'bed-outline' },
//   { id: '3', label: 'PVC', icon: 'business-outline' },
//   { id: '4', label: 'Glue', icon: 'cog-outline' },
// ];

// const banners = [
//   { id: '1', image: 'https://fastly.picsum.photos/id/866/620/326.jpg?hmac=zoDFLKDwBIECOcbMo9SqNnDpufyaxS7Jo65m1aibwlY' },
//   { id: '2', image: 'https://fastly.picsum.photos/id/866/620/326.jpg?hmac=zoDFLKDwBIECOcbMo9SqNnDpufyaxS7Jo65m1aibwlY' },
// ];

// const flashDeals = [
//   { id: '1', name:"product 1", image: require('./../assets/product-img.jpeg'), price: '$1.00', discount: '-25%' },
//   { id: '2', name:"product 2", image: require('./../assets/product-img-2.jpeg'), price: '$1.00', discount: '-40%' },
//   { id: '3', name:"product 3", image: require('./../assets/product-img.jpeg'), price: '$1.00', discount: '-75%' },
//   { id: '4', name:"product 4", image: require('./../assets/product-img-2.jpeg'), price: '$1.00', discount: '-75%' },
// ];

// const promos = [
//   { id: '1', title: 'DISCOUNT EVERY DAY!', image: 'https://fastly.picsum.photos/id/866/620/326.jpg?hmac=zoDFLKDwBIECOcbMo9SqNnDpufyaxS7Jo65m1aibwlY' },
//   { id: '2', title: 'The Ordinary Serum Day', image: 'https://fastly.picsum.photos/id/866/620/326.jpg?hmac=zoDFLKDwBIECOcbMo9SqNnDpufyaxS7Jo65m1aibwlY', rating: 4.8, reviews: 645 },
// ];

// // export default function HomeScreen() {
// //   const [timer, setTimer] = useState(3600);

// //   useEffect(() => {
// //     const interval = setInterval(() => {
// //       setTimer((prev) => (prev > 0 ? prev - 1 : 0));
// //     }, 1000);
// //     return () => clearInterval(interval);
// //   }, []);

// //   const formatTime = (t) => {
// //     const h = String(Math.floor(t / 3600)).padStart(2, '0');
// //     const m = String(Math.floor((t % 3600) / 60)).padStart(2, '0');
// //     const s = String(t % 60).padStart(2, '0');
// //     return `${h}:${m}:${s}`;
// //   };

  

// //   return (
// //     <SafeAreaView style={styles.container}>
// //       {/* <ScrollView> */}
// //         {/* Search Bar */}
// //         <View style={styles.header}>
// //           <Icon name="menu" size={35} color="#fff" style={styles.icon} />
// //           <TextInput style={styles.searchInput} placeholder="Glue Prodcuts" />
// //           {/* <Icon name="camera-outline" size={22} color="#fff" style={styles.icon} /> */}
// //           <Icon name="cart-outline" size={22} color="#fff" style={styles.icon} />
// //           <Icon name="notifications-outline" size={22} color="#fff" style={styles.icon} />
// //         </View>

// //         {/* Categories */}
// //         <View style={styles.categories}>
// //           {categories.map((cat) => (
// //             <TouchableOpacity key={cat.id} style={styles.categoryItem}>
// //               <Icon name={cat.icon} size={26} color="#333" />
// //               <Text style={styles.categoryLabel}>{cat.label}</Text>
// //             </TouchableOpacity>
// //           ))}
// //         </View>

// //         {/* Hero Banner */}
// //         <View style={styles.carouselContainer}>
// //           <Swiper autoplay loop>
// //             {banners.map((item) => (
// //               <Image key={item.id} source={{ uri: item.image }} style={styles.banner} />
// //             ))}
// //           </Swiper>
// //         </View>

// //         {/* Flash Deals */}
// //         <View style={styles.sectionRow}>
// //           <Text style={styles.sectionTitle}>Top Products</Text>
// //           {/* <Text style={styles.countdown}>Ends in {formatTime(timer)}</Text> */}
// //         </View>
// //         <FlatList
// //           data={flashDeals}
// //           numColumns={2} // 👈 key change to make it 2 columns
// //           showsVerticalScrollIndicator={false}
// //           keyExtractor={(item) => item.id.toString()}
// //           contentContainerStyle={styles.flashList}
// //           renderItem={({ item }) => (
// //             <View style={styles.flashCard}>
// //               <Image source={{ uri: item.image }} style={styles.flashImage} />
// //               <Text style={styles.flashName}>{item.name}</Text>
// //               <Text style={styles.flashPrice}>{item.price}</Text>
// //               <Text style={styles.flashDiscount}>{item.discount}</Text>
// //             </View>
// //           )}
// //         />


// //         {/* Promos */}
// //         <View style={styles.promoRow}>
// //           {promos.map((item) => (
// //             <View key={item.id} style={styles.promoCard}>
// //               <Image source={{ uri: item.image }} style={styles.promoImage} />
// //               <Text style={styles.promoTitle}>{item.title}</Text>
// //               {item.rating && (
// //                 <Text style={styles.promoRating}>
// //                   ⭐ {item.rating} ({item.reviews})
// //                 </Text>
// //               )}
// //             </View>
// //           ))}
// //         </View>

// //         {/* Best products */}
// //         <View style={styles.sectionRow}>
// //           <Text style={styles.sectionTitle}>Best Products</Text>
// //           {/* <Text style={styles.countdown}>Ends in {formatTime(timer)}</Text> */}
// //         </View>
// //         <FlatList
// //           data={flashDeals}
// //           horizontal
// //           showsHorizontalScrollIndicator={false}
// //           keyExtractor={(item) => item.id}
// //           contentContainerStyle={styles.flashList}
// //           renderItem={({ item }) => (
// //             <View style={styles.flashCard}>
// //               <Image source={{ uri: item.image }} style={styles.flashImage} />
// //               <Text style={styles.flashName}>{item.name}</Text>
// //               <Text style={styles.flashPrice}>{item.price}</Text>
// //               <Text style={styles.flashDiscount}>{item.discount}</Text>
// //             </View>
// //           )}
// //         />


// //       {/* </ScrollView> */}
// //     </SafeAreaView>
// //   );
// // }

// export default function HomeScreen() {
//   const navigation = useNavigation(); 
//   const [timer, setTimer] = useState(3600);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setTimer((prev) => (prev > 0 ? prev - 1 : 0));
//     }, 2000);
//     return () => clearInterval(interval);
//   }, []);

//   const formatTime = (t) => {
//     const h = String(Math.floor(t / 3600)).padStart(2, '0');
//     const m = String(Math.floor((t % 3600) / 60)).padStart(2, '0');
//     const s = String(t % 60).padStart(2, '0');
//     return `${h}:${m}:${s}`;
//   };

//   const renderHeader = () => (
//     <View>
//       {/* Header */}
//       <View style={styles.header}>
//         {/* <Icon name="menu" size={35} color="#fff" style={styles.icon} onPress={() => navigation.openDrawer()} /> */}
//         <TextInput style={styles.searchInput} placeholder="Glue Products" />
//         <Icon name="cart-outline" size={22} color="#fff" style={styles.icon} />
//         <Icon name="notifications-outline" size={22} color="#fff" style={styles.icon} />
//       </View>

//       {/* Categories */}
//       <View style={styles.categories}>
//         {categories.map((cat) => (
//           <TouchableOpacity key={cat.id} style={styles.categoryItem}>
//             <Icon name={cat.icon} size={26} color="#333" />
//             <Text style={styles.categoryLabel}>{cat.label}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* Banner */}
//       <View style={styles.carouselContainer}>
//         <Swiper loop>
//           {banners.map((item) => (
//             <Image key={item.id} source={require('./../assets/hero-image.jpg')} style={styles.banner} />
//           ))}
//         </Swiper>
//       </View>

//       {/* Section Title */}
//       <View style={styles.sectionRow}>
//         <Text style={styles.sectionTitle}>Recommended products</Text>
//       </View>
//     </View>
//   );

//   const renderFooter = () => (
//     <View>
//       {/* Promos */}
//       <View style={styles.promoRow}>
//         {promos.map((item) => (
//           <View key={item.id} style={styles.promoCard}>
//             <Image source={ { uri: item.image } } style={styles.promoImage} />
//             <Text style={styles.promoTitle}>{item.title}</Text>
//             {item.rating && (
//               <Text style={styles.promoRating}>⭐ {item.rating} ({item.reviews})</Text>
//             )}
//           </View>
//         ))}
//       </View>

//       {/* Best Products */}
//       <View style={styles.sectionRow}>
//         <Text style={styles.sectionTitle}>Best Products</Text>
//       </View>
//       <FlatList
//         data={flashDeals}
//         numColumns={2}
//         keyExtractor={(item) => item.id}
//         contentContainerStyle={styles.flashList}
//         renderItem={({ item }) => (
//           <View style={styles.flashCard}>
//             <Image source={item.image} style={styles.flashImage} />
//             <Text style={styles.flashName}>{item.name}</Text>
//             <Text style={styles.flashPrice}>{item.price}</Text>
//             <Text style={styles.flashDiscount}>{item.discount}</Text>
//           </View>
//         )}
//       />
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <FlatList
//         data={flashDeals}
//         numColumns={2}
//         keyExtractor={(item) => item.id.toString()}
//         ListHeaderComponent={renderHeader}
//         // ListFooterComponent={renderFooter}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ paddingBottom: 80 }}
//         renderItem={({ item }) => (
//           <View style={styles.flashCard}>
//             <Image source={item.image } style={styles.flashImage} />
//             <Text style={styles.flashName}>{item.name}</Text>
//             <Text style={styles.flashPrice}>{item.price}</Text>
//             <Text style={styles.flashDiscount}>{item.discount}</Text>
//           </View>
//         )}
//       />
//     </SafeAreaView>
//   );
// }


// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#fff' },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#ff0000',
//     paddingHorizontal: 20,
//     paddingTop:70,
//     paddingBottom:70,
//   },
//   searchInput: {
//     flex: 1,
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     paddingHorizontal: 10,
//     marginRight: 10,
//     height:45,
//   },
//   icon: { marginHorizontal: 4 },
//   categories: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     paddingVertical: 16,
//     backgroundColor: '#ffffff',
//     marginHorizontal:20,
//     marginTop:-40,
//     borderRadius:16,
//     borderWidth:1,
//     borderStyle:"solid",
//     borderColor:"#f7f7f7",
//     shadowColor: "#999",
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.5,
//     shadowRadius: 16,
//     elevation: 10
//   },
//   categoryItem: { alignItems: 'center' },
//   categoryLabel: { fontSize: 12, marginTop: 4 },
//   carouselContainer: { height: 160, marginTop: 30, paddingLeft:20, paddingRight:20, },
//   banner: { width: '100%', height: 160, borderRadius: 10,  },
//   sectionRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingHorizontal: 16,
//     marginTop: 20,
//   },
//   sectionTitle: { fontSize: 18, fontWeight: 'bold' },
//   countdown: {
//     backgroundColor: '#000',
//     color: '#fff',
//     borderRadius: 4,
//     paddingHorizontal: 8,
//     fontSize: 12,
//   },
//   flashList: {
//     padding: 10,
//   },
//   flashCard: {
//     flex: 1,
//     margin: 8,
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     padding: 10,
//     alignItems: 'center',
//     elevation: 5, // for Android shadow
//     shadowColor: '#000', // for iOS shadow
//     shadowOpacity: 0.1,
//     shadowRadius: 10,
//   },
//   flashImage: {
//     width: '100%',
//     height: 120,
//     borderRadius: 8,
//     resizeMode: 'cover',
//   },
//   flashName: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     marginTop: 8,
//     textAlign: 'center',
//   },
//   flashPrice: {
//     fontSize: 13,
//     color: '#4CAF50',
//     marginTop: 4,
//   },
//   flashDiscount: {
//     fontSize: 12,
//     color: '#F44336',
//     marginTop: 2,
//   },
//   promoRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginTop: 20,
//     marginBottom: 30,
//   },
//   promoCard: { width: 160, alignItems: 'center' },
//   promoImage: { width: 150, height: 120, borderRadius: 8 },
//   promoTitle: { marginTop: 6, textAlign: 'center', fontWeight: '600' },
//   promoRating: { fontSize: 12, color: '#888' },
// });




import React from 'react';
import { SafeAreaView, FlatList, View, Text, StyleSheet, Image } from 'react-native';

import HeaderBar from './../components/HeaderBar';
import Categories from './../components/Categories';
import BannerCarousel from './../components/BannerCarousel';

const flashDeals = [
  { id: '1', name: "product 1", image: require('./../assets/product-img.jpeg'), price: '$1.00', discount: '-25%' },
  { id: '2', name: "product 2", image: require('./../assets/product-img-2.jpeg'), price: '$1.00', discount: '-40%' },
  { id: '3', name: "product 3", image: require('./../assets/product-img.jpeg'), price: '$1.00', discount: '-75%' },
  { id: '4', name: "product 4", image: require('./../assets/product-img-2.jpeg'), price: '$1.00', discount: '-75%' },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <FlatList
        data={flashDeals}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <>
            <HeaderBar />
            <Categories />
            <BannerCarousel />
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Recommended products</Text>
            </View>
          </>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={styles.flashCard}>
            <Image source={item.image} style={styles.flashImage} />
            <Text style={styles.flashName}>{item.name}</Text>
            <Text style={styles.flashPrice}>{item.price}</Text>
            <Text style={styles.flashDiscount}>{item.discount}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  flashCard: {
    flex: 1,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  flashImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  flashName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  flashPrice: {
    fontSize: 13,
    color: '#4CAF50',
    marginTop: 4,
  },
  flashDiscount: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 2,
  },
});
