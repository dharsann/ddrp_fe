export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface Order {
  id: string;
  user_id: string;
  product: string;
  quantity: number;
  status: string;
  order_date: string;
  expected_delivery_date?: string;
  user_name?: string;
  user_phone?: string;
}

export interface RawMaterial {
  id: string;
  order_id: string;
  batch_no: string;
  recipe_no: string;
  raw_material_quantity: number;
  rubber_type: string;
  arrival_date: string;
  consumption_date?: string | null;
  consumption_deadline?: string | null;
}

export interface InvoiceLineItem {
  id: string;
  invoice_id: string;
  hsn_code: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  cgst_percent: number;
  sgst_percent: number;
  igst_percent: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  total_with_tax: number;
}

export interface Invoice {
  id: string;
  order_id?: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  customer_gstin?: string;
  customer_address?: string;
  line_items: InvoiceLineItem[];
  subtotal: number;
  total_cgst: number;
  total_sgst: number;
  total_igst: number;
  total_tax: number;
  discount_amount: number;
  final_amount: number;
  status: string;
  issue_date: string;
  due_date: string;
  notes?: string;
}
