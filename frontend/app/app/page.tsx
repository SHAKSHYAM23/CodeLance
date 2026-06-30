'use client';

import React, { useEffect, useState } from 'react';
import { useAuth }            from '@/lib/auth-context';
import { useRepositories }    from '@/hooks/use-repositories';
import { useChat }            from '@/hooks/use-chat';
import { Sidebar }            from '@/components/dashboard/sidebar';
import { ChatArea }           from '@/components/dashboard/chat-area';
import { AddRepositoryModal } from '@/components/dashboard/add-repository-modal';
import Link                   from 'next/link';

export default function DashboardPage() {

  // ── Auth ────────────────────────────────────────────
  const {
    user,
    isLoading:      authLoading,
    isAuthenticated
  } = useAuth()

  const {
    repos,
    loading: reposLoading,
    add:     addRepo,
  } = useRepositories()

  // ── Local state ─────────────────────────────────────
  const [activeRepoId, setActiveRepoId] = useState<string | null>(null)
  const [showAddRepo,  setShowAddRepo]  = useState(false)

  // ── Chat ────────────────────────────────────────────
  const {
    messages,
    isLoading:      chatLoading,
    historyLoading,
    send,
  } = useChat(activeRepoId)

  // Active repo object — derived from repos array
  const activeRepo = repos.find(r => r.id === activeRepoId) ?? null

  // ── Set first repo as active on load ────────────────
  useEffect(() => {
    if (repos && repos.length > 0 && !activeRepoId) {
      setActiveRepoId(repos[0]!.id)
    }
  }, [repos, activeRepoId])

  // ── Redirect if not authenticated ───────────────────
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/login'
    }
  }, [authLoading, isAuthenticated])

  // ── Loading screen ───────────────────────────────────
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: '#060a10' }}>
        <div className="text-center">
          <div
            className="w-8 h-8 border-2 rounded-full animate-spin mx-auto"
            style={{ borderColor: '#3b82f6', borderTopColor: 'transparent' }}
          />
          <p className="mt-4 text-sm" style={{ color: '#3a5a78' }}>Loading...</p>
        </div>
      </div>
    )
  }

  // ── Main layout ──────────────────────────────────────
  return (
    <div className="flex flex-1 h-screen overflow-hidden gap-4 p-4" style={{ background: '#060a10' }}>

      {/* Sidebar */}
      <Sidebar
        repositories={repos}
        activeRepoId={activeRepoId ?? undefined}
        onSelectRepo={setActiveRepoId}
        onAddRepo={() => setShowAddRepo(true)}
        isLoading={reposLoading}
        onDeleteRepo={(deletedId) => {
          if (activeRepoId === deletedId) {
             setActiveRepoId(null);
          }
          // The most reliable way to guarantee the UI updates instantly:
          window.location.reload();
        }}
      />

      {/* Main Content */}
      <div
        className="flex-1 flex flex-col rounded-xl overflow-hidden min-h-0"
        style={{ border: '1px solid rgba(59,130,246,0.12)', background: '#0a0f1a' }}
      >

        {/* Header — flex-shrink-0 ensures it never collapses or scrolls away */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid rgba(59,130,246,0.1)', background: '#060a10' }}
        >
          {/* Left: brand + active repo */}
          <div className="flex items-center gap-3 min-w-0">
            <span style={{ fontSize: '17px', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', flexShrink: 0 }}>
              Code<span style={{ color: '#3b82f6' }}>Atlas</span>
            </span>
            {activeRepo && (
              <>
                <span style={{ color: '#1e3050', fontSize: '14px' }}>/</span>
                <h1 className="text-sm font-medium truncate" style={{ color: '#9fb3c8' }}>
                  {activeRepo.name}
                </h1>
              </>
            )}
          </div>

          {/* Right: stats + user + logout */}
          <div className="flex items-center gap-5 shrink-0">
            {/* Repository Stats */}
            {activeRepo && (
              <div className="hidden md:flex items-center gap-5 text-sm">
                <div className="text-center">
                  <div className="font-semibold" style={{ color: '#c8d8f0' }}>
                    {activeRepo.totalFiles ?? 0}
                  </div>
                  <div className="text-xs" style={{ color: '#3a5a78' }}>Files</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold" style={{ color: '#c8d8f0' }}>
                    {activeRepo.totalChunks ?? 0}
                  </div>
                  <div className="text-xs" style={{ color: '#3a5a78' }}>Chunks</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold" style={{ color: '#c8d8f0' }}>
                    {messages?.length ?? 0}
                  </div>
                  <div className="text-xs" style={{ color: '#3a5a78' }}>Messages</div>
                </div>
              </div>
            )}

            {/* Divider */}
            {activeRepo && (
              <div className="hidden md:block h-8 w-px" style={{ background: 'rgba(59,130,246,0.12)' }} />
            )}

            {/* User identity block — avatar left, stacked name/email/signout right */}
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center font-bold shrink-0 text-sm"
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  boxShadow: '0 0 14px rgba(37,99,235,0.25)',
                }}
              >
                {user?.name?.substring(0, 1).toUpperCase() || 'U'}
              </div>

              <div className="hidden lg:flex flex-col gap-1 min-w-0">
                <div className="flex flex-col leading-tight min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: '#c8d8f0' }}>
                    {user?.name || 'User'}
                  </p>
                  <p className="text-[11px] truncate" style={{ color: '#3a5a78' }}>
                    {user?.email}
                  </p>
                </div>

                <Link
                  href="/logout"
                  className="self-start flex items-center gap-1 text-[11px] font-medium transition-colors"
                  style={{ color: '#3a5a78' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#f59e0b'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#3a5a78'; }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Sign Out
                </Link>
              </div>

              {/* Compact sign-out for smaller screens where name/email are hidden */}
              <Link
                href="/logout"
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors shrink-0"
                style={{ color: '#3a5a78', border: '1px solid rgba(59,130,246,0.15)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#f59e0b'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(245,158,11,0.3)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#3a5a78'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(59,130,246,0.15)'; }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign Out
              </Link>
            </div>
          </div>
        </div>

        {/* Chat Area — min-h-0 forces it to scroll internally, not grow the page */}
        <div className="flex-1 min-h-0">
          <ChatArea
            messages={messages}
            isLoading={chatLoading || historyLoading}
            isStreaming={false}
            onSendMessage={send}
            repoSummary={activeRepo?.summary ?? null}
            repoName={activeRepo?.name}
          />
        </div>
      </div>

      {/* Add Repository Modal */}
      {showAddRepo && (
        <AddRepositoryModal
          onClose={() => setShowAddRepo(false)}
          onAdd={async (url: string) => {
            await addRepo(url)
            setShowAddRepo(false)
          }}
        />
      )}

    </div>
  )
}