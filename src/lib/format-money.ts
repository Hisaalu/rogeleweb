export function formatMoney(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(amount)) return '—'
  return Math.round(amount).toLocaleString('en-US')
}

export function formatMoneyUGX(amount: number | null | undefined): string {
  const n = formatMoney(amount)
  return n === '—' ? n : `UGX ${n}`
}