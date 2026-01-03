
import type { Device } from './types';

function getHaConfig() {
  if (typeof window === 'undefined') {
    return { baseUrl: null, token: null };
  }
  const baseUrl = localStorage.getItem('home_assistant_base_url');
  const token = localStorage.getItem('home_assistant_token');
  return { baseUrl, token };
}

async function makeHaApiRequest(path: string, options: RequestInit = {}) {
  const { baseUrl, token } = getHaConfig();
  if (!baseUrl || !token) {
    throw new Error('Home Assistant URL or Token not configured.');
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Home Assistant API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function getDevices(): Promise<Device[]> {
  const states = await makeHaApiRequest('/api/states');
  
  return states
    .map((entity: any): Device | null => {
      const entityId = entity.entity_id;
      const domain = entityId.split('.')[0];
      
      if (!['light', 'switch', 'sensor'].includes(domain)) {
        return null;
      }

      let deviceState: string | boolean | number = entity.state;

      // Convert 'on'/'off' to boolean for switches and lights
      if (domain === 'light' || domain === 'switch') {
        deviceState = entity.state === 'on';
      } 
      // For sensors, if state is a number, parse it
      else if (domain === 'sensor' && !isNaN(parseFloat(entity.state))) {
        deviceState = parseFloat(entity.state);
        // Add unit of measurement if available
        if (entity.attributes.unit_of_measurement) {
            deviceState = `${deviceState}${entity.attributes.unit_of_measurement}`;
        }
      }

      return {
        id: entityId,
        name: entity.attributes.friendly_name || entityId,
        type: domain as 'light' | 'switch' | 'sensor',
        state: deviceState,
      };
    })
    .filter((device: Device | null): device is Device => device !== null)
    .sort((a: Device, b: Device) => a.name.localeCompare(b.name));
}

export async function toggleDevice(deviceId: string): Promise<void> {
  const [domain] = deviceId.split('.');
  
  if (domain !== 'light' && domain !== 'switch') {
    console.warn(`Toggling not supported for domain: ${domain}`);
    return;
  }
  
  await makeHaApiRequest(`/api/services/${domain}/toggle`, {
    method: 'POST',
    body: JSON.stringify({ entity_id: deviceId }),
  });
}
