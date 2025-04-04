
import React from "react";

interface TokenListHeaderProps {
  title: string;
}

export const TokenListHeader = ({ title }: TokenListHeaderProps) => {
  return <h2 className="text-lg font-semibold">{title}</h2>;
};
