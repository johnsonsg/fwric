import 'server-only';
import { auth } from '@/auth';

export async function requireAdmin(request?: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') return null;
  if (request && request.headers.get('origin') !== new URL(request.url).origin) return null;
  return session;
}
