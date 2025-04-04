
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

  return (
    <div className="space-y-4 mb-8">
      <TokenListHeader title="Добавленные токены" />
      <div className="grid gap-4">
        {tokens.map((token) => (
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
  );
};
