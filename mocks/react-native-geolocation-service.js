// Mock for react-native-geolocation-service
const mockGeolocation = {
  getCurrentPosition: (success, error) => {
    // Simulate location not available
    if (error) {
      error({ code: 1, message: 'Location not available in this environment' });
    }
  },
  requestAuthorization: () => Promise.resolve('denied'),
};

module.exports = {
  default: mockGeolocation,
};
