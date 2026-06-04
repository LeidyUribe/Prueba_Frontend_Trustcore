# Trustcore — Prueba Técnica Frontend

Sistema de carga de archivos con Next.js 14 App Router, TypeScript, Formik, Yup y control de concurrencia.

## Requisitos

- Node.js 18+
- npm 9+

## Instalación

```bash
npm install
```

## Ejecución

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start

# Lint
npm run lint
```

Abre [http://localhost:3000/upload](http://localhost:3000/upload)

## Estructura del proyecto

```
src/
├── app/                    # Next.js App Router (rutas, layouts, API)
│   ├── upload/             # Página /upload
│   └── api/
│       ├── upload/         # POST mock de subida (20% error)
│       └── submit/         # POST mock de envío final
├── components/             # UI reutilizable (DropZone, FileList, Form)
├── hooks/                  # Lógica React (context, dropzone)
├── services/               # Comunicación HTTP (upload, submit)
├── store/                  # Estado global (reducer + selectors)
├── types/                  # Tipos TypeScript (FileDescriptor)
├── utils/                  # Funciones puras (concurrencia, backoff, validación)
└── schemas/                # Validación Yup del formulario
```

### Por qué cada carpeta

| Carpeta | Responsabilidad | Principio |
|---------|----------------|-----------|
| `app/` | Routing, SSR, API Routes | Next.js convention |
| `components/` | Presentación UI | Single Responsibility |
| `hooks/` | Estado y efectos React | Separation of Concerns |
| `services/` | Llamadas HTTP | Dependency Inversion |
| `store/` | Estado de archivos (reducer) | Unidirectional Data Flow |
| `types/` | Contratos TypeScript | Type Safety |
| `utils/` | Funciones puras sin side effects | Testability |
| `schemas/` | Reglas de validación | Schema-driven validation |

## Decisiones técnicas

### Discriminated Unions para `FileDescriptor`

El campo `status` actúa como discriminante. TypeScript garantiza en compile-time que `progress` solo existe cuando `status === "uploading"`, eliminando estados imposibles.

### Deduplicación por `name + size`

Balance entre simplicidad y precisión. No requiere hashing async. Permite archivos con mismo nombre pero distinto contenido (distinto size).

### `limitConcurrency` con pool de 3

Evita saturar el servidor y el browser con demasiadas conexiones simultáneas. Mantiene orden de resultados mediante índices pre-asignados.

### Exponential Backoff + Jitter

Fórmula: `delay = min(base × 2^attempt + random(0, jitter × base), maxDelay)`

Resuelve el "thundering herd": cuando muchos clientes reintentan al mismo tiempo tras un fallo, el jitter distribuye los reintentos.

### AbortController

Permite cancelar uploads en vuelo de forma estándar del browser. El signal se pasa a `fetch` y a los timers de simulación de progreso.

### useReducer + Context (no Redux/Zustand)

Para el scope de esta prueba, un reducer con Context es suficiente. Evita dependencia extra y mantiene la lógica de estado testeable fuera de los componentes.

### Formik + Yup

Formik maneja el ciclo de vida del formulario (touched, errors, submit). Yup centraliza reglas de validación declarativas, reutilizables en cliente y servidor.

## Tradeoffs

| Decisión | Ventaja | Desventaja |
|----------|---------|------------|
| Context vs Zustand | Zero deps, simple | Re-renders en árbol grande |
| name+size dedup | O(n), sync | Colisiones si mismo nombre y size, distinto contenido |
| Simulated progress | UX realista sin backend real | No refleja velocidad real de red |
| CSS vanilla | Sin deps, control total | Más verbose que Tailwind |
| Pool concurrency=3 | Balance UX/recursos | Valor fijo, no adaptativo |

## Mejoras futuras

- [ ] Upload chunked/resumable (tus.io protocol)
- [ ] Hash SHA-256 para deduplicación precisa
- [ ] Tests unitarios (Vitest) + E2E (Playwright)
- [ ] i18n con next-intl
- [ ] Adaptive concurrency basada en Network Information API
- [ ] Presigned URLs (S3/GCS) para upload directo al CDN
- [ ] Optimistic UI con rollback
- [ ] Storybook para componentes aislados

## Flujo de estados de archivos

```
idle → uploading → done
  ↑        ↓
  └── error ←┘
  ↑        ↓
  └── canceled
```

- **idle**: Archivo agregado, pendiente de subir
- **uploading**: Subida en progreso (con `progress`)
- **done**: Subida exitosa (con `url`)
- **error**: Falló después de reintentos (con `errors[]`)
- **canceled**: Usuario canceló via AbortController

## Accesibilidad (WCAG)

- Labels asociados con `htmlFor`/`id`
- `aria-live="polite"` para cambios dinámicos
- `role="progressbar"` con `aria-valuenow`
- `:focus-visible` para navegación por teclado
- Dropzone activable con Enter/Space
- Texto oculto `.sr-only` para contexto de screen readers

## API Mock

### POST `/api/upload`

Simula latencia (500–1500ms) y falla aleatoriamente (20%).

```json
{ "id": "uuid", "url": "https://cdn.example.com/uploads/..." }
```

### POST `/api/submit`

Valida payload y confirma recepción.

```json
{ "success": true, "message": "...", "receivedFiles": 3 }
```

## Documentación adicional

- [SUSTENTACION.md](./docs/SUSTENTACION.md) — 30 preguntas técnicas con respuestas
- [PART-A.md](./docs/PART-A.md) — Explicación detallada Parte A
