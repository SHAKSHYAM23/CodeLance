'use client';

import React from 'react';
import { Logo } from './Logo';

const LANGUAGES = [
  {
    name: 'TypeScript',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.1)',
    border: 'rgba(59,130,246,0.2)',
    icon: (
      <svg width="13" height="13" viewBox="0 0 400 400" fill="none">
        <rect width="400" height="400" rx="8" fill="#3178c6"/>
        <path d="M87.7 242.9v-21.3h97.5v21.3h-37.3V354H125v-111h-37.3zM206 354V221.6h23.6v53.2h52.8v-53.2H306V354h-23.6v-58.8h-52.8V354H206z" fill="white"/>
      </svg>
    ),
  },
  {
    name: 'JavaScript',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.18)',
    icon: (
      <svg width="13" height="13" viewBox="0 0 400 400" fill="none">
        <rect width="400" height="400" fill="#f0db4f"/>
        <path d="M67 60h267v267H67V60zm188.3 170.2c0-17.7-10.3-26.6-28.5-26.6-17.5 0-27.9 9.7-27.9 24.4 0 13.2 7.5 21.1 26.7 28.6 22.4 8.7 26.6 14.4 26.6 25.4 0 11.8-7.5 18.3-21.4 18.3-13.9 0-21.7-7.5-21.7-21.1v-3.7h-17.5v4.1c0 22.1 13.2 35.3 39.5 35.3 25.9 0 41-13.9 41-36.8 0-16.2-8.6-25.2-31.4-33.4-17.8-6.6-21.7-11.7-21.7-21.4 0-9.2 6.7-14.8 17.9-14.8 11.7 0 18.3 6.2 18.3 18.3v1.9h17.1v-2z" fill="#323330"/>
      </svg>
    ),
  },
  {
    name: 'Python',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.1)',
    border: 'rgba(59,130,246,0.2)',
    icon: (
      <svg width="13" height="13" viewBox="0 0 256 255" fill="none">
        <path d="M126.9 0C62.3 0 66.3 27.3 66.3 27.3l.1 28.3h61.7v8.5H41.6S0 59.2 0 124.4s37.4 63 37.4 63h22.3V159s-1.2-37.4 36.8-37.4h63.4s35.6.6 35.6-34.4V35.5S200.8 0 126.9 0zm-35.2 20.5a11.6 11.6 0 110 23.2 11.6 11.6 0 010-23.2z" fill="#4B8BBE"/>
        <path d="M129.1 254.8c64.6 0 60.6-27.3 60.6-27.3l-.1-28.3H128v-8.5h86.4s41.6 5 41.6-60.2-37.4-63-37.4-63h-22.3v28.4s1.2 37.4-36.8 37.4H96.1s-35.6-.6-35.6 34.4v57.6s-5.4 35.5 68.6 35.5zm35.2-20.5a11.6 11.6 0 110-23.2 11.6 11.6 0 010 23.2z" fill="#FFD43B"/>
      </svg>
    ),
  },
  {
    name: 'Go',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.18)',
    icon: (
      <svg width="13" height="13" viewBox="0 0 206 78" fill="none">
        <path d="M16 26.5c-.4 0-.5-.2-.3-.5l2.1-2.7c.2-.3.7-.5 1.1-.5h35.7c.4 0 .5.3.3.6l-1.7 2.6c-.2.3-.7.6-1 .6L16 26.5z" fill="#00ACD7"/>
        <path d="M1 35.2c-.4 0-.5-.2-.3-.5l2.1-2.7c.2-.3.7-.5 1.1-.5h45.6c.4 0 .6.3.5.6l-.8 2.4c-.1.4-.5.6-.9.6L1 35.2z" fill="#00ACD7"/>
        <path d="M25.4 43.9c-.4 0-.5-.3-.3-.6l1.4-2.5c.2-.3.6-.6 1-.6h20c.4 0 .6.3.6.7l-.2 2.4c0 .4-.4.7-.7.7l-21.8-.1z" fill="#00ACD7"/>
        <path d="M155.1 24.9c-6.3 1.6-10.6 2.8-16.8 4.4-1.5.4-1.6.5-2.9-1-1.5-1.7-2.6-2.8-4.7-3.8-6.3-3.1-12.4-2.2-18.1 1.5-6.8 4.4-10.3 10.9-10.2 19 .1 8 5.6 14.6 13.5 15.7 6.8.9 12.5-1.5 17-6.6.9-1.1 1.7-2.3 2.7-3.7H121c-2.1 0-2.6-1.3-1.9-3 1.3-3.1 3.7-8.3 5.1-10.9.3-.6 1-1.6 2.5-1.6h36.4c-.2 2.7-.2 5.4-.6 8.1-1.1 7.2-3.8 13.8-8.2 19.6-7.2 9.5-16.6 15.4-28.5 17-9.8 1.3-18.9-.6-26.9-6.6-7.4-5.6-11.6-13-12.7-22.2-1.3-10.9 1.9-20.7 8.5-29.3C101.7 9 111.4 3.2 123.3 1.1c9.8-1.7 19.3-.8 27.8 5.1 5.6 3.9 9.6 9.1 12.1 15.6.5.9.1 1.4-1.1 2.1h-7z" fill="#00ACD7"/>
        <path d="M186.2 68.3c-9.1-.2-17.4-2.8-24.4-8.8-5.9-5.1-9.6-11.6-10.8-19.3-1.8-11.3 1.3-21.3 8.1-30.1 7.3-9.6 16.1-14.6 28-16.7 10.2-1.8 19.8-.8 28.5 5.1 7.9 5.4 12.8 12.7 14.1 22.3 1.7 13.5-2.2 24.5-11.5 33.9-6.6 6.7-14.7 10.9-24 12.8-2.7.5-5.4.6-8 .8zm23.8-40.4c-.1-1.3-.1-2.3-.3-3.3-1.8-9.9-10.9-15.5-20.4-13.3-9.3 2.1-15.3 8-17.5 17.4-1.8 7.8 2 15.7 9.2 19 5.5 2.5 11 2.1 16.3-.6 7.9-4.1 12.2-10.5 12.7-19.2z" fill="#00ACD7"/>
      </svg>
    ),
  },
  {
    name: 'Java',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.1)',
    border: 'rgba(59,130,246,0.2)',
    icon: (
      <svg width="13" height="13" viewBox="0 0 48 48" fill="none">
        <path d="M20.2 19.9s-2 1.2.9 1.6c2.6.3 3.9.3 6.7-.3 0 0 .7.5 1.8 .9-6.5 2.8-14.7-.2-9.4-2.2zM19.3 16.7s-2.2 1.6 1.2 2c4.5.4 8-.4 10.9-1.1 0 0 .5.5 1.3.8-9.7 2.8-20.4.2-13.4-1.7z" fill="#f89820"/>
        <path d="M25.7 7c2.4 2.5-1 4.8-1 4.8s6-3.1 3.2-7c-2.6-3.6-4.6-5.4 6.2-11.5C34.1-6.7 19.9-2.8 25.7 7z" fill="#f89820"/>
        <path d="M35.6 27.1s1.5 1.2-1.6 2.2c-5.9 1.8-24.5 2.3-29.7.1-1.8-.8.7-1.9 1.6-2.1.4-.1.7-.1.7-.1-2.5-1.8-16.1 3.5-6.9 5 25 4 45.5-1.8 35.9-5.1zM21.4 23.4s-11.5 2.7-4.1 3.7c3.2.4 9.5.3 15.4-.2 4.8-.4 9.7-1.3 9.7-1.3s-1.7.7-2.9 1.5c-11.9 3.1-34.8 1.7-28.2-1.5 5.6-2.7 10.1-2.2 10.1-2.2zM32.1 37.7c12.1-6.3 6.5-12.3 2.6-11.5-.9.2-1.4.4-1.4.4s.4-.6 1.1-.8c8-2.8 14.2 8.3-2.5 12.7 0-.1.1-.1.2-.8z" fill="#f89820"/>
        <path d="M27 0s6.6 6.6-6.2 16.7c-10.3 8.1-2.3 12.8 0 18.1-6-5.4-10.4-10.2-7.5-14.6C17.4 13.6 29.6 10.5 27 0z" fill="#f89820"/>
        <path d="M22.4 48.2c11.6.7 29.4-.4 29.8-5.6 0 0-.8 2.1-9.6 3.7-9.9 1.8-22.2 1.6-29.5.4 0 0 1.5 1.2 9.3 1.5z" fill="#f89820"/>
      </svg>
    ),
  },
  {
    name: 'Rust',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.18)',
    icon: (
      <svg width="13" height="13" viewBox="0 0 106 106" fill="none">
        <path d="M53 3.6L6.4 28.8v48.4L53 102.4l46.6-25.2V28.8L53 3.6z" fill="#CE422B"/>
        <path d="M53 14l8 4.3-25 13.5-8-4.3L53 14zm25.5 13.8l8 4.3-8 4.3-8-4.3 8-4.3zM19.5 27.8l8 4.3-8 4.3-8-4.3 8-4.3zM53 28.3l8 4.3v8.6l-8 4.3-8-4.3v-8.6l8-4.3z" fill="white"/>
        <text x="26" y="72" font-size="36" font-weight="900" fill="white" font-family="monospace">Rs</text>
      </svg>
    ),
  },
];

const PIPELINE = [
  { label: 'ZIP Stream Fetch',              sub: 'Single HTTP request · no rate limit risk',               accent: '#3b82f6' },
  { label: 'BullMQ — Ingestion Queue',      sub: 'Parse → chunk → store with null embeddings',             accent: '#60a5fa' },
  { label: 'BullMQ — Embedding Queue',      sub: '3 parallel workers · respects Gemini free-tier limits',  accent: '#f59e0b' },
  { label: 'HNSW Vector Search',            sub: 'pgvector ANN · 3072-dim Gemini embeddings',              accent: '#3b82f6' },
  { label: 'PostgreSQL Full Text Search',   sub: 'websearch_to_tsquery · keyword precision',               accent: '#f59e0b' },
  { label: 'RRF Re-ranking',                sub: 'score = 1/(60+vRank) + 1/(60+kRank)',  isCode: true,     accent: '#60a5fa' },
  { label: 'Agentic AI Loop',               sub: 'Gemini · 4 tools · up to 5 iterations',                 accent: '#f59e0b' },
  { label: 'Cited Answer',                  sub: 'filename · line number · function name',                 accent: '#3b82f6' },
];

const DESC_POINTS = [
  { icon: '⬡', color: '#3b82f6', text: 'Get an instant AI-generated summary of any repository the moment it is indexed.' },
  { icon: '⬡', color: '#f59e0b', text: 'Ask architecture questions — why Postgres over MongoDB, why BullMQ over direct calls.' },
  { icon: '⬡', color: '#3b82f6', text: 'Trace any feature end-to-end across files with exact filename and line number citations.' },
  { icon: '⬡', color: '#f59e0b', text: 'Onboard into any codebase in minutes, not days.' },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden" style={{ background: '#060a10' }}>

      {/* Grid */}
      <div className="absolute inset-0" style={{
        backgroundImage: `linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)`,
        backgroundSize: '52px 52px',
      }} />

      {/* Blue glow top-left */}
      <div className="absolute" style={{
        top: '-80px', left: '-60px', width: '500px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(59,130,246,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Amber glow bottom-right */}
      <div className="absolute" style={{
        bottom: '-100px', right: '-60px', width: '450px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(245,158,11,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center justify-between gap-12 px-8 py-24">

        {/* ── LEFT ── */}
        <div style={{ maxWidth: '560px' }}>

          {/* Pill badge — all 3 terms with their own dot */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            border: '1px solid rgba(59,130,246,0.2)',
            background: 'rgba(6,14,30,0.9)',
            borderRadius: '999px', padding: '6px 16px', marginBottom: '20px',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block', animation: 'pulse 1.8s ease-in-out infinite' }} />
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: '#2a4060', textTransform: 'uppercase' }}>Agentic RAG</span>
            <span style={{ color: '#1a2a3a', fontSize: '10px', margin: '0 2px' }}>·</span>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} />
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: '#2a4060', textTransform: 'uppercase' }}>Hybrid Retrieval</span>
            <span style={{ color: '#1a2a3a', fontSize: '10px', margin: '0 2px' }}>·</span>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#60a5fa', display: 'inline-block' }} />
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: '#2a4060', textTransform: 'uppercase' }}>Architecture-Aware AI</span>
          </div>

          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', lineHeight: 1, gap: '8px' }}>
            <Logo size={56} />
            <span style={{ fontSize: '72px', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              Code
            </span>
            <span style={{ fontSize: '72px', fontWeight: 900, letterSpacing: '-0.03em', color: 'transparent', WebkitTextStroke: '2.5px #3b82f6', filter: 'drop-shadow(0 0 22px rgba(59,130,246,0.5))', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              Lance
            </span>
          </div>

          {/* Subheading */}
          <div style={{ marginTop: '14px', lineHeight: 1.25 }}>
            <span style={{ fontSize: '28px', fontWeight: 600, color: '#60a5fa' }}>Repository Intelligence</span>
            <span style={{ fontSize: '28px', fontWeight: 400, color: '#f59e0b' }}> for Modern Developers</span>
          </div>

          {/* Description — structured bullet points instead of plain paragraph */}
          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {DESC_POINTS.map((point, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  marginTop: '4px', flexShrink: 0,
                  width: '20px', height: '20px', borderRadius: '5px',
                  background: `${point.color}18`,
                  border: `1px solid ${point.color}35`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: point.color }} />
                </div>
                <span style={{ fontSize: '14px', lineHeight: 1.7, color: '#6b8aaa' }}>{point.text}</span>
              </div>
            ))}
          </div>

          
          <div style={{ marginTop: '20px', display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 14px', borderRadius: '8px', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)' }}>
            <div style={{ marginTop: '2px', width: '14px', height: '14px', borderRadius: '50%', border: '1.5px solid #3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#3b82f6' }} />
            </div>
            <span style={{ fontSize: '12px', color: '#4a6a8a', fontWeight: 500, lineHeight: 1.6 }}>
              Built without LangChain — engineered from scratch under real constraints: rate-limited APIs, free-tier Gemini, parallel BullMQ queues designed to stay within limits
            </span>
          </div>

          
          <div style={{ marginTop: '28px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <a href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 30px', borderRadius: '8px', fontSize: '14px', fontWeight: 700, color: '#ffffff', background: '#2563eb', boxShadow: '0 0 28px rgba(37,99,235,0.35), inset 0 1px 0 rgba(255,255,255,0.1)', textDecoration: 'none' }}>
              Get Started
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 6.5h9M7.5 2.5l4 4-4 4" />
              </svg>
            </a>
            <a 
              href="https://youtu.be/cjt8jW4rPQ4" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 28px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)', background: 'rgba(245,158,11,0.05)', textDecoration: 'none' }}
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor"><polygon points="2,1 11,5.5 2,10" /></svg>
              Watch Demo
            </a>
          </div>

          {/* Language badges with icons */}
          <div style={{ marginTop: '28px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: '#1e3040', textTransform: 'uppercase', marginBottom: '10px' }}>
              Parsed Languages
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {LANGUAGES.map((lang) => (
                <div key={lang.name} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, color: lang.color, background: lang.bg, border: `1px solid ${lang.border}` }}>
                  {lang.icon}
                  {lang.name}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── RIGHT — Pipeline card ── */}
        <div className="hidden xl:block" style={{ flexShrink: 0 }}>
          <div style={{ position: 'relative', width: '400px' }}>

            <div style={{ position: 'absolute', inset: '-24px', borderRadius: '32px', background: 'radial-gradient(ellipse, rgba(59,130,246,0.1) 0%, rgba(245,158,11,0.04) 60%, transparent 100%)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', borderRadius: '16px', border: '1px solid rgba(59,130,246,0.18)', background: 'rgba(5,10,22,0.94)', backdropFilter: 'blur(24px)', boxShadow: '0 40px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)', padding: '24px' }}>

              {/* Window controls + visible header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}>
                <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#febc2e' }} />
                <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#28c840' }} />
                <div style={{ marginLeft: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6' }} />
                  <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', color: '#4a7aaa', textTransform: 'uppercase' }}>
                    Architecture Pipeline
                  </span>
                </div>
              </div>

              {/* Steps */}
              <div>
                {PIPELINE.map((step, index) => (
                  <React.Fragment key={step.label}>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '8px', cursor: 'default', transition: 'background 0.15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = `${step.accent}10`; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                    >
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: step.accent, boxShadow: `0 0 8px ${step.accent}80`, flexShrink: 0 }} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#c8d8f0', lineHeight: 1.2 }}>{step.label}</div>
                        <div style={{ fontSize: '11px', color: (step as any).isCode ? step.accent : '#2a4060', marginTop: '2px', fontFamily: (step as any).isCode ? 'monospace' : 'inherit' }}>{step.sub}</div>
                      </div>
                      <span style={{ fontSize: '10px', color: '#132030', fontWeight: 700, flexShrink: 0 }}>{String(index + 1).padStart(2, '0')}</span>
                    </div>
                    {index < PIPELINE.length - 1 && (
                      <div style={{ marginLeft: '17px', height: '8px' }}>
                        <div style={{ width: '1px', height: '100%', background: `linear-gradient(to bottom, ${step.accent}30, ${PIPELINE[index + 1].accent}30)` }} />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Tech stack footer */}
              <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(59,130,246,0.08)', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {['Node.js', 'PostgreSQL', 'pgvector', 'BullMQ', 'Redis', 'Gemini API', 'Next.js', 'Docker'].map((tech, i) => (
                  <span key={tech} style={{ fontSize: '10px', fontWeight: 600, padding: '3px 8px', borderRadius: '4px', color: i % 2 === 0 ? '#1e4080' : '#5a3a0a', background: i % 2 === 0 ? 'rgba(30,64,128,0.2)' : 'rgba(90,58,10,0.2)', border: `1px solid ${i % 2 === 0 ? 'rgba(59,130,246,0.12)' : 'rgba(245,158,11,0.12)'}`, letterSpacing: '0.02em' }}>
                    {tech}
                  </span>
                ))}
              </div>

            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>

    </section>
  );
}
