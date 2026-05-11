const { GoogleGenerativeAI } = require('@google/generative-ai');
const prisma = require('../../utils/prisma');
const { getMockResponse } = require('./mockResponses');

let genAI = null;
let model = null;

function getModel() {
  if (!model && process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('PLACEHOLDER')) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }
  return model;
}

/**
 * Call Gemini with structured JSON response
 */
async function callAI(systemPrompt, userMessage, userId, feature, extraContext, enableSearch = false) {
  const gemini = getModel();
  if (!gemini) {
    return getMockResponse(feature, userMessage, extraContext);
  }

  const start = Date.now();
  try {
    const payload = {
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        responseMimeType: 'application/json',
        maxOutputTokens: 4096,
        temperature: 0.7,
      },
    };

    if (enableSearch) {
      payload.tools = [{ googleSearch: {} }];
    }

    const result = await gemini.generateContent(payload);

    const latency = Date.now() - start;
    const content = result.response.text();
    const usage = result.response.usageMetadata || {};

    await prisma.aIGenerationLog.create({
      data: {
        userId,
        feature,
        inputTokens: usage.promptTokenCount || 0,
        outputTokens: usage.candidatesTokenCount || 0,
        latencyMs: latency,
        model: 'gemini-2.0-flash',
        prompt: userMessage.substring(0, 500),
        response: content.substring(0, 2000),
      },
    });

    try {
      return JSON.parse(content);
    } catch (_) {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
      const arrMatch = content.match(/\[[\s\S]*\]/);
      if (arrMatch) return JSON.parse(arrMatch[0]);
      return { raw: content };
    }
  } catch (error) {
    await prisma.aIGenerationLog.create({
      data: {
        userId, feature,
        latencyMs: Date.now() - start,
        model: 'gemini-2.0-flash',
        prompt: userMessage.substring(0, 500),
        error: error.message,
      },
    });
    console.error(`AI Error [${feature}]:`, error.message);
    return getMockResponse(feature, userMessage, extraContext);
  }
}

/**
 * Stream Gemini response chunks
 */
async function streamAI(systemPrompt, userMessage, userId, feature, onChunk) {
  const gemini = getModel();
  if (!gemini) {
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
    const result = await gemini.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: { maxOutputTokens: 4096, temperature: 0.7 },
    });

    for await (const chunk of result.stream) {
      const txt = chunk.text();
      if (txt) {
        full += txt;
        onChunk(txt);
      }
    }

    await prisma.aIGenerationLog.create({
      data: {
        userId, feature,
        latencyMs: Date.now() - start,
        model: 'gemini-2.0-flash',
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
