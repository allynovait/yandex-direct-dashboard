
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
    if (storedTokens.length > 0) {
      checkTokensStatus(storedTokens);
    }
  };

  const checkTokensStatus = async (tokenList: string[]) => {
    const newStatus: TokenStatus = {};
    
    for (const token of tokenList) {
      // Initialize token status
      newStatus[token] = { isConnected: false, isLoading: true };
      setTokenStatus(prev => ({ ...prev, ...newStatus }));
      
      try {
        console.log(`Checking token ${token.slice(-8)} status with API: ${API_URL}/accounts`);
        const response = await fetch(`${API_URL}/accounts`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });
        
        const isConnected = response.ok;
        console.log(`Token ${token.slice(-8)} status:`, isConnected ? 'connected' : 'failed');
        
        newStatus[token] = {
          isConnected,
          isLoading: false,
        };
      } catch (error) {
        console.error(`Error checking token ${token.slice(-8)}:`, error);
        newStatus[token] = {
          isConnected: false,
          isLoading: false,
        };
      }
      
      setTokenStatus(prev => ({ ...prev, ...newStatus }));
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
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeToken(token)}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
