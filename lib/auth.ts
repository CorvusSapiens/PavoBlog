/**
 * 鉴权占位：V1 空实现，后续可接入 session/cookie 等。
 * 在需要保护的 layout 或 action 中调用 requireAdmin()。
 */
export async function requireAdmin(): Promise<void> {
  // V1 本地跑通，不做鉴权
  // 后续示例：const session = await getSession(); if (!session?.isAdmin) redirect('/login');
}
