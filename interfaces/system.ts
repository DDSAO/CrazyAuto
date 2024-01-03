export interface Sequence {
  type: string;
  seq: number;
  updatedAt: number;
}

export type SMSMessage = {
  phone: string;
  parsedNumber?: string;
  text: string;
  serialNumber: string;
  type: string;
  success: boolean;
  createdAt: number;
  createdBy: string;
  error?: string;
  customer_id?: number | null;
  customer_name?: string | null;
};
