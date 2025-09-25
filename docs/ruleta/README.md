# Ruleta Europea - Documento de Diseño

## Análisis funcional
<copiar aquí el análisis, requisitos, reglas, modelo, flujos y roadmap provistos en la conversación>

## Flujograma (Mermaid)
```mermaid
flowchart TD
  A[Coloca apuestas] -->|Saldo >= monto| B[Iniciar Giro]
  B --> C[Animación Física / easeOut]
  C -->|omega≈0| D[Cuantizar sector]
  D --> E[Calcular resultado y payout]
  E --> F[Actualizar saldo (1 sola vez)]
  F --> G[Registrar historial]
  G --> H[Permitir nuevas apuestas]
```

## Módulos
- UI Wheel, Physics, Betting Engine, Wallet, History, Accessibility.

## Interfaces clave
```ts
function numberColor(n: number): 'red'|'black'|'green'
function computePayout(bets: Map<string,number>, result: number): number
```

## Reglamento
- Ruleta europea (un cero), pagos estándar, cobro único por giro, 0 sólo pleno.


