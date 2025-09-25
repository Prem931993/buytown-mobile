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

        <Text style={styles.headerTitle}>Terms & Conditions</Text>
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
  'Welcome To BuyTown.',
  'Goods Once Received Cannot be Returned Or Exchanged.',
  'If the delivery is cancelled for some unknown reason, a cancellation fee of 5% is applicable on your next purchase. (Compulsory)',
  'If goods are received with any damage, inform the BuyTown team within 60 minutes after delivery.',
  'Delivery charges may differ based on distance (kilometres).',
  'Minimum charge of Rs. 200 for delivery.',
  'Minimum order should be Rs. 1000 for delivery.',
  'If you want a GST bill, enter the GST number correctly. If any mistake happens after billing, it cannot be corrected.',
  'Mica sheets are sent at your own risk. We ensure they are in good condition till delivery. Damages post-delivery are not our responsibility.',
  'Machinery items are checked twice by the BuyTown team before delivery. Check upon delivery. If issues are found at that time, we are responsible. Later issues are not our responsibility.',
  'Machine warranty and service are the responsibility of the authorized shop only, not BuyTown.',
  'All products include GST.',
  'Delivery happens within 4 hours of the order, or may vary based on location and traffic.',
  'Charges may vary based on two-wheeler or four-wheeler delivery.',
  'We ensure that the BuyTown products you order are of high quality and trustworthy. We appreciate your support and promise to provide the best service.',
  'We only sell quality materials. Providing you with the best service is our top priority.',
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
