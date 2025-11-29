import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

interface LineItem {
  hsn_code: string;
  description: string;
  quantity: number;
  rate: number;
  cgst_percent: number;
  sgst_percent: number;
  igst_percent: number;
}

interface InvoiceFormProps {
  token: string;
  onSuccess: () => void;
  onClose: () => void;
  order_id?: string;
}

export default function InvoiceForm({ token, onSuccess, onClose, order_id }: InvoiceFormProps) {
  const [customerName, setCustomerName] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [customerGstin, setCustomerGstin] = useState<string>("");
  const [customerAddress, setCustomerAddress] = useState<string>("");
  const [deliveryNoteNo, setDeliveryNoteNo] = useState<string>("");
  const [buyerOrderNo, setBuyerOrderNo] = useState<string>("");
  const [dispatchThrough, setDispatchThrough] = useState<string>("");
  const [dispatchDocNo, setDispatchDocNo] = useState<string>("");
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      hsn_code: "",
      description: "",
      quantity: 1,
      rate: 0,
      cgst_percent: 0,
      sgst_percent: 0,
      igst_percent: 0,
    },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLineItemChange = (
    index: number,
    field: keyof LineItem,
    value: any
  ) => {
    const newLineItems = [...lineItems];
    newLineItems[index] = {
      ...newLineItems[index],
      [field]: value,
    };
    setLineItems(newLineItems);
  };

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        hsn_code: "",
        description: "",
        quantity: 1,
        rate: 0,
        cgst_percent: 0,
        sgst_percent: 0,
        igst_percent: 0,
      },
    ]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    } else {
      toast.error("At least one line item is required");
    }
  };

  const calculateLineItemTotal = (item: LineItem) => {
    const amount = item.quantity * item.rate;
    const totalTax = amount * ((item.cgst_percent + item.sgst_percent + item.igst_percent) / 100);
    return amount + totalTax;
  };

  const calculateGrandTotal = () => {
    return lineItems.reduce((sum, item) => sum + calculateLineItemTotal(item), 0) * (1 - discountPercent / 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName || !customerEmail || lineItems.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(
        "http://localhost:8000/invoices/gst",
        {
          order_id: order_id || null,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_gstin: customerGstin || null,
          customer_address: customerAddress || null,
          delivery_note_no: deliveryNoteNo || null,
          buyer_order_no: buyerOrderNo || null,
          dispatch_through: dispatchThrough || null,
          dispatch_doc_no: dispatchDocNo || null,
          line_items: lineItems,
          discount_percent: discountPercent,
          notes: notes || null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Invoice created successfully!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to create invoice");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Create GST Invoice</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-800 rounded-full p-2"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Email *
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GSTIN
              </label>
              <input
                type="text"
                value={customerGstin}
                onChange={(e) => setCustomerGstin(e.target.value)}
                placeholder="e.g., 22AABCT1234H1Z0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Note No.
              </label>
              <input
                type="text"
                value={deliveryNoteNo}
                onChange={(e) => setDeliveryNoteNo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buyer Order No.
              </label>
              <input
                type="text"
                value={buyerOrderNo}
                onChange={(e) => setBuyerOrderNo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dispatch Through
              </label>
              <input
                type="text"
                value={dispatchThrough}
                onChange={(e) => setDispatchThrough(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dispatch Document No.
              </label>
              <input
                type="text"
                value={dispatchDocNo}
                onChange={(e) => setDispatchDocNo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Terms & Conditions / Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Payment terms, delivery conditions"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Line Items</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">HSN Code</th>
                    <th className="px-4 py-2 text-left">Description</th>
                    <th className="px-4 py-2 text-center">Qty</th>
                    <th className="px-4 py-2 text-right">Rate</th>
                    <th className="px-4 py-2 text-center">CGST %</th>
                    <th className="px-4 py-2 text-center">SGST %</th>
                    <th className="px-4 py-2 text-center">IGST %</th>
                    <th className="px-4 py-2 text-right">Total</th>
                    <th className="px-4 py-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={item.hsn_code}
                          onChange={(e) =>
                            handleLineItemChange(index, "hsn_code", e.target.value)
                          }
                          placeholder="8448"
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            handleLineItemChange(index, "description", e.target.value)
                          }
                          placeholder="Product Description"
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleLineItemChange(index, "quantity", parseInt(e.target.value) || 1)
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) =>
                            handleLineItemChange(index, "rate", parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={item.cgst_percent}
                          onChange={(e) =>
                            handleLineItemChange(index, "cgst_percent", parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={item.sgst_percent}
                          onChange={(e) =>
                            handleLineItemChange(index, "sgst_percent", parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={item.igst_percent}
                          onChange={(e) =>
                            handleLineItemChange(index, "igst_percent", parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                        />
                      </td>
                      <td className="px-4 py-2 text-right font-semibold">
                        ₹{calculateLineItemTotal(item).toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeLineItem(index)}
                          className="text-red-600 hover:text-red-800 font-bold"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={addLineItem}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              + Add Line Item
            </button>
          </div>

          <div className="border-t pt-4 bg-gray-50 rounded-lg p-4">
            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">Grand Total:</span>
                  <span className="text-xl font-bold text-green-600">
                    ₹{calculateGrandTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-end border-t pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
            >
              {isLoading ? "Creating..." : "Create Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
