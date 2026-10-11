# Contribuir

¡Gracias por tu interés en MER Designer! Este proyecto busca ser una herramienta educativa, clara y útil para aprender modelado Entidad–Relación. Puedes contribuir con código, documentación, ejercicios, diseño, pruebas o reportes de errores.

## Antes de empezar

1. Busca si ya existe un issue para tu propuesta.
2. Para cambios grandes, abre primero un issue describiendo el problema, la solución propuesta y el impacto en la experiencia de aprendizaje.
3. No incluyas credenciales, datos personales ni archivos generados localmente en un pull request.

## Preparar el entorno

```bash
pnpm install
pnpm dev
```

Antes de enviar cambios, ejecuta:

```bash
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
```

Si modificas lógica de dominio, validadores, serialización o transformaciones, añade o actualiza pruebas enfocadas al comportamiento cambiado.

## Flujo de pull request

1. Crea una rama descriptiva desde la rama principal.
2. Mantén cada pull request enfocado en un problema.
3. Actualiza la documentación relacionada con el cambio.
4. Describe en el pull request qué cambió, cómo se verificó y qué capturas o decisiones de UX son relevantes.
5. Resuelve los checks automatizados y las conversaciones de revisión antes de solicitar merge.

Los pull requests pequeños y con criterios de aceptación claros se revisan más rápido.

## Convención de commits

Este repositorio usa **Conventional Commits**. Todos los mensajes de commit deben seguir el formato:

```text
tipo(alcance-opcional): descripción breve
```

Tipos recomendados:

- `feat`
- `fix`
- `refactor`
- `chore`
- `docs`
- `test`
- `build`
- `ci`

Ejemplos válidos:

- `feat(editor): agregar vista inicial`
- `fix: corregir estilos base`
- `chore: actualizar tooling`

Usa el imperativo, evita mensajes genéricos como ` cambios` y no mezcles cambios no relacionados en el mismo commit.

## Tipos de contribución

- **Bug:** incluye pasos reproducibles, resultado esperado, resultado actual, navegador y tamaño de pantalla.
- **Feature:** explica el problema que resuelve y cómo mejora el aprendizaje o el flujo de modelado.
- **Documentación:** indica a qué tipo de usuario ayuda y verifica que los enlaces funcionen.
- **Ejercicio:** incluye enunciado, dificultad, conceptos practicados y una solución importable cuando corresponda.
