async function proxy<T>(path: string, init: RequestInit = {}): Promise<T> {
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
  const data = text ? JSON.parse(text) : null

  if (!res.ok) {
    throw new Error(data?.error?.message ?? 'Request failed')
  }

  return data as T
}

interface PresignResponse {
  upload_url: string
  file_key: string
  public_url: string
  expires_in: number
}

export interface UploadedFile {
  fileKey: string
  publicUrl: string
  fileName: string
  fileType: string
  fileSize: number
}

export async function uploadFile(
  file: File,
  prefix: string,
  onProgress?: (percent: number) => void,
): Promise<UploadedFile> {
  const presign = await proxy<PresignResponse>('/uploads/presign', {
    method: 'POST',
    body: JSON.stringify({
      file_name: file.name,
      content_type: file.type,
      size: file.size,
      prefix,
    }),
  })

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', presign.upload_url)
    xhr.setRequestHeader('Content-Type', file.type)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else reject(new Error(`Upload failed with status ${xhr.status}`))
    }
    xhr.onerror = () => reject(new Error('Upload failed'))
    xhr.send(file)
  })

  return {
    fileKey: presign.file_key,
    publicUrl: presign.public_url,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
  }
}