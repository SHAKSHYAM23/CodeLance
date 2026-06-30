'use client';

import { Repo } from '@/hooks/use-repositories';

interface RepositoryProgressBarProps {
  repo: Repo;
}

export function RepositoryProgressBar({ repo }: RepositoryProgressBarProps) {
  const percentage = repo.progress ?? 0;

  const barColor =
    repo.status === 'FAILED'
      ? '#ef4444'
      : repo.status === 'READY'
        ? '#10b981'
        : '#3b82f6';

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs" style={{ color: '#3a5a78' }}>
        <span>
          {repo.embeddedChunks}/{repo.totalChunks} chunks
        </span>
        <span style={{ fontWeight: 600, color: '#5a7a9a' }}>{Math.round(percentage)}%</span>
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: 'rgba(59,130,246,0.08)' }}
      >
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${percentage}%`, background: barColor }}
        />
      </div>
    </div>
  );
}
