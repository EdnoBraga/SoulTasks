import { describe, expect, it } from 'vitest';
import { minuteToHtml } from './meetingMinutes';

describe('meetingMinutes', () => {
  it('gera HTML resumido com participantes e decisões', () => {
    const html = minuteToHtml({ id: 'm1', title: 'Reunião de pauta', startedAt: '2026-08-17T10:00:00Z', endedAt: '2026-08-17T10:30:00Z', participants: ['Braga'], sections: [{ speaker: 'Braga', text: 'Definir a pauta da semana.' }], decisions: ['Publicar o calendário'], nextSteps: ['Pallus revisa o texto'] });
    expect(html).toContain('Braga'); expect(html).toContain('Publicar o calendário'); expect(html).not.toContain('<script>');
  });
});
