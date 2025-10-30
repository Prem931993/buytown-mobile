// AppContext.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import { getBearerToken } from "./../auth/authServices";
import axios from "axios";

export const AppContext = createContext();

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/general-settings`;

export const AppProvider = ({ children }) => {
  const [apiToken, setapiToken] = useState(null);
  const [accessTokens, setAccessTokens] = useState(null);
  const [otp, setOtp] = useState(null);
  const [otpCode, setOtpCode] = useState(null);
  const [cart, setCart] = useState({ product_id: null, quantity: 0 });
  const [loadingTokens, setLoadingTokens] = useState(true); // 👈 added
  const [generalSettings, setGeneralSettings] = useState([])

  const [cartRefresh, setCartRefresh] = useState(false)

  let refreshPromise = null;

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const tokken = await AsyncStorage.getItem("apiToken");
        const accessToken = await AsyncStorage.getItem("accessToken");
        if (accessToken) setAccessTokens(accessToken);

        if (!tokken) {
          // if no Token, generate new one
          const token = await getBearerToken();
          await AsyncStorage.setItem("apiToken", token);
          setapiToken(token);
        } else {
          setapiToken(tokken);
        }
      } catch (e) {
        console.log("Token error:", e);
      } finally {
        setLoadingTokens(false); // 👈 mark tokens loaded
      }
    };

    fetchToken();
  }, []);

  const onGenerateToken = async (force) => {
    if (force) {
      if (refreshPromise) {
        return refreshPromise;
      }
      refreshPromise = (async () => {
        try {
          const token = await getBearerToken();
          await AsyncStorage.setItem("apiToken", token);
          setapiToken(token);
        } catch (e) {
          console.log("Regenerate token error:", e);
        } finally {
          refreshPromise = null;
        }
      })();
      return refreshPromise;
    }
  };

  const onOTP = (data) => setOtp(data);
  const onOTPCode = (code) => setOtpCode(code);

  // Cart functions
  // const addToCart = (product) => {
  //   setCart((prevCart) => {
  //     const existingItem = prevCart.find((item) => item.id === product.id);
  //     if (existingItem) {
  //       return prevCart.map((item) =>
  //         item.id === product.id
  //           ? { ...item, quantity: item.quantity + 1 }
  //           : item
  //       );
  //     } else {
  //       return [...prevCart, { ...product, quantity: 1 }];
  //     }
  //   });
  // };

  const addToCart = (product) => {
    setCart((prevCart) => {
      // If same product -> increase quantity
      if (prevCart.product_id === product) {
        return {
          ...prevCart,
          quantity: prevCart.quantity + 1,
        };
      }

      // If new product -> replace with new object
      return {
        product_id: product,
        quantity: 1,
      };
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const decreaseQuantity = () => {
    setCart((prevCart) => {
      if (prevCart.product_id === product) {
        if (prevCart.quantity > 1) {
          return { ...prevCart, quantity: prevCart.quantity - 1 };
        }
      }
      return prevCart; // do nothing if already 1
    });
  };
  

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const getTotal = (data) => {
    return data;
  };

  const setAccessTokenState = (token) => {
    setAccessTokens(token);
  };

  useEffect(()=> {
  }, [cart]);

  const onRefereshCart = (data) => {
    setCartRefresh(data);
  }

  const logout = async (navigation) => {
    try {
      // Get all keys from AsyncStorage
      const keys = await AsyncStorage.getAllKeys();

      // Clear all data except apiToken (global bearer token) and Identity (phone number)
      const keysToRemove = keys.filter(key =>
        key !== 'apiToken' && key !== 'Identity'
      );

      await AsyncStorage.multiRemove(keysToRemove);

      // Reset context state
      setOtp(null);
      setOtpCode(null);
      setCart({ product_id: null, quantity: 0 });
      setCartRefresh(false);
      setAccessTokens(null);

      // Show success message in modal instead of alert
      setLogoutModalVisible(true);

      // Navigate to welcome screen and reset navigation stack
      if (navigation) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Welcome' }],
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const closeLogoutModal = () => {
    setLogoutModalVisible(false);
  };

  useEffect(()=> {
    const fetchGeneralSettings = async() => {
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
        if(response.status === 200) {
          setGeneralSettings(response.data.data)
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
      fetchGeneralSettings()
    }
      
    
  }, [apiToken, accessTokens])

  return (
    <AppContext.Provider
      value={{
        apiToken,
        accessTokens,
        onGenerateToken,
        onOTP,
        otp,
        onOTPCode,
        otpCode,
        cart,
        // addToCart,
        removeFromCart,
        updateQuantity,
        decreaseQuantity,
        getTotal,
        loadingTokens, // 👈 expose this
        setAccessTokenState,
        onRefereshCart,
        cartRefresh,
        logout,
        logoutModalVisible,
        closeLogoutModal,
        generalSettings
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
