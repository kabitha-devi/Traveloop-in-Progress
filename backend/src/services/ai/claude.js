const prisma = require('../../utils/prisma');
const { getMockResponse } = require('./mockResponses');

function getApiKey() {
  return process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes('PLACEHOLDER')
    ? process.env.GROQ_API_KEY
    : null;
}

/**
 * Call Groq with structured JSON response
 */
async function callAI(systemPrompt, userMessage, userId, feature, extraContext, enableSearch = false) {
  const apiKey = getApiKey();
  if (!apiKey) {
    return getMockResponse(feature, userMessage, extraContext);
  }

  const start = Date.now();
  try {
    const payload = {
      model: 'mixtral-8x7b-32768',
      messages: [
        { role: 'system', content: systemPrompt + '\n\nPlease ensure your response is a valid JSON.' },
        { role: 'user', content: userMessage }
      ],
      response_format: { type: "json_object" },
      max_tokens: 4096,
      temperature: 0.7,
    };

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API Error: ${response.status} ${errText}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    const latency = Date.now() - start;

    await prisma.aIGenerationLog.create({
      data: {
        userId,
        feature,
        inputTokens: data.usage?.prompt_tokens || 0,
        outputTokens: data.usage?.completion_tokens || 0,
        latencyMs: latency,
        model: 'groq-mixtral-8x7b',
        prompt: userMessage.substring(0, 500),
        response: typeof content === 'string' ? content.substring(0, 2000) : JSON.stringify(content).substring(0, 2000),
      },
    });

    if (typeof content === 'object' && content !== null) {
      return content;
    }

    if (typeof content === 'string') {
      try {
        return JSON.parse(content);
      } catch (_) {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
        const arrMatch = content.match(/\[[\s\S]*\]/);
        if (arrMatch) return JSON.parse(arrMatch[0]);
        return { raw: content };
      }
    }

    return { raw: String(content) };
  } catch (error) {
    await prisma.aIGenerationLog.create({
      data: {
        userId, feature,
        latencyMs: Date.now() - start,
        model: 'groq-mixtral-8x7b',
        prompt: userMessage.substring(0, 500),
        error: error.message,
      },
    });
    console.error(`AI Error [${feature}]:`, error.message);
    return getMockResponse(feature, userMessage, extraContext);
  }
}

/**
 * Stream Groq response chunks
 */
async function streamAI(systemPrompt, userMessage, userId, feature, onChunk) {
  const apiKey = getApiKey();
  if (!apiKey) {
    const mock = getMockResponse(feature, userMessage);
    const str = JSON.stringify(mock, null, 2);
    for (let i = 0; i < str.length; i += 50) {
      onChunk(str.slice(i, i + 50));
      await new Promise(r => setTimeout(r, 30));
    }
    return mock;
  }

  const start = Date.now();
  let full = '';
  try {
    const payload = {
      model: 'mixtral-8x7b-32768',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      stream: true,
      max_tokens: 4096,
      temperature: 0.7,
    };

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Groq API Error: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunkStr = decoder.decode(value, { stream: true });
      const lines = chunkStr.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
              const txt = data.choices[0].delta.content;
              full += txt;
              onChunk(txt);
            }
          } catch (e) {
            // ignore parse error for incomplete chunks
          }
        }
      }
    }

    await prisma.aIGenerationLog.create({
      data: {
        userId, feature,
        latencyMs: Date.now() - start,
        model: 'groq-mixtral-8x7b-stream',
        prompt: userMessage.substring(0, 500),
        response: full.substring(0, 2000),
      },
    });

    try {
      return JSON.parse(full);
    } catch (_) {
      const jsonMatch = full.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
      return { raw: full };
    }
  } catch (error) {
    console.error(`AI Stream Error [${feature}]:`, error.message);
    return getMockResponse(feature, userMessage);
  }
}

module.exports = { callAI, streamAI };
