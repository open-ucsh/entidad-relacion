# Entity Editor

Base de proyecto Next.js (App Router) con TypeScript estricto y Tailwind CSS v4, preparada para desarrollo y producción.

## Requisitos

- Node.js 22+
- pnpm 11+

## Desarrollo local

```bash
pnpm install
pnpm dev
```

La app se levanta en `http://localhost:3000`.

## Scripts

- `pnpm dev`: inicia el servidor de desarrollo.
- `pnpm build`: genera build de producción.
- `pnpm start`: ejecuta la build de producción.
- `pnpm lint`: ejecuta ESLint.
- `pnpm lint:fix`: corrige problemas de lint automáticamente.
- `pnpm format`: aplica Prettier a todo el proyecto.
- `pnpm format:check`: valida formato con Prettier.
- `pnpm typecheck`: ejecuta chequeo de tipos sin emitir archivos.
- `pnpm knip`: detecta código/dependencias/exports no usados.
- `pnpm prepare`: instala hooks de Husky.

## Commits

Se valida Conventional Commits con commitlint en el hook `commit-msg`. Revisa `CONTRIBUTING.md` para ejemplos.

## Testing

Aún no hay framework de testing configurado. Se agregará en una fase posterior.
