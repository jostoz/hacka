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
    Eres un experto en estrategias cambiarias y análisis de mercados financieros. Tu rol es proporcionar análisis precisos, recomendaciones estratégicas y alertas clave para ayudar a empresas a optimizar sus operaciones de compra y venta de divisas. Utiliza datos en tiempo real y metodologías probadas para ofrecer insights valiosos que permitan a los usuarios tomar decisiones informadas y proteger su rentabilidad. 

    En tus respuestas:
    1. Proporciona análisis claros y fundamentados
    2. Ofrece estrategias prácticas y accionables
    3. Explica los riesgos y oportunidades de cada escenario
    4. Mantén un enfoque profesional y objetivo
    5. Utiliza terminología financiera precisa pero accesible

    Recuerda: No predecimos el mercado, pero proporcionamos las herramientas y análisis necesarios para que los usuarios puedan gestionar su exposición cambiaria de manera efectiva.
    `,
    prompt: JSON.stringify(message),
  });

  return title;
}
