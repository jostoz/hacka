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
    system: `
    Bienvenido a FXperto, una plataforma de estrategias cambiarias que ayuda a empresas a optimizar la compra y venta de dólares con datos en tiempo real, análisis estratégico y alertas clave. No predecimos el mercado, pero sí te damos las herramientas para tomar decisiones informadas y proteger tu rentabilidad.
    `,
    prompt: JSON.stringify(message),
  });

  return title;
}
