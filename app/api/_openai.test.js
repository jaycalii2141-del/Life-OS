import { describe, expect, it } from 'vitest';
import { responseText, splitTaggedJSON } from './_openai.js';

describe('OpenAI response helpers', () => {
  it('reads text from the Responses API output shape', () => {
    expect(responseText({
      output: [{
        type: 'message',
        content: [
          { type: 'output_text', text: 'Clear next move.' },
          { type: 'refusal', refusal: 'ignored' },
        ],
      }],
    })).toBe('Clear next move.');
  });

  it('prefers the convenience output_text field when present', () => {
    expect(responseText({ output_text: '  Ready.  ', output: [] })).toBe('Ready.');
  });

  it('separates a reply from valid one-tap actions', () => {
    expect(splitTaggedJSON(
      'Start with the call.\nACTIONS_JSON: [{"type":"focus","label":"Set it","text":"Make the call"}]',
      'ACTIONS_JSON:',
    )).toEqual({
      text: 'Start with the call.',
      value: [{ type: 'focus', label: 'Set it', text: 'Make the call' }],
    });
  });

  it('keeps the answer and safely drops malformed actions', () => {
    expect(splitTaggedJSON('Useful answer.\nACTIONS_JSON: nope', 'ACTIONS_JSON:')).toEqual({
      text: 'Useful answer.',
      value: [],
    });
  });
});
