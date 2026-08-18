import { describe, expect, it } from 'vitest';
import { deleteMeetingMinute, minuteToHtml, saveMeetingMinute } from './meetingMinutes';

describe('meetingMinutes', () => {
  it('gera HTML resumido com participantes e decisões', () => {
    const html = minuteToHtml({ id: 'm1', title: 'Reunião de pauta', startedAt: '2026-08-17T10:00:00Z', endedAt: '2026-08-17T10:30:00Z', participants: ['Braga'], sections: [{ speaker: 'Braga', text: 'Definir a pauta da semana.' }], decisions: ['Publicar o calendário'], nextSteps: ['Pallus revisa o texto'] });
    expect(html).toContain('Braga'); expect(html).toContain('Publicar o calendário'); expect(html).not.toContain('<script>');
  });

  it('exclui uma ata pelo id e preserva as demais', () => {
    localStorage.clear();
    saveMeetingMinute({ id: 'remove', title: 'Excluir', startedAt: '2026-08-17T10:00:00Z', endedAt: '2026-08-17T10:30:00Z', participants: [], sections: [], decisions: [], nextSteps: [] });
    saveMeetingMinute({ id: 'keep', title: 'Manter', startedAt: '2026-08-17T11:00:00Z', endedAt: '2026-08-17T11:30:00Z', participants: [], sections: [], decisions: [], nextSteps: [] });
    expect(deleteMeetingMinute('remove').map((minute) => minute.id)).toEqual(['keep']);
  });
});
