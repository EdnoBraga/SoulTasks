import { describe, expect, it } from 'vitest';
import { fileToAttachment } from './attachments';

describe('attachments', () => {
  it('converte um arquivo selecionado em anexo persistível', async () => {
    const file = new File(['conteúdo'], 'brief.txt', { type: 'text/plain' });
    const attachment = await fileToAttachment(file, new Date('2026-08-18T12:00:00.000Z'));
    expect(attachment).toMatchObject({ name: 'brief.txt', type: 'text/plain', size: 9, dataUrl: 'data:text/plain;base64,Y29udGXDumRv' });
    expect(attachment.id).toBeTruthy();
  });
});
