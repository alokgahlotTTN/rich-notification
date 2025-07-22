/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';

import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { useNotication } from './src/hooks/useNotification';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useNotication();

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NewAppScreen templateFileName="App.tsx" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
