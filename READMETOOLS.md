1. Definir la Herramienta
Archivo: lib/tools.ts (o donde definas las herramientas)
Qué hacer:
Define la herramienta con su descripción, parámetros y función.


    export const tools = {
      fetchFxRates: {
        description: "Obtiene tasas de cambio en tiempo real para un par de divisas.",
        parameters: z.object({ pair: z.string() }),
        function: async ({ pair }) => {
          const rate = await fetchMarketData(pair); // Llamada a API externa.
          return { pair, rate };
        },
      },
    };


    2. Configurar el Agente para Usar la Herramienta
Archivo: app/(chat)/api/chat/route.ts
Qué hacer:

Añade la herramienta al objeto tools en streamText.


    const result = await streamText({
      model: customModel(model.apiIdentifier),
      system: systemPrompt(userMessage.content), // Prompt dinámico.
      messages: coreMessages,
      tools: {
        fetchFxRates: tools.fetchFxRates, // Añade la herramienta.
      },
      tool_choice: "auto", // El modelo decide cuándo usarla.
    });


    3. Actualizar los Prompts
Archivo: lib/ai/prompts.ts
Qué hacer:
Asegúrate de que los prompts incluyan instrucciones para usar la herramienta.
Ejemplo en el prompt technical

    export const forexPrompts = {
      technical: `
      Si el usuario pregunta por el precio o tendencia de {PAR}:
      1. Usa la herramienta \`fetchFxRates\` para obtener datos en tiempo real.
      2. Proporciona un análisis basado en los resultados.
      `,
    };


    4. Manejar las Respuestas de la Herramienta
Archivo: app/(chat)/api/chat/route.ts
Qué hacer:
Procesa las llamadas a herramientas y añade los resultados al contexto del chat.


    const toolCalls = response.choices[0]?.message?.tool_calls;
    if (toolCalls) {
      for (const toolCall of toolCalls) {
        const toolName = toolCall.function.name as keyof typeof tools;
        const args = JSON.parse(toolCall.function.arguments);
        const result = await tools[toolName].function(args); // Ejecuta la herramienta.
        
        // Añade el resultado al contexto del chat.
        messages.push({
          role: "tool",
          name: toolName,
          content: JSON.stringify(result),
        });
      }
    }


    5. Actualizar los Componentes de UI (opcional)
Archivo: components/message.tsx (o donde manejes la UI)
Qué hacer:
Si la herramienta devuelve datos que deben mostrarse en la UI, asegúrate de que el componente message.tsx pueda manejarlos.
Ejemplo:

    if (message.role === "tool" && message.name === "fetchFxRates") {
      const data = JSON.parse(message.content);
      return <div>📊 {data.pair}: {data.rate}</div>;
    }


    6. Probar la Herramienta
Localmente:
Ejecuta pnpm dev y prueba la herramienta en el chat.
Verifica que el modelo llame a la herramienta correctamente y que los resultados se muestren como esperas.
En Vercel:
Haz commit y push para desplegar los cambios:

    git add .
    git commit -m "feat: add fetchFxRates tool"
    git push


    Resumen de Archivos a Adaptar
lib/tools.ts: Definir la herramienta.
app/(chat)/api/chat/route.ts: Configurar el agente para usar la herramienta.
lib/ai/prompts.ts: Actualizar los prompts para guiar el uso de la herramienta.
components/message.tsx (opcional): Manejar la visualización de los resultados de la herramienta.
Si necesitas ayuda para implementar alguno de estos pasos o ajustar un archivo específico, ¡avísame! Puedo guiarte paso a paso. 🚀