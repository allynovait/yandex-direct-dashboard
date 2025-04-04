
import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

interface TokenListHeaderProps {
  title: string;
}

export const TokenListHeader = ({ title }: TokenListHeaderProps) => {
  const isConnected = title.includes("Подключенные");
  
  return (
    <h2 className="text-lg font-semibold flex items-center gap-2">
      {isConnected ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-red-500" />
      )}
      {title}
    </h2>
  );
};
