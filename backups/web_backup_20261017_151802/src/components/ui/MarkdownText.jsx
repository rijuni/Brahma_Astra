import React from 'react';
import { CodeBlock } from './CodeBlock';

/**
 * Lightweight, safe Markdown renderer for chat messages.
 * Handles:
 * - Code fences (```lang ... ```)
 * - Headers (#, ##, ###)
 * - Lists (*, -, 1.)
 * - Inline formatting (**bold**, *italic*, `code`)
 * - Paragraphs
 */
export function MarkdownText({ content }) {
  if (!content) return null;

  // Split into chunks by code fences: ```lang\ncode\n```
  const parts = [];
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex, match.index)
      });
    }
    parts.push({
      type: 'code',
      language: match[1] || 'text',
      content: match[2].replace(/\n$/, '')
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.slice(lastIndex)
    });
  }

  return (
    <div className="markdown-content" style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-primary)' }}>
      {parts.map((part, index) => {
        if (part.type === 'code') {
          return <CodeBlock key={index} code={part.content} language={part.language} />;
        }
        return <TextChunk key={index} text={part.content} />;
      })}
    </div>
  );
}

function TextChunk({ text }) {
  const paragraphs = text.split(/\n\n+/);

  return (
    <>
      {paragraphs.map((para, pIdx) => {
        const trimmed = para.trim();
        if (!trimmed) return null;

        // Heading 3
        if (trimmed.startsWith('### ')) {
          return (
            <h3
              key={pIdx}
              style={{
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--brahma-gold)',
                margin: '14px 0 6px 0'
              }}
            >
              {renderInline(trimmed.slice(4))}
            </h3>
          );
        }
        // Heading 2
        if (trimmed.startsWith('## ')) {
          return (
            <h2
              key={pIdx}
              style={{
                fontSize: '17px',
                fontWeight: 600,
                color: 'var(--brahma-gold)',
                margin: '16px 0 8px 0'
              }}
            >
              {renderInline(trimmed.slice(3))}
            </h2>
          );
        }
        // Heading 1
        if (trimmed.startsWith('# ')) {
          return (
            <h1
              key={pIdx}
              style={{
                fontSize: '19px',
                fontWeight: 700,
                color: 'var(--brahma-gold)',
                margin: '18px 0 10px 0'
              }}
            >
              {renderInline(trimmed.slice(2))}
            </h1>
          );
        }

        // Bullet lists
        const lines = para.split('\n');
        const isBulletList = lines.every(l => !l.trim() || l.trim().startsWith('- ') || l.trim().startsWith('* '));
        if (isBulletList && lines.some(l => l.trim().startsWith('- ') || l.trim().startsWith('* '))) {
          return (
            <ul key={pIdx} style={{ margin: '8px 0 10px 20px', padding: 0 }}>
              {lines.map((line, lIdx) => {
                const item = line.trim();
                if (!item) return null;
                const bulletText = item.replace(/^[-*]\s+/, '');
                return (
                  <li key={lIdx} style={{ marginBottom: '4px', color: 'var(--text-secondary)' }}>
                    {renderInline(bulletText)}
                  </li>
                );
              })}
            </ul>
          );
        }

        // Numbered lists
        const isNumList = lines.every(l => !l.trim() || /^\d+\.\s+/.test(l.trim()));
        if (isNumList && lines.some(l => /^\d+\.\s+/.test(l.trim()))) {
          return (
            <ol key={pIdx} style={{ margin: '8px 0 10px 20px', padding: 0 }}>
              {lines.map((line, lIdx) => {
                const item = line.trim();
                if (!item) return null;
                const numText = item.replace(/^\d+\.\s+/, '');
                return (
                  <li key={lIdx} style={{ marginBottom: '4px', color: 'var(--text-secondary)' }}>
                    {renderInline(numText)}
                  </li>
                );
              })}
            </ol>
          );
        }

        // Standard paragraph
        return (
          <p key={pIdx} style={{ margin: '6px 0', wordBreak: 'break-word' }}>
            {lines.map((line, lIdx) => (
              <React.Fragment key={lIdx}>
                {renderInline(line)}
                {lIdx < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </>
  );
}

/**
 * Parses inline elements: `inline code`, **bold**, *italic*
 */
function renderInline(text) {
  if (!text) return text;

  // Split by inline code: `code`
  const codeParts = text.split(/(`[^`]+`)/g);

  return codeParts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={i}
          style={{
            backgroundColor: 'rgba(139, 92, 246, 0.15)',
            color: 'var(--brahma-violet-light)',
            padding: '2px 6px',
            borderRadius: 'var(--radius-xs)',
            fontSize: '12px',
            fontFamily: 'var(--font-code)'
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Bold formatting: **bold**
    const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((bPart, j) => {
      if (bPart.startsWith('**') && bPart.endsWith('**') && bPart.length > 4) {
        return (
          <strong key={`${i}-${j}`} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            {bPart.slice(2, -2)}
          </strong>
        );
      }

      // Italic formatting: *italic*
      const italicParts = bPart.split(/(\*[^*]+\*)/g);
      return italicParts.map((itPart, k) => {
        if (itPart.startsWith('*') && itPart.endsWith('*') && itPart.length > 2) {
          return (
            <em key={`${i}-${j}-${k}`} style={{ color: 'var(--text-secondary)' }}>
              {itPart.slice(1, -1)}
            </em>
          );
        }
        return itPart;
      });
    });
  });
}
