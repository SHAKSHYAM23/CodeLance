import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '../lib/prisma';
import logger from '../lib/logger';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Move the prompt to a formal System Instruction
const model = genAI.getGenerativeModel({ 
model: 'gemini-3-flash',
  systemInstruction: `You are analyzing a GitHub repository.
Based on the provided files from the repository, provide a concise summary covering:
1. What this project does (2-3 sentences)
2. The main technology stack
3. Key architectural decisions visible in the code
4. The primary entry points or core modules

Be specific and technical. Maximum 200 words. Do not use filler introductions.`
});

async function getRepresentativeContent(documentId: string): Promise<string> {
 
  const readme = await prisma.chunk.findFirst({
    where: {
      documentId,
      OR: [
        { metadata: { path: ['fileName'], string_contains: 'README' } },
        { metadata: { path: ['fileName'], string_contains: 'readme' } },
        { metadata: { path: ['fileName'], string_contains: 'Readme' } },
      ]
    },
    select: { content: true },
  });

  if (readme) return readme.content.slice(0, 3000);


  const packageJson = await prisma.chunk.findFirst({
    where: {
      documentId,
      metadata: {
        path: ['fileName'],
        string_contains: 'package.json',
      },
    },
    select: { content: true },
  });

  // Priority 3 — index or main entry file
  const entryFile = await prisma.chunk.findFirst({
    where: {
      documentId,
      OR: [
        { metadata: { path: ['fileName'], string_contains: 'index.ts' } },
        { metadata: { path: ['fileName'], string_contains: 'index.js' } },
        { metadata: { path: ['fileName'], string_contains: 'main.ts' } },
        { metadata: { path: ['fileName'], string_contains: 'main.py' } },
        { metadata: { path: ['fileName'], string_contains: 'app.ts' } },
      ],
    },
    select: { content: true },
  });

  const parts: string[] = [];
  if (packageJson) parts.push(packageJson.content.slice(0, 1500));
  if (entryFile)   parts.push(entryFile.content.slice(0, 1500));

  if (parts.length > 0) return parts.join('\n\n');


  const overviews = await prisma.chunk.findMany({
    where: {
      documentId,
      metadata: { path: ['type'], equals: 'overview' },
    },
    take: 3,
    select: { content: true },
  });

  return overviews.map((c) => c.content).join('\n\n').slice(0, 3000);
}

export async function generateSummary(documentId: string): Promise<void> {
  try {
    logger.info('Generating repository summary', { documentId });

    const content = await getRepresentativeContent(documentId);

    if (!content || content.trim().length === 0) {
      logger.warn('No content found for summary', { documentId });
      await prisma.document.update({
        where: { id: documentId },
        data: { summary: 'No summary available for this repository.' },
      });
      return;
    }


    const result = await model.generateContent(`Repository files:\n${content}`);
    const summary = result.response.text().trim();

    await prisma.document.update({
      where: { id: documentId },
      data: { summary },
    });

    logger.info('Summary generated successfully', { documentId });
  } catch (err: any) {
    logger.error('Summary generation failed', {
      documentId,
      error: err?.message,
    });

    await prisma.document.update({
      where: { id: documentId },
      data: { summary: 'Summary generation failed.' },
    });
  }
}