# Guía para Crear Componentes Genéricos de UI con Vercel AI SDK

## 1. Estructura del Componente Genérico

### 1.1 Definición del Componente Base
```typescript
// components/GenericToolResult.tsx
import { Chart } from './Chart';
import { Table } from './Table';

interface ToolResult {
  type: 'text' | 'chart' | 'table';
  data: any;
  metadata?: {
    title?: string;
    description?: string;
  };
}

interface GenericToolResultProps {
  result: ToolResult;
}

export function GenericToolResult({ result }: GenericToolResultProps) {
  switch (result.type) {
    case 'text':
      return <div className="p-4 bg-white rounded-lg shadow">{result.data}</div>;
    case 'chart':
      return <Chart data={result.data} />;
    case 'table':
      return <Table data={result.data} />;
    default:
      return <div>Tipo de datos no soportado</div>;
  }
}
```

## 2. Integración con Vercel AI SDK

### 2.1 Configuración en la Ruta de Chat
```typescript
// app/(chat)/api/chat/route.ts
import { streamText } from 'ai';
import { GenericToolResult } from '@/components/GenericToolResult';

const result = await streamText({
  model: customModel(model.apiIdentifier),
  messages: coreMessages,
  tools: {
    fetchTechnicalAnalysis: tools.fetchTechnicalAnalysis,
  },
  tool_choice: "auto",
});
```

### 2.2 Manejo de Respuestas de Herramientas
```typescript
const toolCalls = response.choices[0]?.message?.tool_calls;
if (toolCalls) {
  for (const toolCall of toolCalls) {
    const toolName = toolCall.function.name;
    const args = JSON.parse(toolCall.function.arguments);
    const result = await tools[toolName].function(args);
    
    // Renderizar el resultado usando el componente genérico
    return <GenericToolResult result={result} />;
  }
}
```

## 3. Definición de Herramientas

### 3.1 Ejemplo de Herramienta de Análisis Técnico
```typescript
// lib/tools.ts
export const tools = {
  fetchTechnicalAnalysis: {
    description: "Obtiene análisis técnico en tiempo real para un par de divisas.",
    parameters: z.object({ pair: z.string() }),
    function: async ({ pair }) => {
      const analysis = await fetchTechnicalAnalysisFromAPI(pair);
      return {
        type: 'chart',
        data: analysis.chartData,
        metadata: {
          title: `Análisis Técnico: ${pair}`,
          description: analysis.summary
        }
      };
    },
  }
};
```

## 4. Estilos y Personalización

### 4.1 Estilos Base
```typescript
// components/GenericToolResult.tsx
const styles = {
  container: 'p-4 bg-white rounded-lg shadow-md',
  title: 'text-xl font-bold mb-2',
  description: 'text-gray-600 mb-4',
  chartContainer: 'w-full h-64',
  tableContainer: 'w-full overflow-x-auto'
};
```

### 4.2 Componente con Estilos
```typescript
export function GenericToolResult({ result }: GenericToolResultProps) {
  return (
    <div className={styles.container}>
      {result.metadata?.title && (
        <h3 className={styles.title}>{result.metadata.title}</h3>
      )}
      {result.metadata?.description && (
        <p className={styles.description}>{result.metadata.description}</p>
      )}
      <div className={
        result.type === 'chart' ? styles.chartContainer :
        result.type === 'table' ? styles.tableContainer : ''
      }>
        {renderContent(result)}
      </div>
    </div>
  );
}
```

## 5. Pruebas y Validación

### 5.1 Pruebas Locales
1. Ejecutar `pnpm dev`
2. Probar diferentes tipos de datos
3. Verificar la visualización correcta

### 5.2 Despliegue
```bash
git add .
git commit -m "feat: add generic tool result component"
git push
```

## 6. Mejores Prácticas

1. **Tipado Fuerte**: Usar TypeScript para mejor seguridad de tipos
2. **Modularidad**: Mantener componentes pequeños y reutilizables
3. **Error Handling**: Manejar casos de error y estados de carga
4. **Accesibilidad**: Seguir prácticas de a11y
5. **Responsive Design**: Asegurar que los componentes se vean bien en todos los dispositivos

## 7. Extensibilidad

Para añadir nuevos tipos de visualización:

1. Actualizar la interfaz `ToolResult`
2. Crear el componente específico
3. Actualizar el switch case en `GenericToolResult`
4. Actualizar los estilos según sea necesario

## 8. Ejemplo de Uso

```typescript
// Ejemplo de uso en un componente
import { GenericToolResult } from './GenericToolResult';

export function AnalysisResult({ data }) {
  return (
    <GenericToolResult
      result={{
        type: 'chart',
        data: data.chartData,
        metadata: {
          title: 'Análisis de Mercado',
          description: data.summary
        }
      }}
    />
  );
}
```





hora que hemos integrado todos los componentes, aquí está cómo funciona el flujo completo:
Cuando el usuario solicita un análisis técnico, la herramienta fetchTechnicalAnalysis en route.ts se activa.
La herramienta obtiene los datos del análisis técnico (en este caso, simulados, pero podrías conectarlo a una API real).
Los datos se devuelven en un formato específico que coincide con la interfaz TechnicalAnalysisData.
El componente message.tsx detecta que es un resultado de análisis técnico y renderiza el AnalisisTecnicoComponent.
El AnalisisTecnicoComponent muestra los datos en una interfaz de usuario atractiva y organizada.
Para usar el análisis técnico, el usuario puede hacer preguntas como:
"Muéstrame el análisis técnico de EUR/USD"
"¿Cuál es el análisis técnico actual para GBP/JPY?"
"Analiza técnicamente el par USD/JPY"
El componente mostrará:
Tendencia general (alcista, bajista o lateral)
Indicadores técnicos (RSI, MACD)
Medias móviles (MA20, MA50, MA200)
Niveles de soporte y resistencia
Una recomendación general
¿Te gustaría que haga algún ajuste adicional en alguno de los componentes o que explique alguna parte en más detalle?