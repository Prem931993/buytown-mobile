import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppProvider } from "./ContextAPI/ContextAPI";

// Screens
import CartScreen from './screens/CartScreen';
import CategoryScreen from './screens/CategoryScreen';
import CheckoutScreen from './screens/CheckoutScreen';
import DeliveryConfirmationScreen from './screens/DeliveryConfirmationScreen';
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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const CategoryStack = createNativeStackNavigator();
const CartStack = createNativeStackNavigator();
const WishlistStack = createNativeStackNavigator();
const AccountStack = createNativeStackNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
    </HomeStack.Navigator>
  );
}

function CategoryStackScreen() {
  return (
    <CategoryStack.Navigator screenOptions={{ headerShown: false }}>
      <CategoryStack.Screen name="CategoryMain" component={CategoryScreen} />
      <CategoryStack.Screen name="SubCategoryScreen" component={SubCategoryScreen} />
      <CategoryStack.Screen name="VariantScreen" component={VariantScreen} />
      <CategoryStack.Screen name="ProductDetailsScreen" component={ProductDetailsScreen} />
      <CategoryStack.Screen name="ProductListScreen" component={ProductListScreen} />
    </CategoryStack.Navigator>
  );
}

function CartStackScreen() {
  return (
    <CartStack.Navigator screenOptions={{ headerShown: false }}>
      <CartStack.Screen name="CartMain" component={CartScreen} />
      <CartStack.Screen name="CheckoutScreen" component={CheckoutScreen} />
    </CartStack.Navigator>
  );
}

function WishlistStackScreen() {
  return (
    <WishlistStack.Navigator screenOptions={{ headerShown: false }}>
      <WishlistStack.Screen name="WishlistMain" component={NotificationScreen} />
    </WishlistStack.Navigator>
  );
}

function AccountStackScreen() {
  return (
    <AccountStack.Navigator screenOptions={{ headerShown: false }}>
      <AccountStack.Screen name="DeliveryList" component={DeliveryListScreen} />
      <AccountStack.Screen name="DeliveryDetail" component={DeliveryDetailScreen} />
      <AccountStack.Screen name="DeliveryConfirmation" component={DeliveryConfirmationScreen} />
    </AccountStack.Navigator>
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
      <Tab.Screen name="Category" component={CategoryStackScreen} />
      <Tab.Screen name="Cart" component={CartStackScreen} />
      <Tab.Screen name="Wishlist" component={WishlistStackScreen} />
      <Tab.Screen name="Account" component={ProfileScreen} />
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
  //           console.log("isLoggedIn removed successfully!");
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
          setInitialRoute("MainTabs"); // 🚀 Go to main app
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
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} />

          {/* Main App Screens with Tabs */}
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="ProductDetailsScreen" component={ProductDetailsScreen} />
          <Stack.Screen name="ProductListScreen" component={ProductListScreen} />
          <Stack.Screen name="DeliveryPage" component={AccountStackScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </AppProvider>
  );
}
