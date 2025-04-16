# Guía para Agregar Herramientas al Agente (Vercel AI SDK v2)

## 1. Definir la Herramienta
**Archivo: `lib/tools/index.ts`**

Define la herramienta con su descripción, parámetros y función usando Zod para validación:

```typescript
import { z } from 'zod';
import type { BaseTool } from '@/lib/types/types';

const forexTools = {
  fetchFxRates: {
    description: "Obtiene tasas de cambio en tiempo real para un par de divisas.",
    parameters: z.object({
      pair: z.string().describe('Par de divisas (ej: EUR/USD)'),
      timeframe: z.string().describe('Marco temporal (ej: 1h, 4h, 1d)')
    }),
    function: async ({ pair, timeframe }) => {
      const data = await fetchMarketData(pair, timeframe);
      return {
        type: 'fx-data',
        data
      };
    }
  }
} satisfies Record<string, BaseTool>;

export const tools = {
  forex: forexTools,
  // Otras categorías de herramientas
};
```

## 2. Configurar el Endpoint de Chat
**Archivo: `app/api/chat/route.ts`**

```typescript
import { streamText } from 'ai';
import { tools } from '@/lib/tools';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  return streamText({
    messages,
    tools: {
      fetchFxRates: tools.forex.fetchFxRates
    },
    maxSteps: 10,
    experimental_streamData: true
  }).toDataStreamResponse();
}
```

## 3. Manejar los Resultados en el UI
**Archivo: `components/message.tsx`**

```typescript
import type { Message, ToolInvocation } from 'ai';

export const PreviewMessage = ({ message }: { message: Message }) => {
  // Buscar resultados de herramientas en toolInvocations
  const toolResult = message.toolInvocations?.find(
    (part: ToolInvocation) => 
      part.state === 'result' && 
      part.toolName === 'fetchFxRates'
  );

  if (toolResult?.state === 'result' && toolResult.result?.type === 'fx-data') {
    return <ForexDataDisplay data={toolResult.result.data} />;
  }

  // Renderizado normal del mensaje
  return (
    <div className="message">
      {message.content}
    </div>
  );
};
```

## 4. Crear Componentes de Visualización
**Archivo: `components/ForexDataDisplay.tsx`**

```typescript
interface ForexData {
  pair: string;
  data: any; // Tipado según tus datos
}

export function ForexDataDisplay({ data }: { data: ForexData }) {
  return (
    <div className="forex-display">
      <h3>{data.pair}</h3>
      {/* Renderizar los datos específicos */}
    </div>
  );
}
```

## 5. Estructura de Tipos
**Archivo: `lib/types/types.ts`**

```typescript
import { z } from 'zod';

export interface BaseTool {
  description: string;
  parameters: z.ZodObject<any>;
  function: (args: any) => Promise<{
    type: string;
    data: any;
  }>;
}
```

## Notas Importantes

### Cambios en Vercel AI SDK v2
1. **Tool Invocations**: 
   - Ya no se usan mensajes con `role: "tool"`
   - Los resultados de herramientas están en `message.toolInvocations`
   - Cada invocación tiene estados: 'call', 'result', 'error'

2. **Streaming de Datos**:
   - Usar `experimental_streamData: true` para streaming
   - Los resultados se manejan en tiempo real

3. **Tipado**:
   - Importar tipos desde 'ai': `Message`, `ToolInvocation`
   - Usar Zod para validación de parámetros

### Estructura de Archivos
```
lib/
  ├── tools/
  │   ├── index.ts    # Definición de herramientas
  │   └── forex.ts    # Implementaciones específicas
  ├── types/
  │   └── types.ts    # Tipos compartidos
components/
  ├── message.tsx     # Manejo de mensajes
  └── displays/       # Componentes de visualización
```

### Flujo de Trabajo
1. Define la herramienta en `tools/index.ts`
2. Configura el endpoint en `api/chat/route.ts`
3. Actualiza el componente message para manejar resultados
4. Crea componentes de visualización específicos
5. Prueba la integración en el chat

### Pruebas
```bash
# Desarrollo local
pnpm dev

# Despliegue
git add .
git commit -m "feat: add new tool integration"
git push
```

### Debugging
- Revisa la consola del navegador para errores
- Verifica los tipos de datos en cada paso
- Usa el modo desarrollo para ver el streaming de datos

Para más información, consulta la [documentación oficial del Vercel AI SDK](https://sdk.vercel.ai/docs).