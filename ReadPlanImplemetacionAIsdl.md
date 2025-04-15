Adaptación para FXperto (Enfoque Vercel AI SDK):
Interfaz Principal: Usa useChat de Vercel AI SDK para la conversación.
Obtención de Datos y Señales: Define funciones backend (Server Actions o API Routes) como herramientas para:
get_fx_data(pair, timeframe, periods) -> Llama a tu API de datos real-time.
calculate_quant_signal(data, capital, risk_percent) -> Implementa tu lógica Sigmoide/Tanh.
get_simple_forecast(data) -> Implementa tu ARIMA/ETS con statsforecast.
Lógica Backend Principal:
Recibe el mensaje del usuario.
Llama al LLM (a través de la SDK).
El LLM decide llamar a las herramientas para obtener datos, señal y pronóstico.
Tu código backend recibe los resultados de las herramientas.
Tu código backend implementa la lógica de contextualización (combinar señal + pronóstico).
Tu código backend le dice al LLM qué responder y qué componentes de UI (si los hay) generar.
Presentación:
La respuesta principal es texto en el chat.
Usa Generative UI (ai/rsc) para mostrar una SignalCard con la recomendación final (Señal, Confianza, Tamaño, SL, Justificación) y quizás botones de acción.
Para gráficos más complejos o persistentes, necesitarás un componente React separado en tu UI, fuera del chat, que se actualice con datos obtenidos de forma independiente o a través de llamadas API adicionales.
HITL: El LLM pregunta en el chat o los botones generados en la UI permiten al usuario confirmar/ignorar.