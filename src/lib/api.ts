
import { Capacitor } from '@capacitor/core';
// import { Http } from '@capacitor/http'; // Temporarily remove to fix build

function getApiUrl() {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('atom_api_url');
}

export async function api(path: string, options: RequestInit = {}, overrideApiUrl?: string) {
  const apiUrl = overrideApiUrl !== undefined ? overrideApiUrl : getApiUrl();
  
  if (apiUrl === null) {
    throw new Error('API URL not configured.');
  }

  const finalUrl = apiUrl === '/' ? `http://localhost:9002${path}` : `${apiUrl}${path}`;
  
  // Use Capacitor HTTP if running on a native platform - Temporarily disabled
  if (Capacitor.isNativePlatform() && false) { // Set to false to disable
    // const capOptions = {
    //   url: finalUrl,
    //   method: options.method || 'GET',
    //   headers: {
    //     ...options.headers,
    //     'Content-Type': 'application/json',
    //   },
    //   ...(options.body && { data: JSON.parse(options.body as string) }),
    // };

    // const response = await Http.request(capOptions);
    
    // return {
    //   ok: response.status >= 200 && response.status < 300,
    //   status: response.status,
    //   json: async () => response.data,
    //   text: async () => JSON.stringify(response.data),
    //   get body() {
    //     const encoder = new TextEncoder();
    //     const readableStream = new ReadableStream({
    //       start(controller) {
    //         controller.enqueue(encoder.encode(JSON.stringify(response.data)));
    //         controller.close();
    //       },
    //     });
    //     return readableStream;
    //   },
    // };
  }

  // Fallback to fetch for web environment
  const webFinalUrl = apiUrl === '/' ? path : finalUrl;
  const response = await fetch(webFinalUrl, {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
    },
  });

  return response;
}
