/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';

import {
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { useNotification } from './src/hooks/useNotification';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  const {
    fcmToken,
    notificationPermission,
    initialNotification,
    getToken,
    subscribeToTopic,
    unsubscribeFromTopic,
    sendTokenToServer,
  } = useNotification();

  const handleSubscribeToTopic = async () => {
    const success = await subscribeToTopic('news_updates');
    Alert.alert(
      'Topic Subscription',
      success ? 'Subscribed to news updates' : 'Failed to subscribe',
    );
  };

  const handleGetToken = async () => {
    const token = await getToken();
    if (token) {
      Alert.alert('FCM Token', token, [
        { text: 'Copy', onPress: () => console.log('Token copied:', token) },
      ]);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Text style={{ fontSize: 18, marginBottom: 20, textAlign: 'center' }}>
        Notification Demo App
      </Text>

      {/* Permission Status */}
      <View style={{ marginBottom: 20 }}>
        <Text>
          Permission Status:{' '}
          {notificationPermission ? '✅ Granted' : '❌ Denied'}
        </Text>
        <Text>FCM Token: {fcmToken ? '✅ Available' : '❌ Not Available'}</Text>
      </View>

      {/* Action Buttons */}
      <TouchableOpacity style={styles.button} onPress={handleGetToken}>
        <Text style={styles.buttonText}>Get FCM Token</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleSubscribeToTopic}>
        <Text style={styles.buttonText}>Subscribe to News</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => unsubscribeFromTopic('news_updates')}
      >
        <Text style={styles.buttonText}>Unsubscribe from News</Text>
      </TouchableOpacity>

      {/* Initial Notification Info */}
      {initialNotification && (
        <View
          style={{ marginTop: 20, padding: 10, backgroundColor: '#f0f0f0' }}
        >
          <Text style={{ fontWeight: 'bold' }}>
            App opened from notification:
          </Text>
          <Text>Title: {initialNotification?.notification?.title}</Text>
          <Text>Body: {initialNotification?.notification?.body}</Text>
        </View>
      )}
    </View>
    // <View style={styles.container}>
    //   <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
    //   <NewAppScreen templateFileName="App.tsx" />
    // </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;
