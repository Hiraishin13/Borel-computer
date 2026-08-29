import { apiClient } from './api-client'

/** Envoie des fichiers images vers /api/admin/upload et renvoie leurs URLs publiques. */
export async function uploadImages(files: File[]): Promise<string[]> {
  const form = new FormData()
  files.forEach((f) => form.append('files', f))
  const { data } = await apiClient.post<{ urls: string[] }>('/admin/upload', form)
  return data.urls
}
