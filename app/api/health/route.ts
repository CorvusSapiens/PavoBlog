import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/health — 健康检查，用于 Vercel / 监控 / 负载均衡器探活。
 * 最小 DB ping：能连上则 200 + { ok, db: 'ok' }，否则 503 + { ok: false, db: 'error' }。
 */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, db: 'ok' });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error('[health] db ping failed', message, e instanceof Error ? e.stack : '');
    return NextResponse.json(
      { ok: false, db: 'error', message },
      { status: 503 }
    );
  }
}
