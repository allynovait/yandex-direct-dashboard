
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Use the same API URL construction as in yandexApi.ts
const API_BASE = 'allynovaittest.site:3000/api/yandex';
const API_URL = (window.location.protocol === 'https:' ? 'https://' : 'http://') + API_BASE;

interface TokenStatus {
  [key: string]: {
    isConnected: boolean;
    isLoading: boolean;
    error?: string;
  };
}

export const TokenList = () => {
  const [tokens, setTokens] = useState<string[]>([]);
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>({});
  const { toast } = useToast();

  useEffect(() => {
    loadTokens();
    
    // Add an event listener for localStorage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Also add a custom event listener for token updates
    window.addEventListener('tokensUpdated', loadTokens);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tokensUpdated', loadTokens);
    };
  }, []);
  
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'yandex_tokens') {
      loadTokens();
    }
  };
  
  const loadTokens = () => {
    const storedTokens = JSON.parse(localStorage.getItem("yandex_tokens") || "[]");
    setTokens(storedTokens);
    
    // Reset token statuses
    const newTokenStatus: TokenStatus = {};
    storedTokens.forEach((token: string) => {
      newTokenStatus[token] = { 
        isConnected: false, 
        isLoading: true,
        error: undefined
      };
    });
    
    setTokenStatus(newTokenStatus);
    
    if (storedTokens.length > 0) {
      checkTokensStatus(storedTokens);
    }
  };

  const checkTokensStatus = async (tokenList: string[]) => {
    for (const token of tokenList) {
      try {
        console.log(`Checking token ${token.slice(-8)} status with API: ${API_URL}/stats`);
        
        const newStatus = { isConnected: false, isLoading: true };
        setTokenStatus(prev => ({ ...prev, [token]: newStatus }));
        
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
        
        setTokenStatus(prev => ({ 
          ...prev, 
          [token]: {
            isConnected,
            isLoading: false,
            error: isConnected ? undefined : 'Connection failed'
          }
        }));
      } catch (error) {
        console.error(`Error checking token ${token.slice(-8)}:`, error);
        setTokenStatus(prev => ({ 
          ...prev, 
          [token]: {
            isConnected: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }));
      }
    }
  };

  const removeToken = (tokenToRemove: string) => {
    const updatedTokens = tokens.filter(token => token !== tokenToRemove);
    localStorage.setItem("yandex_tokens", JSON.stringify(updatedTokens));
    setTokens(updatedTokens);
    
    // Dispatch a custom event to notify other components
    window.dispatchEvent(new CustomEvent('tokensUpdated'));
    
    toast({
      title: "Токен удален",
      description: "Токен был успешно удален из списка",
    });
  };

  const refreshTokenStatus = (token: string) => {
    setTokenStatus(prev => ({ 
      ...prev, 
      [token]: {
        ...prev[token],
        isLoading: true,
        error: undefined
      }
    }));
    
    checkTokensStatus([token]);
  };

  if (tokens.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mb-8">
      <h2 className="text-lg font-semibold">Добавленные токены</h2>
      <div className="grid gap-4">
        {tokens.map((token) => (
          <div
            key={token}
            className="flex items-center justify-between p-4 rounded-lg border bg-card"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {tokenStatus[token]?.isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : tokenStatus[token]?.isConnected ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="font-mono">
                  {token.slice(0, 8)}...{token.slice(-8)}
                </span>
              </div>
              {tokenStatus[token]?.error && (
                <span className="text-xs text-red-500">
                  {tokenStatus[token].error}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => refreshTokenStatus(token)}
                disabled={tokenStatus[token]?.isLoading}
                className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
              >
                {tokenStatus[token]?.isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                    <path d="M21 3v5h-5"></path>
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                    <path d="M8 16H3v5"></path>
                  </svg>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeToken(token)}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
