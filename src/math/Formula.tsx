import React, { useMemo } from 'react';
import katex from 'katex';

interface FormulaProps {
  tex: string;
  displayMode?: boolean;
  className?: string;
}

export const Formula: React.FC<FormulaProps> = ({
  tex,
  displayMode = false,
  className = '',
}) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(tex, {
        displayMode,
        throwOnError: false,
      });
    } catch (e) {
      console.error('KaTeX rendering error:', e);
      return `<span class="text-rose-400 font-mono text-xs">${tex}</span>`;
    }
  }, [tex, displayMode]);

  if (displayMode) {
    return (
      <div
        className={`my-2 py-1 w-full overflow-x-auto overflow-y-hidden text-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={`inline align-baseline overflow-visible select-text ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
