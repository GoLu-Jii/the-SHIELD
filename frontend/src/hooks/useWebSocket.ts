import { useEffect, useRef, useCallback } from 'react';
import { useSpectraStore } from '../store/useSpectraStore';
import { dataProvider } from '../services/api';
import { WebSocketLike } from '../types';

export function useWebSocket(onAlertReceived?: (alert: any) => void) {
  const socketRef = useRef<WebSocketLike | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const retryCountRef = useRef(0);
  
  const prependAlert = useSpectraStore((s) => s.prependAlert);
  const setConnectionStatus = useSpectraStore((s) => s.setConnectionStatus);
  const simulatedOffline = useSpectraStore((s) => s.simulatedOffline);

  const connect = useCallback(() => {
    if (simulatedOffline) {
      setConnectionStatus('disconnected');
      return;
    }

    setConnectionStatus('connecting');

    try {
      const ws = dataProvider.createWebSocketConnection('/ws');
      socketRef.current = ws;

      ws.onopen = () => {
        setConnectionStatus('connected');
        retryCountRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const rawData = JSON.parse(event.data);
          // Handle both direct alert objects and wrapped { type: 'alert', data: alert } messages
          const alertObj = rawData.data || rawData;

          if (alertObj && (alertObj.flow_identifier || alertObj.threat_classification)) {
            prependAlert(alertObj);
            if (onAlertReceived) {
              onAlertReceived(alertObj);
            }
          }
        } catch (e) {
          console.error('[WebSocket] Error parsing incoming alert JSON:', e);
        }
      };

      ws.onerror = (_err) => {
        setConnectionStatus('error');
      };

      ws.onclose = () => {
        setConnectionStatus('disconnected');
        socketRef.current = null;

        // Exponential backoff reconnect strategy (1s, 2s, 4s, 8s, max 16s)
        const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 16000);
        retryCountRef.current++;

        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      };
    } catch (err) {
      console.error('[WebSocket] Failed to instantiate socket connection:', err);
      setConnectionStatus('error');
    }
  }, [prependAlert, setConnectionStatus, simulatedOffline, onAlertReceived]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [connect]);

  const reconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (socketRef.current) {
      socketRef.current.close();
    }
    retryCountRef.current = 0;
    connect();
  }, [connect]);

  return { reconnect };
}
