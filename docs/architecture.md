# Arquitectura

MER Designer es una aplicación Next.js de cliente. El estado principal vive en un store de Zustand y se organiza alrededor de documentos de diagrama.

## Flujo de datos

```text
Interfaz del editor
        ↓
Store de documentos e historial
        ↓
Modelo conceptual (ER)
        ↓
Transformación ER → modelo lógico
        ↓
Vista lógica y exportaciones
```

## Modelo conceptual

`domain/diagram/models` define entidades, relaciones, atributos, jerarquías ISA y conexiones. Las funciones de `domain/diagram/validation` validan referencias, tipos de conexión e identificadores antes de importar o mutar un diagrama.

## Modelo lógico

`domain/logical` representa tablas, columnas y claves foráneas. La transformación está separada por responsabilidad: entidades, relaciones, jerarquías ISA, atributos multivaluados y entidades débiles. Los diagnósticos se conservan junto al modelo para que la interfaz pueda explicar problemas sin romper el flujo de edición.

## Persistencia y compatibilidad

Los documentos se guardan localmente en el navegador. El archivo JSON contiene formato, versión, diagrama, apariencia y workspace lógico. Los cambios incompatibles deben aumentar la versión y mantener un lector o migración para los formatos soportados.

## Exportación

Las exportaciones visuales se construyen a partir del diagrama renderizado y el proyecto JSON conserva los datos editables. Una futura exportación SQL debe consumir el modelo lógico validado, no reconstruir reglas desde componentes visuales.

## Regla de diseño

Si una regla afecta la validez o semántica del modelo, debe vivir en `domain/` y tener una prueba enfocada. Los componentes deben ocuparse de presentar el estado y traducir interacciones a operaciones del store.
