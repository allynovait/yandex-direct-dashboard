
// Always use HTTPS for the API URL
const API_URL = 'https://allynovaittest.site:3000/api/yandex';

export interface TokenStatusResponse {
  isConnected: boolean;
  isLoading: boolean;
  error?: string;
}

export const checkTokenStatus = async (token: string): Promise<TokenStatusResponse> => {
  try {
    console.log(`Checking token ${token.slice(-8)} status with API: ${API_URL}/stats`);
    
    // Use the stats endpoint which is more reliable
    const response = await fetch(`${API_URL}/stats`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
        token, 
        dateRange: {
          from: new Date(new Date().setDate(new Date().getDate() - 7)),
          to: new Date()
        }
      })
    });
    
    const isConnected = response.ok;
    console.log(`Token ${token.slice(-8)} status:`, isConnected ? 'connected' : 'failed');
    
    let errorMessage: string | undefined;
    if (!isConnected) {
      try {
        const errorData = await response.text();
        console.error("API error response:", errorData);
        errorMessage = `Error: ${response.status} ${response.statusText}`;
      } catch (e) {
        errorMessage = 'Connection failed';
      }
    }
    
    return {
      isConnected,
      isLoading: false,
      error: errorMessage
    };
  } catch (error) {
    console.error(`Error checking token ${token.slice(-8)}:`, error);
    return {
      isConnected: false,
      isLoading: false,
      error: error instanceof Error ? error.message : 'Failed to connect'
    };
  }
};
