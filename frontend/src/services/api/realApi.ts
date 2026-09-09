import { Alert, DataProviderInterface, HealthResponse, StatsResponse, WebSocketLike } from '../../types';
import { API_CONFIG } from './config';

/**
 * Real API Implementation for SPECTRA Backend
 * 
 * Uses native fetch() and WebSocket against the FastAPI backend defined in API_CONFIG.
 */
export class RealDataProvider implements DataProviderInterface {
  private baseUrl: string;
  private wsUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.HTTP_BASE_URL;
    this.wsUrl = API_CONFIG.WS_BASE_URL;
  }

  async getHealth(): Promise<HealthResponse> {
    const res = await fetch(`${this.baseUrl}/health`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  }

  async getStats(): Promise<StatsResponse> {
    const res = await fetch(`${this.baseUrl}/stats`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  }

  async getAlerts(): Promise<Alert[]> {
    const res = await fetch(`${this.baseUrl}/alerts`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  }

  async getAlertById(id: string): Promise<Alert | null> {
    const res = await fetch(`${this.baseUrl}/alerts/${encodeURIComponent(id)}`);
    if (res.status === 404) {
      return null; // Handled 404: alert not found
    }
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  }

  createWebSocketConnection(urlSuffix = '/ws'): WebSocketLike {
    const fullWsUrl = `${this.wsUrl}${urlSuffix}`;
    const ws = new WebSocket(fullWsUrl);
    return ws as unknown as WebSocketLike;
  }
}
