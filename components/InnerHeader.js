import React from 'react';
import {
  View,
  StyleSheet,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function InnerHeader() {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      <Icon onPress={() => navigation.goBack()} name="arrow-back-outline" size={24} color="#fff" />
      <View style={styles.logoContainer}>
        <Image source={require('./../assets/logo.png')} style={styles.logo} />
      </View>
      <View style={{width: 24}} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#F44336',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal:20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 40,
    resizeMode: 'contain',
  },
});
