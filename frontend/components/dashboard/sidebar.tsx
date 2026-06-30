'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Repo } from '@/hooks/use-repositories';
import { REPO_STATUS_LABELS } from '@/lib/constants';
import { RepositoryProgressBar } from './repository-progress-bar';
import RepoCardMenu from './repo-card-menu';

interface SidebarProps {
  repositories: Repo[];
  activeRepoId?: string;
  onSelectRepo: (repoId: string) => void;
  onAddRepo: () => void;
  onDeleteRepo: (repoId: string) => void;
  isLoading?: boolean;
}

export function Sidebar({
  repositories,
  activeRepoId,
  onSelectRepo,
  onAddRepo,
  onDeleteRepo,
  isLoading = false,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`flex flex-col transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}
      style={{
        background: '#060a10',
        borderRight: '1px solid rgba(59,130,246,0.12)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-4"
        style={{ borderBottom: '1px solid rgba(59,130,246,0.1)' }}
      >
        {!isCollapsed && (
          <h2 className="font-semibold truncate" style={{ fontSize: '13px', letterSpacing: '0.05em', color: '#5a7a9a', textTransform: 'uppercase' }}>
            Repositories
          </h2>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md transition-colors"
          style={{ color: '#3a5a78' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(59,130,246,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#60a5fa'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#3a5a78'; }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isCollapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'} />
          </svg>
        </button>
      </div>

      {/* Add Repository Button */}
      {!isCollapsed && (
        <button
          onClick={onAddRepo}
          className="mx-4 mt-4 mb-2 px-3 py-2.5 rounded-lg font-semibold text-sm transition-all"
          style={{
            background: '#2563eb',
            color: '#ffffff',
            boxShadow: '0 0 16px rgba(37,99,235,0.25)',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#3b82f6'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#2563eb'; }}
        >
          + Add Repository
        </button>
      )}

      {/* Repositories List */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        {isLoading ? (
          <div className="p-4 space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 rounded-lg animate-pulse" style={{ background: 'rgba(59,130,246,0.05)' }} />
            ))}
          </div>
        ) : repositories.length === 0 ? (
          <div className="p-6 text-center" style={{ color: '#3a5a78' }}>
            <p className="text-sm font-medium">No repositories yet</p>
            <p className="text-xs mt-1.5" style={{ color: '#2a4560' }}>Add one to get started</p>
          </div>
        ) : (
          <div className="p-3 space-y-1.5">
            {repositories.map((repo, index) => {
              const isActive = activeRepoId === repo.id;
              return (
                <div // <--- FIXED: Changed from button to div
                  key={repo.id}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === 'Space') {
                      e.preventDefault();
                      onSelectRepo(repo.id);
                    }
                  }}
                  onClick={() => onSelectRepo(repo.id)}
                  className="w-full text-left rounded-lg transition-all group relative cursor-pointer"
                  style={{
                    padding: isCollapsed ? '8px' : '12px',
                    background: isActive ? 'rgba(59,130,246,0.08)' : 'transparent',
                    border: isActive ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)';
                  }}
                  onMouseLeave={e => {
                    if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                  }}
                >
                  {isCollapsed ? (
                    <div
                      className="w-8 h-8 flex items-center justify-center rounded-md text-xs font-bold"
                      style={{
                        background: isActive ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.06)',
                        color: isActive ? '#60a5fa' : '#3b82f6',
                      }}
                      title={repo.name}
                    >
                      {repo.name.substring(0, 2).toUpperCase()}
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                          <div
                            className="flex items-center justify-center rounded-md shrink-0"
                            style={{
                              width: '26px',
                              height: '26px',
                              background: isActive ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.06)',
                              color: isActive ? '#60a5fa' : '#3b82f6',
                              fontSize: '10px',
                              fontWeight: 700,
                            }}
                          >
                            {repo.name.substring(0, 2).toUpperCase()}
                          </div>
                          <h3
                            className="font-medium truncate text-sm flex-1"
                            style={{ color: isActive ? '#e2eaf5' : '#9fb3c8' }}
                          >
                            {repo.name}
                          </h3>
                          <span style={{ fontSize: '10px', color: '#2a4560', fontWeight: 600, flexShrink: 0 }}>
                            {String(index + 1).padStart(2, '0')}
                          </span>
                        </div>

                        <RepoCardMenu 
                          documentId={repo.id} 
                          onDeleteSuccess={onDeleteRepo} 
                        />
                      </div>

                      <RepositoryProgressBar repo={repo as any} />
                      <p className="text-xs mt-1.5" style={{ color: '#3a5a78' }}>
                        {REPO_STATUS_LABELS[repo.status] || repo.status}
                      </p>
                    </>
                  )}
                </div> // <--- FIXED: Closing div
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4" style={{ borderTop: '1px solid rgba(59,130,246,0.1)' }}>
          <Link
            href="/logout"
            className="flex items-center gap-2 text-xs font-medium transition-colors"
            style={{ color: '#3a5a78' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#f59e0b'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#3a5a78'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </Link>
        </div>
      )}
    </aside>
  );
}