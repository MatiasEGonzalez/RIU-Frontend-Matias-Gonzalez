# Hero Manager — RIU Frontend Challenge

CRUD de superhéroes construido con **Angular 21** y **Angular Material**, enfocado en buenas prácticas de arquitectura y testing, priorizando claridad sobre complejidad innecesaria.

El foco estuvo en arquitectura, testing y decisiones técnicas justificadas; la UI se mantuvo funcional pero simple a propósito.

## Stack

- Angular 21.1.4 (standalone components, signals)
- Angular Material 21
- RxJS 7
- Vitest (unit testing)
- TypeScript strict mode

## Quick Start

```bash
npm install
ng serve          # http://localhost:4200
ng test           # 107 unit tests
ng test --watch=false # CI mode
ng build          # production build
```

## Arquitectura

```
src/app/
├── domain/                          # Capa de dominio (sin dependencias externas)
│   ├── models/hero.model.ts         # Hero, CreateHeroDto, UpdateHeroDto
│   └── repositories/hero.repository.ts  # Contrato abstracto (DIP)
│
├── infrastructure/                  # Implementaciones concretas
│   ├── services/hero.service.ts     # Repositorio in-memory con delay simulado
│   ├── services/loading.service.ts  # Estado de loading con counter (signals)
│   └── interceptors/loading.interceptor.ts  # HTTP interceptor funcional
│
├── features/heroes/                 # Feature module (lazy-loaded)
│   ├── components/
│   │   ├── hero-search/             # Dumb: input de búsqueda
│   │   └── hero-table/              # Dumb: tabla Material con acciones
│   ├── pages/
│   │   ├── hero-list-page/          # Smart: orquesta listado, búsqueda, paginación
│   │   └── hero-form-page/          # Smart: formulario reactivo crear/editar
│   └── heroes.routes.ts             # Rutas del feature
│
└── shared/
    ├── components/confirm-dialog/   # Dialog de confirmación reutilizable
    └── directives/uppercase.directive.ts  # Transforma input a mayúsculas
```

## Decisiones técnicas

### Arquitectura hexagonal

`HeroRepository` es una clase abstracta que define el contrato de acceso a datos. `HeroService` la implementa con datos in-memory. El día que exista un backend real, se crea un nuevo adapter sin tocar ni los componentes ni el dominio.

En este challenge la implementación es in-memory para mantener el foco en arquitectura y testing, no en integración con APIs externas.

```typescript
// app.config.ts — el único lugar donde se decide la implementación
{ provide: HeroRepository, useClass: HeroService }
```

### Smart / Dumb components

Los **page components** (smart) inyectan servicios y orquestan la lógica. Los **components** (dumb) solo reciben `input()` y emiten `output()`. Podría haberse hecho todo en un solo componente, pero separarlo hace que los dumb sean reutilizables y los smart testeables con mocks aislados.

### Signals sobre BehaviorSubject

El estado reactivo usa `signal()` y `computed()` en lugar de BehaviorSubjects. Menos boilerplate, mejor integración con `OnPush`, sin suscripciones manuales. En un proyecto con estado más complejo evaluaría NgRx SignalStore, pero para este scope no se justifica.

### Loading con counter

`LoadingService` usa un counter en lugar de un boolean. Con operaciones concurrentes, un boolean se apaga cuando termina la primera — el counter espera a que terminen todas.

### provideAnimations() omitido

Deprecated desde Angular 20.2. Se verificó que Angular Material 21 funciona correctamente sin el renderer legacy, degradando a CSS transitions. Para animaciones custom se usaría la nueva API basada en `animate.enter` / `animate.leave` a nivel componente.

### Functional HTTP interceptor

Registrado con `withInterceptors([loadingInterceptor])`. Preparado para un backend real sin cambios en la configuración.

## Tests

107 unit tests distribuidos en 10 spec files:

| Capa | Archivo | Tests |
|------|---------|-------|
| Domain | `hero.service.spec.ts` | 25 |
| UI | `hero-list-page.component.spec.ts` | 15 |
| UI | `hero-table.component.spec.ts` | 10 |
| UI | `hero-form-page.component.spec.ts` | 9 |
| Shared | `confirm-dialog.component.spec.ts` | 8 |
| Shared | `uppercase.directive.spec.ts` | 10 |
| Shared | `hero-search.component.spec.ts` | 7 |
| Infra | `loading.service.spec.ts` | 8 |
| Infra | `loading.interceptor.spec.ts` | 4 |
| Root | `app.spec.ts` | 3 |

## Rutas

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/heroes` | `HeroListPageComponent` | Listado con búsqueda y paginación |
| `/heroes/new` | `HeroFormPageComponent` | Crear héroe |
| `/heroes/:id/edit` | `HeroFormPageComponent` | Editar héroe existente |
| `**` | Redirect → `/heroes` | Wildcard |

Todas las rutas están lazy-loaded a nivel de feature.
