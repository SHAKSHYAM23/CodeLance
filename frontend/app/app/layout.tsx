import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'CodeLance - Dashboard',
  description: 'AI-powered source code understanding dashboard',
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="flex flex-col h-screen bg-background text-foreground">
        {children}
      </div>
    </AuthProvider>
  );
}
