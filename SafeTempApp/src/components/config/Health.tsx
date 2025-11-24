import { useState, useEffect, useCallback, useRef } from 'react';
import { showLocalNotification } from '../../../services/notificationService';
import monitorApi from '../../../services/monitorApi';

const HEALTH_CHECK_ENDPOINT = '/alerts/health'; 

const POLLING_INTERVAL_MS = 1000;
const MAX_FAILURES_BEFORE_ALARM = 2;

export const useBackendMonitor = () => {
  const [isBackendOnline, setIsBackendOnline] = useState(true);
  const consecutiveFailures = useRef(0);
  const isAlarmTriggered = useRef(false);

  const triggerAlarmNotification = useCallback(() => {
    if (isAlarmTriggered.current) return;
    
    isAlarmTriggered.current = true;
    setIsBackendOnline(false);

    showLocalNotification(
      '🚨 SERVIDOR INDISPONÍVEL!',
      `O servidor parou de responder. O monitoramento foi interrompido.`,
    );
    console.warn('>>> ALARME DE BACKEND DISPARADO <<<');
  }, []);


  const checkBackendStatus = useCallback(async () => {
    try {
      await monitorApi.get(HEALTH_CHECK_ENDPOINT, { timeout: 10000 }); 
      
      if (!isBackendOnline) {
        setIsBackendOnline(true);
        isAlarmTriggered.current = false; 
      }
      consecutiveFailures.current = 0; 
      
    } catch (error) {
  
      consecutiveFailures.current += 1;
      
      if (consecutiveFailures.current >= MAX_FAILURES_BEFORE_ALARM && !isAlarmTriggered.current) {
        triggerAlarmNotification();
      }
    }
  }, [isBackendOnline, triggerAlarmNotification]);

  useEffect(() => {
    
    checkBackendStatus(); 
    const intervalId = setInterval(checkBackendStatus, POLLING_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [checkBackendStatus]);

  return { isBackendOnline };
};