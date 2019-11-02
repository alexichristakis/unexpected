module.exports = {
  presets: ["module:metro-react-native-babel-preset"],
  plugins: [
    [
      "module-resolver",
      {
        root: ["./src"],
        extensions: [".tsx"],
        alias: {
          "@components": "./src/components",
          "@redux": "./src/redux",
          "@api": "./src/api",
          "@hooks": "./src/hooks"
        }
      }
    ]
  ]
};
