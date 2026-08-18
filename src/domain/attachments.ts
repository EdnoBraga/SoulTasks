export type CardAttachment = { id: string; name: string; type: string; size: number; dataUrl: string; createdAt: string };

export const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024;

export async function fileToAttachment(file: File, now = new Date()): Promise<CardAttachment> {
  if (file.size > MAX_ATTACHMENT_BYTES) throw new Error('O anexo deve ter no máximo 2 MB.');
  const dataUrl = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error('Não foi possível ler o anexo.')); reader.readAsDataURL(file); });
  return { id: crypto.randomUUID(), name: file.name, type: file.type || 'application/octet-stream', size: file.size, dataUrl, createdAt: now.toISOString() };
}

export function formatAttachmentSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
