/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const { getDefaultConfig } = require("metro-config");

module.exports = {
  transformer: {
    getTransformOptions: async () => {
      const {
        resolver: { sourceExts, assetExts }
      } = await getDefaultConfig();

      return {
        transform: {
          experimentalImportSupport: false,
          inlineRequires: false,
          resetCache: true
        },
        transformer: {
          babelTransformerPath: require.resolve("react-native-svg-transformer")
        },
        resolver: {
          assetExts: assetExts.filter(ext => ext !== "svg"),
          sourceExts: [...sourceExts, "svg"]
        }
      };
    }
  }
};
