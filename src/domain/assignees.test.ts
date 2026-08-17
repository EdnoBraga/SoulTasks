import { describe, expect, it } from 'vitest';
import { toggleAssignee } from './assignees';

describe('toggleAssignee', () => {
  it('permite selecionar um, dois ou os três responsáveis', () => {
    expect(toggleAssignee([], 'braga')).toEqual(['braga']);
    expect(toggleAssignee(['braga'], 'pallus')).toEqual(['braga', 'pallus']);
    expect(toggleAssignee(['braga', 'pallus'], 'kayo')).toEqual(['braga', 'pallus', 'kayo']);
  });

  it('remove somente o responsável selecionado ao tocar novamente', () => {
    expect(toggleAssignee(['braga', 'pallus', 'kayo'], 'pallus')).toEqual(['braga', 'kayo']);
  });
});
