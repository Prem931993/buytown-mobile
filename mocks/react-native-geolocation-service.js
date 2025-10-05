// Mock for react-native-geolocation-service
const mockGeolocation = {
  getCurrentPosition: (success, error) => {
    // Simulate a location in Gandhipuram, Coimbatore (pincode 641008) for development
    const mockPosition = {
      coords: {
        latitude: 11.0174,
        longitude: 76.9674,
        accuracy: 10,
        altitude: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    };
    if (success) {
      success(mockPosition);
    }
  },
  requestAuthorization: () => Promise.resolve('granted'),
};

module.exports = {
  default: mockGeolocation,
};
