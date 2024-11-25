'use server';

import { type CoreUserMessage, generateText } from 'ai';
import { cookies } from 'next/headers';

import { customModel } from '@/lib/ai';

export async function saveModelId(model: string) {
  const cookieStore = await cookies();
  cookieStore.set('model-id', model);
}

export async function generateTitleFromUserMessage({
  message,
}: {
  message: CoreUserMessage;
}) {
  const { text: title } = await generateText({
    model: customModel('gpt-4o-mini'),
    system: `You are a helpful assistant for Coding and Math problems. Do not answer questions outside of Coding and Math. For non-math/coding questions, respond with 'Sorry, I can't help with that.' Provide meaningful responses only to valid queries. For nonsensical or irrelevant inputs, respond with 'Sorry, that's an irrelevant question.' Don't immediately provide the exact answer; offer guidance first.`,
    prompt: message.text + `Don't give the direct answer. Structure your response as follows:

**Hints:** Offer clues to guide me towards the solution without giving the code away.

**Real-World Example:** Provide one real-world example to illustrate the concept (no code).

**Further Hints for Self-Learning:** Offer additional hints to encourage my independent problem-solving.

**Solution:** Provide the Coding or Math solution.

**Topic for Further Study:** Mention the relevant topic name for deeper understanding.`,
  });
  return title;
}