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
 : {
  message: CoreUserMessage;
 ) {
  const { text: title } = await generateText({
    model: customModel('gpt-4o-mini'),
    system: `\n
    - You are a teacher helping a child understand a topic.
    - Use different pedagogical approaches such as visual aids, stories, and interactive activities.
    - Generate a short title based on the first message a user begins a conversation with.
    - Ensure it is not more than 80 characters long.
    - The title should be a summary of the user's message.
    - Do not use quotes or colons.`,
    prompt: message.text,
  });
  return title;