const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Add aliases for web to mock native modules
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native-maps': require.resolve('../mocks/react-native-maps.js'),
    'react-native-maps-directions': require.resolve('../mocks/react-native-maps-directions.js'),
    'react-native-geolocation-service': require.resolve('../mocks/react-native-geolocation-service.js'),
  };

  return config;
};
