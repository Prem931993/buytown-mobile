import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Create Cashfree payment order
export const createCashfreeOrder = async (orderData, apiToken, accessTokens) => {
  try {
    const response = await axios.post(`${API_URL}/api/v1/payments/cashfree/order`, orderData, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'X-User-Token': `Bearer ${accessTokens}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating Cashfree order:", error.response?.data || error.message);
    throw error;
  }
};



// Get payment details
export const getPaymentDetails = async (orderId, apiToken, accessTokens) => {
  try {
    const response = await axios.get(`${API_URL}/api/v1/payments/cashfree/verify/${orderId}`, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'X-User-Token': `Bearer ${accessTokens}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error getting payment details:", error.response?.data || error.message);
    throw error;
  }
};

// Refund payment
export const refundCashfreePayment = async (orderId, refundData, apiToken, accessTokens) => {
  try {
    const response = await axios.post(`${API_URL}/api/v1/payments/cashfree/refund/${orderId}`, refundData, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'X-User-Token': `Bearer ${accessTokens}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error refunding payment:", error.response?.data || error.message);
    throw error;
  }
};

// Create UPI QR session
export const createUPIQRSession = async (paymentSessionId) => {
  try {
    const response = await axios.post('https://sandbox.cashfree.com/pg/orders/sessions', {
      payment_session_id: paymentSessionId,
      payment_method: {
        upi: {
          channel: "qrcode"
        }
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error creating UPI QR session:", error.response?.data || error.message);
    throw error;
  }
};

// Create UPI link session
export const createUPILinkSession = async (paymentSessionId) => {
  try {
    const response = await axios.post('https://sandbox.cashfree.com/pg/orders/sessions', {
      payment_session_id: paymentSessionId,
      payment_method: {
        upi: {
          channel: "link"
        }
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error creating UPI link session:", error.response?.data || error.message);
    throw error;
  }
};

// Get order details
export const getOrderDetails = async (orderId, apiToken, accessTokens) => {
  try {
    const response = await axios.get(`${API_URL}/api/v1/orders/details/${orderId}`, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'X-User-Token': `Bearer ${accessTokens}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error getting order details:", error.response?.data || error.message);
    throw error;
  }
};
