import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AdminShell } from '@/components/admin/admin-shell';

export const metadata: Metadata = { title: 'Site studio', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') redirect('/admin/login');
  return <AdminShell email={session.user.email ?? 'Administrator'}>{children}</AdminShell>;
}
