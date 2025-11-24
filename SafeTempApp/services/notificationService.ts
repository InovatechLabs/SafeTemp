import * as Notifications from 'expo-notifications';

/**
 * @param title 
 * @param body 
 */
export const showLocalNotification = async (title: string, body: string) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        sound: true, 
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { type: 'backend_down_alarm' },
      },
      trigger: null,
    });
  } catch (error) {
    console.error('Falha ao agendar notificação de alarme de backend:', error);
  }
};