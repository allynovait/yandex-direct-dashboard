
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Use the same API URL as in yandexApi.ts
const API_URL = 'http://allynovaittest.site:3000/api/yandex';

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
    const storedTokens = JSON.parse(localStorage.getItem("yandex_tokens") || "[]");
    setTokens(storedTokens);
    checkTokensStatus(storedTokens);
  }, []);

  const checkTokensStatus = async (tokenList: string[]) => {
    const newStatus: TokenStatus = {};
    
    for (const token of tokenList) {
      newStatus[token] = { isConnected: false, isLoading: true };
      setTokenStatus(prev => ({ ...prev, ...newStatus }));
      
      try {
        console.log(`Checking token ${token.slice(-8)} status with API...`);
        const response = await fetch(`${API_URL}/accounts`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });
        
        newStatus[token] = {
          isConnected: response.ok,
          isLoading: false,
        };
        console.log(`Token ${token.slice(-8)} status:`, response.ok ? 'connected' : 'failed');
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
