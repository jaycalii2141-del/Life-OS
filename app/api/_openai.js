const DEFAULT_MODEL = 'gpt-5.6-sol';

export function getOpenAIModel() {
  return process.env.OPENAI_MODEL || DEFAULT_MODEL;
}

export function responseText(data) {
  if (typeof data?.output_text === 'string') return data.output_text.trim();
  return (data?.output || [])
    .filter((item) => item?.type === 'message')
    .flatMap((item) => item.content || [])
    .filter((part) => part?.type === 'output_text')
    .map((part) => part.text || '')
    .join('')
    .trim();
}

export function splitTaggedJSON(raw, marker, limit = 3) {
  const index = raw.indexOf(marker);
  if (index === -1) return { text: raw.trim(), value: [] };
  const text = raw.slice(0, index).trim();
  try {
    const parsed = JSON.parse(raw.slice(index + marker.length).trim());
    return { text, value: Array.isArray(parsed) ? parsed.slice(0, limit) : [] };
  } catch {
    return { text, value: [] };
  }
}

export async function openAIResponse({
  instructions,
  input,
  model = getOpenAIModel(),
  reasoning = 'low',
  verbosity = 'medium',
  maxOutputTokens = 1400,
}) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return anthropicFallback({ instructions, input, maxOutputTokens });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 50000);

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        instructions,
        input,
        reasoning: { effort: reasoning },
        text: { verbosity },
        max_output_tokens: maxOutputTokens,
        store: false,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error('OpenAI request failed', response.status, detail.slice(0, 500));
      const error = new Error('AI request failed');
      error.statusCode = response.status === 429 ? 429 : 502;
      throw error;
    }

    const data = await response.json();
    const text = responseText(data);
    if (!text) {
      const error = new Error('AI returned no text');
      error.statusCode = 502;
      throw error;
    }
    return text;
  } catch (error) {
    if (error?.name === 'AbortError') {
      const timeoutError = new Error('AI request timed out');
      timeoutError.statusCode = 504;
      return anthropicFallback({ instructions, input, maxOutputTokens }, timeoutError);
    }
    return anthropicFallback({ instructions, input, maxOutputTokens }, error);
  } finally {
    clearTimeout(timeout);
  }
}

async function anthropicFallback({ instructions, input, maxOutputTokens }, originalError) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    if (originalError) throw originalError;
    const error = new Error('AI not configured');
    error.statusCode = 503;
    throw error;
  }

  const messages = Array.isArray(input)
    ? input.map((message) => ({
        role: message.role === 'assistant' ? 'assistant' : 'user',
        content: String(message.content || '').slice(0, 5000),
      }))
    : [{ role: 'user', content: String(input || '').slice(0, 5000) }];

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001',
        max_tokens: Math.min(maxOutputTokens, 2400),
        system: instructions,
        messages,
      }),
    });
    if (!response.ok) {
      console.error('Fallback AI request failed', response.status);
      const error = new Error('AI request failed');
      error.statusCode = response.status === 429 ? 429 : 502;
      throw error;
    }
    const data = await response.json();
    const text = (data.content || []).map((block) => block.text || '').join('').trim();
    if (!text) {
      const error = new Error('AI returned no text');
      error.statusCode = 502;
      throw error;
    }
    return text;
  } catch (error) {
    if (error?.statusCode) throw error;
    const wrapped = new Error('AI request failed');
    wrapped.statusCode = 502;
    throw wrapped;
  }
}

export function writeAIError(res, error) {
  const status = error?.statusCode || 500;
  const messages = {
    429: 'JAM Intelligence is busy for a moment. Try again shortly.',
    502: 'JAM Intelligence could not complete that thought. Try again.',
    503: 'AI not configured',
    504: 'JAM Intelligence took too long. Try again.',
  };
  res.status(status).json({ error: messages[status] || 'AI request failed' });
}
