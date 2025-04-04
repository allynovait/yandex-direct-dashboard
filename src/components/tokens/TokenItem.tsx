
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Trash2 } from "lucide-react";

interface TokenItemProps {
  token: string;
  status: {
    isConnected: boolean;
    isLoading: boolean;
    error?: string;
  };
  onRefresh: (token: string) => void;
  onRemove: (token: string) => void;
}

export const TokenItem = ({ token, status, onRefresh, onRemove }: TokenItemProps) => {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {status.isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : status.isConnected ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          <span className="font-mono">
            {token.slice(0, 8)}...{token.slice(-8)}
          </span>
        </div>
        {status.error && (
          <span className="text-xs text-red-500">
            {status.error}
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onRefresh(token)}
          disabled={status.isLoading}
          className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
        >
          {status.isLoading ? (
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
          onClick={() => onRemove(token)}
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
