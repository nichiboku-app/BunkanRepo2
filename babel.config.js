// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // (otros plugins que uses)
      'react-native-reanimated/plugin', // ← debe ser el último
    ],
  };
};
