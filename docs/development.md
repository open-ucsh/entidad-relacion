# Guía de desarrollo

## Requisitos

- Node.js 20 o superior.
- pnpm 11.
- Un navegador moderno con soporte para SVG, Canvas y almacenamiento local.

## Instalación

```bash
git clone https://github.com/open-ucsh/web-modelador-bd.git
cd web-modelador-bd
pnpm install
pnpm dev
```

La aplicación queda disponible en `http://localhost:3000`.

## Estructura del proyecto

| Ruta                 | Responsabilidad                                                     |
| -------------------- | ------------------------------------------------------------------- |
| `app/`               | Entrada de Next.js, layout y estilos globales.                      |
| `components/editor/` | Interfaz del editor, canvas, inspector, historial y exportación.    |
| `domain/diagram/`    | Modelos, factories, consultas y validación del diagrama conceptual. |
| `domain/logical/`    | Modelo lógico, diagnósticos y transformación desde ER.              |
| `state/diagram/`     | Store de Zustand, documentos, historial y mutaciones.               |
| `docs/`              | Guías de uso, notación, ejercicios y documentación técnica.         |

## Comandos

```bash
pnpm dev          # servidor de desarrollo
pnpm typecheck    # comprobación de TypeScript
pnpm lint         # ESLint sin warnings
pnpm format:check # verificación de Prettier
pnpm build        # build de producción
pnpm knip         # detección de exports/dependencias sin uso
```

## Principios para cambios

- Mantén la lógica de dominio fuera de los componentes visuales.
- Reutiliza modelos, consultas y validadores existentes antes de duplicar reglas.
- Conserva la compatibilidad de los archivos JSON o añade una migración explícita.
- Los cambios que afectan el historial deben ser reversibles y describir correctamente la actividad.
- Los errores deben mostrarse a la persona usuaria; no los ocultes con valores por defecto silenciosos.
- Actualiza la documentación cuando cambie el flujo visible o el formato de proyecto.

## Flujo de revisión

Lee [`CONTRIBUTING.md`](../CONTRIBUTING.md), crea una rama enfocada, ejecuta todos los checks y abre un pull request con contexto, verificación y capturas cuando el cambio sea visual.
