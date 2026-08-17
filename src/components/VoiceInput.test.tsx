import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import VoiceInput from './VoiceInput';

describe('VoiceInput', () => {
  it('explica quando o navegador não oferece transcrição por voz', () => {
    render(<VoiceInput value="" onChange={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: /usar microfone/i }));
    expect(screen.getByRole('status').textContent).toMatch(/não está disponível/i);
  });
});
