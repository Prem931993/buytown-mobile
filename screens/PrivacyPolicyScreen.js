import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function TermsAndConditionsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* 🔼 Topbar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Refund Policy</Text>

      </View>

      {/* 📃 Terms Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {terms.map((item, index) => (
          <Text key={index} style={styles.termItem}>
            {index + 1}. {item}
          </Text>
        ))}

        <Text style={styles.footer}>Last updated: June 29, 2025</Text>
      </ScrollView>
    </View>
  );
}

const terms = [
  'Goods once received cannot be returned or exchanged.',
  'Payment gateway process is applied for our application, so the payment will be received within 24 to 48 hours by the BuyTown team.',
  'We will be packing the materials in front of a CCTV camera with records, so missing items are not possible. The BuyTown delivery team will show the material at the delivery spot.',
  'For product damages or mismatches, contact us immediately via customer care or WhatsApp. This is BuyTown’s responsibility.',
  'We will refund the amount directly to the customer’s bank account within 48 hours if any material is damaged or the product is out of stock.',
  'We buy handles from the shop with wrapping covers. We cannot check the handles without unwrapping. If any damages are found, inform us—we will help with return or exchange.',
  'Exchange of handles is not possible if the handle is not available in the market. If the exact same handle is needed, we cannot guarantee the time period.',
  'Mica sheets and plywood are covered only under brand warranty. Our company is not responsible for it.',
  'Drawer wheels and hinges are made of MS material, so rust is a normal occurrence. Our company is not responsible for it.',
  'Mica sheets and colour laminations are fragile materials. BuyTown is not responsible for minor scratches or damages. You should check the material immediately upon receipt.',
];


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom:50,
  },
  header: {
    backgroundColor: '#eb1f2a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    paddingLeft:5
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconSpacing: {
    marginRight: 12,
  },
  content: {
    padding: 20,
    paddingBottom:30
  },
  termItem: {
    fontSize: 16,
    marginBottom: 12,
    lineHeight: 25,
    color: '#333',
  },
  footer: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 14,
    color: '#999',
  },
});
