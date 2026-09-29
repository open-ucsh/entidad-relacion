import type { LogicalDiagnostic } from './diagnostic';
import type { LogicalTable } from './table';

export interface LogicalModel {
  tables: LogicalTable[];
  diagnostics: LogicalDiagnostic[];
}
