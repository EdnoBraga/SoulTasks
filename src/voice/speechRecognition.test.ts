import { describe, expect, it } from 'vitest';
import { appendSpeechTranscript } from './speechRecognition';

describe('appendSpeechTranscript', () => {
  it('mantém o texto digitado e acrescenta a transcrição ao vivo', () => {
    const event = { resultIndex: 0, results: [
      { isFinal: true, 0: { transcript: 'revisar o site' } },
      { isFinal: false, 0: { transcript: ' amanhã' } },
    ] };
    expect(appendSpeechTranscript('Tarefa: ', event)).toBe('Tarefa: revisar o site amanhã');
  });

  it('não altera o valor quando o navegador não entrega texto', () => {
    expect(appendSpeechTranscript('Texto existente', { resultIndex: 0, results: [] })).toBe('Texto existente');
  });
});
