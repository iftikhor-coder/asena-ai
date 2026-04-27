'use client';

/**
 * ASENA AI — Portfolio Integration Button
 * ─────────────────────────────────────────
 * Portfolio saytiga (iftikhor.vercel.app) qo'shish uchun:
 *
 * 1. Bu faylni portfolio loyihasiga `components/AsenaAIButton.tsx` sifatida saqlang
 * 2. Layout yoki app/page.tsx ga import qiling:
 *    import AsenaAIButton from '@/components/AsenaAIButton'
 * 3. JSX ichiga qo'shing (barcha sahifalarda ko'rinadi):
 *    <AsenaAIButton />
 *
 * ASENA AI URL ni o'zingiznikiga o'zgartiring:
 */

import { useState, useEffect } from 'react';

const ASENA_AI_URL = 'https://asena-ai.vercel.app'; // ← o'zgartiring

export default function AsenaAIButton() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* ─── Floating button ─── */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '10px',
        }}
      >
        {/* Tooltip */}
        {showTooltip && (
          <div
            style={{
              background: 'rgba(12, 13, 23, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(124, 109, 248, 0.25)',
              borderRadius: '12px',
              padding: '8px 14px',
              fontSize: '12px',
              color: '#e2e4f0',
              whiteSpace: 'nowrap',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              animation: 'asena-fade-in 0.2s ease-out',
            }}
          >
            ✨ ASENA AI bilan suhbatlash
          </div>
        )}

        {/* Main button */}
        <button
          onClick={() => window.open(ASENA_AI_URL, '_blank', 'noopener,noreferrer')}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          aria-label="Open ASENA AI Chat"
          style={{
            position: 'relative',
            width: '56px',
            height: '56px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #7c6df8, #22d3ee)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(124, 109, 248, 0.35)',
            transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1), box-shadow 0.25s',
          }}
          onMouseDown={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.93)';
          }}
          onMouseUp={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)';
            setTimeout(() => {
              if (e.currentTarget) {
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
              }
            }, 150);
          }}
        >
          {/* Sparkle SVG */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
            <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
          </svg>

          {/* Ping ring */}
          <span
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #7c6df8, #22d3ee)',
              opacity: 0.3,
              animation: 'asena-ping 2s cubic-bezier(0,0,0.2,1) infinite',
            }}
          />
        </button>
      </div>

      {/* ─── Styles ─── */}
      <style>{`
        @keyframes asena-ping {
          75%, 100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes asena-fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
