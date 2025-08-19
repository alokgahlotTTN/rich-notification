import messaging from '@react-native-firebase/messaging';
import { useEffect, useState, useCallback } from 'react';
import { PermissionsAndroid, Platform, Alert } from 'react-native';

export const useNotification = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState(false);
  const [initialNotification, setInitialNotification] = useState(null);

  // Request notification permission
  const getNotificationPermission = async () => {
    try {
      let permissionGranted = false;

      if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
          permissionGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        } else {
          permissionGranted = true; // Auto-granted for Android < 13
        }
      } else {
        // iOS permission handling
        const authStatus = await messaging().requestPermission();
        permissionGranted =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      }

      if (permissionGranted) {
        console.log('Notification permission granted');
        setNotificationPermission(true);
        return true;
      } else {
        console.log('Notification permission rejected');
        setNotificationPermission(false);
        return false;
      }
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  };

  // Get FCM token
  const getToken = async () => {
    try {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      setFcmToken(token);
      return token;
    } catch (error) {
      console.error('FCM Token ERROR:', error);
      return null;
    }
  };

  // Handle foreground notifications
  const handleForegroundNotification = useCallback(remoteMessage => {
    console.log('Foreground notification received:', remoteMessage);

    // Show custom alert or in-app notification
    Alert.alert(
      remoteMessage.notification?.title || 'New Notification',
      remoteMessage.notification?.body || 'You have a new message',
      [
        {
          text: 'Dismiss',
          style: 'cancel',
        },
        {
          text: 'Open',
          onPress: () => handleNotificationPress(remoteMessage),
        },
      ],
    );
  }, []);

  // Handle notification press/tap
  const handleNotificationPress = useCallback(remoteMessage => {
    console.log('Notification pressed:', remoteMessage);

    // Handle navigation based on notification data
    const { data } = remoteMessage;

    if (data?.screen) {
      console.log('Navigate to screen:', data.screen);
      // Add your navigation logic here
      // Example: navigation.navigate(data.screen, { id: data.id });
    }

    if (data?.url) {
      console.log('Open URL:', data.url);
      // Handle URL opening
    }

    // Handle different notification types
    switch (data?.type) {
      case 'big_text':
        console.log('Handle big text notification');
        break;
      case 'big_picture':
        console.log('Handle big picture notification');
        break;
      case 'inbox':
        console.log('Handle inbox notification');
        break;
      case 'action_buttons':
        console.log('Handle action button notification');
        break;
      default:
        console.log('Handle default notification');
    }
  }, []);

  // Handle background notification press
  const handleBackgroundNotificationPress = useCallback(
    remoteMessage => {
      console.log('Background notification opened:', remoteMessage);
      handleNotificationPress(remoteMessage);
    },
    [handleNotificationPress],
  );

  // Handle notification when app is completely closed
  const handleInitialNotification = useCallback(async () => {
    try {
      const remoteMessage = await messaging().getInitialNotification();
      if (remoteMessage) {
        console.log('App opened from notification:', remoteMessage);
        setInitialNotification(remoteMessage);
        handleNotificationPress(remoteMessage);
      }
    } catch (error) {
      console.error('Error getting initial notification:', error);
    }
  }, [handleNotificationPress]);

  // Setup notification listeners
  const setupNotificationListeners = useCallback(() => {
    // Foreground message listener
    const unsubscribeForeground = messaging().onMessage(
      handleForegroundNotification,
    );

    // Background notification press listener
    const unsubscribeBackground = messaging().onNotificationOpenedApp(
      handleBackgroundNotificationPress,
    );

    // Token refresh listener
    const unsubscribeTokenRefresh = messaging().onTokenRefresh(token => {
      console.log('FCM token refreshed:', token);
      setFcmToken(token);
      // Send updated token to your server here
    });

    // Return cleanup function
    return () => {
      unsubscribeForeground();
      unsubscribeBackground();
      unsubscribeTokenRefresh();
    };
  }, [handleForegroundNotification, handleBackgroundNotificationPress]);

  // Send token to server
  const sendTokenToServer = useCallback(async token => {
    try {
      // Replace with your server endpoint
      const response = await fetch('YOUR_SERVER_ENDPOINT/fcm-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          platform: Platform.OS,
          userId: 'USER_ID_HERE', // Replace with actual user ID
        }),
      });

      if (response.ok) {
        console.log('Token sent to server successfully');
      } else {
        console.error('Failed to send token to server');
      }
    } catch (error) {
      console.error('Error sending token to server:', error);
    }
  }, []);

  // Subscribe to topic
  const subscribeToTopic = useCallback(async topic => {
    try {
      await messaging().subscribeToTopic(topic);
      console.log(`Subscribed to topic: ${topic}`);
      return true;
    } catch (error) {
      console.error(`Error subscribing to topic ${topic}:`, error);
      return false;
    }
  }, []);

  // Unsubscribe from topic
  const unsubscribeFromTopic = useCallback(async topic => {
    try {
      await messaging().unsubscribeFromTopic(topic);
      console.log(`Unsubscribed from topic: ${topic}`);
      return true;
    } catch (error) {
      console.error(`Error unsubscribing from topic ${topic}:`, error);
      return false;
    }
  }, []);

  // Delete token
  const deleteToken = useCallback(async () => {
    try {
      await messaging().deleteToken();
      console.log('FCM token deleted');
      setFcmToken(null);
      return true;
    } catch (error) {
      console.error('Error deleting FCM token:', error);
      return false;
    }
  }, []);

  // Main initialization effect
  useEffect(() => {
    const initializeNotifications = async () => {
      console.log('Initializing notifications...');

      // Request permission first
      const hasPermission = await getNotificationPermission();

      if (hasPermission) {
        // Get FCM token
        const token = await getToken();

        if (token) {
          // Send token to server (optional)
          // await sendTokenToServer(token);

          // Setup listeners
          const cleanup = setupNotificationListeners();

          // Handle initial notification
          await handleInitialNotification();

          return cleanup;
        }
      } else {
        console.warn('Notification permission not granted, skipping FCM setup');
      }
    };

    const cleanup = initializeNotifications();

    // Cleanup on unmount
    return () => {
      if (cleanup && typeof cleanup.then === 'function') {
        cleanup.then(cleanupFn => {
          if (typeof cleanupFn === 'function') {
            cleanupFn();
          }
        });
      }
    };
  }, []);

  return {
    // State
    fcmToken,
    notificationPermission,
    initialNotification,

    // Functions
    getNotificationPermission,
    getToken,
    sendTokenToServer,
    subscribeToTopic,
    unsubscribeFromTopic,
    deleteToken,
    handleNotificationPress,
  };
};
