
import { TokenItem } from "./tokens/TokenItem";
import { TokenListHeader } from "./tokens/TokenListHeader";
import { useTokenStorage } from "./tokens/useTokenStorage";
import { useTokenStatus } from "./tokens/useTokenStatus";

export const TokenList = () => {
  const { tokens, removeToken } = useTokenStorage();
  const { tokenStatus, refreshTokenStatus } = useTokenStatus(tokens);

  if (tokens.length === 0) {
    return null;
  }

  // Group tokens by connection status
  const connectedTokens = tokens.filter(token => tokenStatus[token]?.isConnected);
  const disconnectedTokens = tokens.filter(token => !tokenStatus[token]?.isConnected);

  return (
    <div className="space-y-6 mb-8">
      {connectedTokens.length > 0 && (
        <div className="space-y-4">
          <TokenListHeader title="Подключенные токены" />
          <div className="grid gap-4">
            {connectedTokens.map((token) => (
              <TokenItem
                key={token}
                token={token}
                status={tokenStatus[token] || { isConnected: false, isLoading: true }}
                onRefresh={refreshTokenStatus}
                onRemove={removeToken}
              />
            ))}
          </div>
        </div>
      )}
      
      {disconnectedTokens.length > 0 && (
        <div className="space-y-4">
          <TokenListHeader title="Отключенные токены" />
          <div className="grid gap-4">
            {disconnectedTokens.map((token) => (
              <TokenItem
                key={token}
                token={token}
                status={tokenStatus[token] || { isConnected: false, isLoading: true }}
                onRefresh={refreshTokenStatus}
                onRemove={removeToken}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
