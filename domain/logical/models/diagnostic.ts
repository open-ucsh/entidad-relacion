export type LogicalDiagnosticSeverity = 'warning' | 'error';

export interface LogicalDiagnostic {
  id: string;
  severity: LogicalDiagnosticSeverity;
  message: string;
  sourceElementId: string | null;
}
