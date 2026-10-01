import type { LogicalRelationCardinality } from '@/domain/logical/models';

export type CardinalityValue = '0..1' | '1..1' | '0..N' | '1..N';

export const CARDINALITY_OPTIONS: {
  value: CardinalityValue;
  label: string;
  cardinality: LogicalRelationCardinality;
}[] = [
  {
    value: '0..1',
    label: '0..1',
    cardinality: {
      minimum: 0,
      maximum: 1,
    },
  },
  {
    value: '1..1',
    label: '1..1',
    cardinality: {
      minimum: 1,
      maximum: 1,
    },
  },
  {
    value: '0..N',
    label: '0..N',
    cardinality: {
      minimum: 0,
      maximum: 'N',
    },
  },
  {
    value: '1..N',
    label: '1..N',
    cardinality: {
      minimum: 1,
      maximum: 'N',
    },
  },
];

export function getCardinalityValue(cardinality: LogicalRelationCardinality): CardinalityValue {
  if (cardinality.minimum === 0 && cardinality.maximum === 1) {
    return '0..1';
  }

  if (cardinality.minimum === 1 && cardinality.maximum === 1) {
    return '1..1';
  }

  if (cardinality.minimum === 1 && cardinality.maximum === 'N') {
    return '1..N';
  }

  return '0..N';
}

export function getCardinality(value: CardinalityValue): LogicalRelationCardinality {
  return (
    CARDINALITY_OPTIONS.find((option) => option.value === value)?.cardinality ?? {
      minimum: 0,
      maximum: 'N',
    }
  );
}
