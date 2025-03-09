module.exports = ({ config }) => {
  return {
    ...config,
    // Ensure we're not requiring tensorflow-react-native during build
    plugins: [
      [
        "expo-camera",
        {
          "cameraPermission": "Allow Mölkky Assist AI to access your camera to analyze pin positions."
        }
      ]
    ],
    // Add any additional configuration overrides here
    android: {
      ...config.android,
      package: "com.yourcompany.molkkyassistai"
    }
  };
};
