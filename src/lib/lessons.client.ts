async function proxyFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api/proxy${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  })
  if (res.status === 204) return undefined as T

  const text = await res.text()
  const ct = res.headers.get('content-type') ?? ''
  const isJson = ct.includes('application/json')

  let data: unknown = null
  if (text) {
    if (isJson) {
      try {
        data = JSON.parse(text)
      } catch {
        data = null
      }
    } else {
      data = { error: { message: text } }
    }
  }

  if (!res.ok) {
    const message =
      (data as { error?: { message?: string } })?.error?.message ??
      `Request failed with status ${res.status}`
    throw new Error(message)
  }
  return data as T
}

export async function toggleLessonBookmarkClient(
  lessonId: number,
): Promise<{ bookmarked: boolean }> {
  return proxyFetch<{ bookmarked: boolean }>(`/lessons/${lessonId}/bookmark`, {
    method: 'POST',
  })
}

export async function getBookmarkCountClient(): Promise<number> {
  try {
    const res = await proxyFetch<unknown>('/lessons/bookmarks')
    if (Array.isArray(res)) return res.length
    const r = (res ?? {}) as { data?: unknown[]; value?: unknown[] }
    if (Array.isArray(r.data)) return r.data.length
    if (Array.isArray(r.value)) return r.value.length
    return 0
  } catch {
    return 0
  }
}