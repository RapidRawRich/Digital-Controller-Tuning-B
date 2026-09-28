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

  return (
    <span
      className={`inline-block overflow-x-auto align-middle ${displayMode ? 'my-1 py-1 w-full text-center' : ''} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
