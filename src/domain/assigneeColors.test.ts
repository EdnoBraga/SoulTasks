import { describe, expect, it } from 'vitest';
import { getAssigneeColors } from './assignees';

describe('cores dos responsáveis', () => {
  it('mantém as cores definidas para Braga, Pallus e Kayo', () => {
    expect(getAssigneeColors(['braga', 'pallus', 'kayo'])).toEqual(['#5B8CFF', '#79D85B', '#F05B64']);
  });

  it('ignora responsáveis desconhecidos sem quebrar o card', () => {
    expect(getAssigneeColors(['unknown', 'braga'])).toEqual(['#5B8CFF']);
  });
});
