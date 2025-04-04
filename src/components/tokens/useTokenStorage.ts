
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export const useTokenStorage = () => {
  const [tokens, setTokens] = useState<string[]>([]);
  const { toast } = useToast();

  const loadTokens = () => {
    const storedTokens = JSON.parse(localStorage.getItem("yandex_tokens") || "[]");
    setTokens(storedTokens);
    return storedTokens;
  };

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

  return { tokens, loadTokens, removeToken };
};
