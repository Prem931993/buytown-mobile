import axios from "axios";

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/auth/generate-token`; // replace with your token endpoint

export const getBearerToken = async () => {
  try {
    const response = await axios.post(API_URL, {
      client_id: "buytownapiuser",
      client_secret: "wixu@T6Dust4",
    });

    // Save token if needed
    const token = response.data.apiToken;
    
    return token;
  } catch (error) {
    console.error("Error fetching token:", error.response?.data || error.message);
    throw error;
  }
};
