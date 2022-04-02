global.__reanimatedWorkletInit = () => {};
jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);
