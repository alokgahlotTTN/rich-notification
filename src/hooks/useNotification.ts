import messaging from '@react-native-firebase/messaging';
import { useEffect } from 'react';
import { PermissionsAndroid } from 'react-native';

const getNotificationPermission = async () => {
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );
  if (granted === PermissionsAndroid.RESULTS.GRANTED) {
    console.log('Permission granted');
  } else {
    console.log('Permission rejected');
  }
};

const getToken = async () => {
  try {
    const token = await messaging().getToken();
    console.log('FCM Token : ', token);
  } catch (err) {
    console.log('FCM Token ERROR : ', err);
  }
};

export const useNotication = () => {
  useEffect(() => {
    getNotificationPermission();
    getToken();
  }, []);
};
