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

// Download invoice
export const downloadInvoice = async (orderId, apiToken, accessTokens) => {
  try {
    const response = await axios.get(`${API_URL}/api/v1/orders/${orderId}/download-invoice`, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'X-User-Token': `Bearer ${accessTokens}`,
      },
      responseType: 'blob', // Assuming the response is a blob (e.g., PDF)
    });

    // Check HTTP status first
    if (response.status === 403) {
      throw new Error('You do not have permission to download this invoice.');
    } else if (response.status >= 400) {
      throw new Error('Invoice not available for this order. Please try again later.');
    }

    // Check if the response is a Blob
    if (response.data instanceof Blob) {
      // If it's JSON, read and parse to get error message
      if (response.data.type === 'application/json') {
        const text = await response.data.text();
        try {
          const json = JSON.parse(text);
          console.error("Server returned JSON error:", json);
          throw new Error(json.message || 'Invoice not available for this order. Please try again later.');
        } catch (parseError) {
          throw new Error('Invoice not available for this order. Please try again later.');
        }
      } else if (response.data.type === 'application/pdf' || response.data.size > 1000) {
        // Likely a PDF
        return response.data;
      } else {
        // Small blob, might be error - try to read as text
        const text = await response.data.text();
        try {
          const json = JSON.parse(text);
          console.error("Server returned JSON error:", json);
          throw new Error(json.message || 'Invoice not available for this order. Please try again later.');
        } catch (parseError) {
          // Not JSON, assume it's a PDF
          return response.data;
        }
      }
    } else {
      throw new Error('Invoice not available for this order. Please try again later.');
    }
  } catch (error) {
    console.error("Error downloading invoice:", error.response?.data || error.message);
    // If it's an axios error with status, use that
    if (error.response) {
      if (error.response.status === 403) {
        throw new Error('You do not have permission to download this invoice.');
      } else {
        throw new Error('Invoice not available for this order. Please try again later.');
      }
    }
    throw error;
  }
};
