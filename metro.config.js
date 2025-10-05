// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Intercept module resolution to mock native modules
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-native-maps') {
    return {
      filePath: require.resolve('./mocks/react-native-maps.js'),
      type: 'sourceFile',
    };
  }
  if (moduleName === 'react-native-maps-directions') {
    return {
      filePath: require.resolve('./mocks/react-native-maps-directions.js'),
      type: 'sourceFile',
    };
  }

  // Fallback to default resolver
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
