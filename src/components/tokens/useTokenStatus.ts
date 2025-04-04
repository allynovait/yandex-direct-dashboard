
import { useState, useEffect } from "react";
import { checkTokenStatus, TokenStatusResponse } from "./TokenStatusService";

export interface TokenStatus {
  [key: string]: TokenStatusResponse;
}

export const useTokenStatus = (tokens: string[]) => {
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>({});

  useEffect(() => {
    if (tokens.length > 0) {
      // Reset token statuses for all tokens
      const newTokenStatus: TokenStatus = {};
      tokens.forEach((token: string) => {
        newTokenStatus[token] = { 
          isConnected: false, 
          isLoading: true,
          error: undefined
        };
      });
      
      setTokenStatus(newTokenStatus);
      checkTokensStatus(tokens);
    }
  }, [tokens]);

  const checkTokensStatus = async (tokenList: string[]) => {
    for (const token of tokenList) {
      const status = await checkTokenStatus(token);
      setTokenStatus(prev => ({ ...prev, [token]: status }));
    }
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

  return { tokenStatus, refreshTokenStatus };
};
