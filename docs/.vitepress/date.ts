// frontmatter.date 的统一解析：缺失、为空或写错时返回 null，调用方据此跳过，
// 避免 new Date(undefined).toISOString() 在构建（SSR）阶段抛 RangeError。
export function parseDate(raw: unknown): Date | null {
  if (raw == null || raw === '') return null
  const d = new Date(raw as string | number | Date)
  return isNaN(+d) ? null : d
}
