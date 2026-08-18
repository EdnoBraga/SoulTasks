import { describe, expect, it } from 'vitest';
import { extractMentions, mentionSuggestions } from './mentions';

describe('mentions', () => {
  it('extrai integrantes mencionados sem duplicar nomes', () => {
    expect(extractMentions('Revisar com @Braga e @Pallus; avisar @Braga')).toEqual(['braga', 'pallus']);
  });

  it('sugere integrantes ao digitar o início de uma menção', () => {
    expect(mentionSuggestions('Enviar para @pa')).toEqual([{ id: 'pallus', name: 'Pallus' }]);
  });
});
