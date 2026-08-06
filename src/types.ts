export type ActionType = 'INTAKE' | 'OUTTAKE' | null;
export type TDMAType = 'YES' | 'NO' | null;

export interface WorkflowState {
  currentStep: number; // 1 to 5
  action: ActionType;
  tdma: TDMAType;
  serialNumber: string;
  division: string | null;
}

export interface EquipmentRecord {
  id: string;
  timestamp: string;
  action: 'INTAKE' | 'OUTTAKE';
  tdma: 'YES' | 'NO';
  serialNumber: string;
  division: string;
  loggedBy?: string;
}

export interface DivisionItem {
  id: string;
  name: string;
  isCustom?: boolean;
}

export type ThemeMode = 'dark' | 'light' | 'high-contrast';
