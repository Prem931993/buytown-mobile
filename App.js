import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useContext, useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppProvider, AppContext } from "./ContextAPI/ContextAPI";

// Screens
import AccountScreen from './screens/AccountScreen';
import CartScreen from './screens/CartScreen';
import CategoryScreen from './screens/CategoryScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';
import CheckoutScreen from './screens/CheckoutScreen';
import DeliveryConfirmationScreen from './screens/DeliveryConfirmationScreen';
import DeliveryProfileScreen from './screens/DeliveryProfileScreen';
import DeliverySuccessScreen from './screens/DeliverySuccessScreen';
import MyOrdersScreen from './screens/MyOrdersScreen';
import OrderDetailScreen from './screens/OrderDetailScreen';
import OrderSuccessScreen from './screens/OrderSuccessScreen';
import OrderProcessingScreen from './screens/OrderProcessingScreen';
import OrderFailureScreen from './screens/OrderFailureScreen';
import DeliveryDetailScreen from './screens/DeliveryDetailScreen';
import DeliveryListScreen from './screens/DeliveryListScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import NotificationScreen from './screens/NotificationScreen';
import PINScreen from './screens/PINScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';
import ProductDetailsScreen from './screens/ProductDetailsScreen';
import ProductListScreen from './screens/ProductListScreen';
import ProfileScreen from './screens/ProfileScreen';
import ResetPinScreen from './screens/ResetPINScreen';
import SetPinScreen from './screens/SetPinScreen';
import SubCategoryScreen from './screens/SubCategoryScreen';
import TermsScreen from './screens/TermsScreen';
import VariantScreen from './screens/VariantScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import MyWishlistScreen from './screens/MyWishlistScreen';
import CustomerSupportScreen from './screens/CustomerSupportScreen';
import AboutScreen from './screens/AboutScreen';
import RefundPolicyScreen from './screens/RefundPolicyScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const CategoryStack = createNativeStackNavigator();
const CartStack = createNativeStackNavigator();
const WishlistStack = createNativeStackNavigator();
const AccountStack = createNativeStackNavigator();
const MyAccountStack = createNativeStackNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="ProductDetailsScreen" component={ProductDetailsScreen} />
      <HomeStack.Screen name="ProductListScreen" component={ProductListScreen} />
    </HomeStack.Navigator>
  );
}

function CategoryStackScreen() {
  return (
    <CategoryStack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <CategoryStack.Screen name="CategoryMain" component={CategoryScreen} />
      <CategoryStack.Screen name="SubCategoryScreen" component={SubCategoryScreen} />
      <CategoryStack.Screen name="VariantScreen" component={VariantScreen} />
      <CategoryStack.Screen name="ProductListScreen" component={ProductListScreen} />
      <CategoryStack.Screen name="ProductDetailsScreen" component={ProductDetailsScreen} />
    </CategoryStack.Navigator>
  );
}

function CartStackScreen() {
  return (
    <CartStack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <CartStack.Screen name="CartMain" component={CartScreen} />
      <CartStack.Screen name="CheckoutScreen" component={CheckoutScreen} />
      <CartStack.Screen name="ProductDetailsScreen" component={ProductDetailsScreen} />
      <CartStack.Screen name="OrderSuccessScreen" component={OrderSuccessScreen} />
      <CartStack.Screen name="OrderProcessingScreen" component={OrderProcessingScreen} />
      <CartStack.Screen name="OrderFailureScreen" component={OrderFailureScreen} />
    </CartStack.Navigator>
  );
}

function WishlistStackScreen() {
  return (
    <WishlistStack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <WishlistStack.Screen name="WishlistMain" component={MyWishlistScreen} />
      <WishlistStack.Screen name="ProductDetailsScreen" component={ProductDetailsScreen} />
    </WishlistStack.Navigator>
  );
}

function AccountStackScreen() {
  return (
    <AccountStack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <AccountStack.Screen name="DeliveryList" component={DeliveryListScreen} />
      <AccountStack.Screen name="DeliveryDetail" component={DeliveryDetailScreen} />
      <AccountStack.Screen name="DeliveryConfirmation" component={DeliveryConfirmationScreen} />
      <AccountStack.Screen name="DeliveryProfileScreen" component={DeliveryProfileScreen} />
    </AccountStack.Navigator>
  );
}

function MyAccountStackScreen() {
  return (
    <MyAccountStack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <MyAccountStack.Screen name="AccountScreen" component={AccountScreen} />
      <MyAccountStack.Screen name="CustomerSupportScreen" component={CustomerSupportScreen} />
      <MyAccountStack.Screen name="MyOrdersScreen" component={MyOrdersScreen} />
      <MyAccountStack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} />
      <MyAccountStack.Screen name="OrderDetailScreen" component={OrderDetailScreen} />
      <MyAccountStack.Screen name="ProfileScreen" component={ProfileScreen} />
      <MyAccountStack.Screen name="RefundPolicy" component={RefundPolicyScreen} />
    </MyAccountStack.Navigator>
  );
}



// Tabs
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home-outline';
          else if (route.name === 'Wishlist') iconName = 'heart-outline';
          else if (route.name === 'Account') iconName = 'person-outline';
          else if (route.name === 'Category') iconName = 'grid-outline';
          else if (route.name === 'Cart') iconName = 'cart-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#F44336',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen
        name="Category"
        component={CategoryStackScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Category' }],
            });
          },
        })}
      />
      <Tab.Screen 
        name="Cart" 
        component={CartStackScreen} 
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Cart' }],
            });
          },
        })}
      />
      <Tab.Screen name="Wishlist" component={WishlistStackScreen} />
      <Tab.Screen 
        name="Account"
        component={MyAccountStackScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Account' }],
            });
          },
        })}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  // AsyncStorage.removeItem("isLoggedIn");
  //   useEffect(() => {
  //       const clearLogin = async () => {
  //         try {
  //           await AsyncStorage.setItem("isLoggedIn", "false");
  //         } catch (e) {
  //           console.error("Error removing isLoggedIn:", e);
  //         }
  //       };
    
  //       clearLogin();
  //     }, []);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const accessToken = await AsyncStorage.getItem("accessToken");
        if (accessToken) {
          const roleId = await AsyncStorage.getItem("roleId");
          if (roleId == 3) {
            setInitialRoute("DeliveryPage"); // 🚀 Go to delivery page for role 3
          } else {
            setInitialRoute("MainTabs"); // 🚀 Go to main app for other roles
          }
        } else {
          setInitialRoute("Welcome"); // 👋 Show welcome/login flow
        }
      } catch (e) {
        setInitialRoute("Welcome"); // fallback
      }
    };

    checkLogin();
  }, []);

  if (!initialRoute) {
    // Show a temporary splash/loading screen
    return null;
  }

  const LogoutModal = () => {
    const { logoutModalVisible, closeLogoutModal } = useContext(AppContext);
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={logoutModalVisible}
        onRequestClose={closeLogoutModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>You have been logged out successfully</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={closeLogoutModal}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
          {/* Auth Screens */}
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="Pin" component={PINScreen} />
          <Stack.Screen name="SetPin" component={SetPinScreen} />
          <Stack.Screen name="ResetPin" component={ResetPinScreen} />
          <Stack.Screen name="Terms" component={TermsScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          <Stack.Screen name="About" component={AboutScreen} />
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
         

          {/* Main App Screens with Tabs */}
          <Stack.Screen name="MainTabs" component={MainTabs} options={{ gestureEnabled: false }} />
          <Stack.Screen name="OrderSuccessScreen" component={OrderSuccessScreen} />
          <Stack.Screen name="OrderProcessingScreen" component={OrderProcessingScreen} />
          <Stack.Screen name="OrderFailureScreen" component={OrderFailureScreen} />
          <Stack.Screen name="DeliverySuccessScreen" component={DeliverySuccessScreen} />
          <Stack.Screen name="CategoryMain" component={CategoryScreen} />
          <Stack.Screen name="ProductListScreen" component={ProductListScreen} />
          <Stack.Screen name="DeliveryPage" component={AccountStackScreen} options={{ gestureEnabled: false }} />
          <Stack.Screen name="ProductDetailsScreen" component={ProductDetailsScreen} />
          <Stack.Screen name="RefundPolicy" component={RefundPolicyScreen} />

        </Stack.Navigator>
      </NavigationContainer>
      <LogoutModal />
      <Toast />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16,
  },
  modalButton: {
    backgroundColor: '#eb1f2a',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
