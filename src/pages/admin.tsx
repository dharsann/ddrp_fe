import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/router";
import { Order, RawMaterial, Invoice } from "../types/types";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../components/Navbar";
import InvoiceForm from "../components/InvoiceForm";
import InvoicePreview from "../components/InvoicePreview";

type OrderStatus = "Pending" | "In Production" | "Dispatched" | "Delivered";

export default function AdminPage() {
  const { token, role, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filter, setFilter] = useState<OrderStatus | "All">("All");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [isDelayCheckLoading, setIsDelayCheckLoading] = useState<boolean>(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [newExpectedDate, setNewExpectedDate] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("orders");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isBillingLoading, setIsBillingLoading] = useState<boolean>(false);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [isInventoryLoading, setIsInventoryLoading] = useState<boolean>(false);
  const [showInventoryForm, setShowInventoryForm] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [inventoryForm, setInventoryForm] = useState({
    batch_no: "",
    recipe_no: "",
    raw_material_quantity: "",
    rubber_type: ""
  });
  const [showGstInvoiceForm, setShowGstInvoiceForm] = useState<boolean>(false);
  const [previewInvoiceId, setPreviewInvoiceId] = useState<string | null>(null);
  const [isStatusConfirmModalOpen, setIsStatusConfirmModalOpen] = useState<boolean>(false);
  const [isStatusSuccessModalOpen, setIsStatusSuccessModalOpen] = useState<boolean>(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{orderId: string, status: OrderStatus, orderProduct: string} | null>(null);
  const [isInvoiceDeleteModalOpen, setIsInvoiceDeleteModalOpen] = useState<boolean>(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [isMaterialDeleteModalOpen, setIsMaterialDeleteModalOpen] = useState<boolean>(false);
  const [materialToDelete, setMaterialToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (role !== "admin" || !token) {
        router.push("/login");
      } else {
        fetchOrders();
        fetchRawMaterials();
        fetchInvoices();
        // Set default tab if not set
        if (!activeTab) {
          setActiveTab("orders");
        }
      }
    }
  }, [role, token, authLoading, router]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get<Order[]>("https://ddrp-be.onrender.com/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (err) {
      toast.error("Failed to fetch orders. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRawMaterials = async () => {
    setIsInventoryLoading(true);
    try {
      const res = await axios.get<RawMaterial[]>("https://ddrp-be.onrender.com/raw-materials", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRawMaterials(res.data);
    } catch (err) {
      toast.error("Failed to fetch raw materials. Please try again.");
    } finally {
      setIsInventoryLoading(false);
    }
  };

  const fetchInvoices = async () => {
    setIsBillingLoading(true);
    try {
      const res = await axios.get("https://ddrp-be.onrender.com/invoices", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInvoices(res.data);
    } catch (err) {
      toast.error("Failed to fetch invoices. Please try again.");
    } finally {
      setIsBillingLoading(false);
    }
  };

  const handleAddInventory = async () => {
    if (!selectedOrder) return;
    try {
      await axios.post("https://ddrp-be.onrender.com/raw-materials", {
        order_id: selectedOrder.id,
        ...inventoryForm
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Raw material inventory added successfully!");
      setShowInventoryForm(false);
      setSelectedOrder(null);
      setInventoryForm({
        batch_no: "",
        recipe_no: "",
        raw_material_quantity: "",
        rubber_type: ""
      });
      fetchRawMaterials();
    } catch (err) {
      toast.error("Failed to add raw material inventory. Please try again.");
    }
  };



  const handleViewPDF = async (invoiceId: string) => {
    try {
      const response = await axios.get(`https://ddrp-be.onrender.com/invoices/${invoiceId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Failed to download PDF. Please try again.");
    }
  };

  const updateInvoiceStatus = async (id: string, status: string) => {
    try {
      await axios.put(
        `https://ddrp-be.onrender.com/invoices/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchInvoices();
      toast.success("Invoice status updated successfully!");
    } catch (err) {
      toast.error("Failed to update invoice status. Please try again.");
    }
  };

  const handleConsumeMaterial = async (materialId: string) => {
    try {
      await axios.put(`https://ddrp-be.onrender.com/raw-materials/${materialId}/consume`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Raw material marked as consumed!");
      fetchRawMaterials();
    } catch (err) {
      toast.error("Failed to mark as consumed. Please try again.");
    }
  };

  const handleDeleteMaterial = (materialId: string) => {
    setMaterialToDelete(materialId);
    setIsMaterialDeleteModalOpen(true);
  };

  const confirmDeleteMaterial = async () => {
    if (!materialToDelete) return;
    try {
      await axios.delete(`https://ddrp-be.onrender.com/raw-materials/${materialToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Raw material deleted successfully!");
      fetchRawMaterials();
    } catch (err) {
      toast.error("Failed to delete raw material. Please try again.");
    } finally {
      setIsMaterialDeleteModalOpen(false);
      setMaterialToDelete(null);
    }
  };

  const checkNaturalAlerts = async () => {
    try {
      await axios.post("https://ddrp-be.onrender.com/raw-materials/check-natural-alerts", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Natural rubber alerts checked!");
    } catch (err) {
      toast.error("Failed to check natural rubber alerts. Please try again.");
    }
  };

  const handleStatusUpdate = (id: string, status: OrderStatus) => {
    const order = orders.find(o => o.id === id);
    if (order) {
      setPendingStatusUpdate({
        orderId: id,
        status: status,
        orderProduct: order.product
      });
      setIsStatusConfirmModalOpen(true);
    }
  };

  const confirmStatusUpdate = async () => {
    if (!pendingStatusUpdate) return;
    
    try {
      await axios.put(
        `https://ddrp-be.onrender.com/orders/${pendingStatusUpdate.orderId}/status`,
        { status: pendingStatusUpdate.status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
      setIsStatusConfirmModalOpen(false);
      setPendingStatusUpdate(null);
      setIsStatusSuccessModalOpen(true);
    } catch (err) {
      toast.error("Failed to update status. Please try again.");
      setIsStatusConfirmModalOpen(false);
      setPendingStatusUpdate(null);
    }
  };

  const cancelStatusUpdate = () => {
    setIsStatusConfirmModalOpen(false);
    setPendingStatusUpdate(null);
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    setInvoiceToDelete(invoiceId);
    setIsInvoiceDeleteModalOpen(true);
  };

  const confirmDeleteInvoice = async () => {
    if (!invoiceToDelete) return;
    try {
      await axios.delete(`https://ddrp-be.onrender.com/invoices/${invoiceToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchInvoices();
      toast.success("Invoice deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete invoice. Please try again.");
    } finally {
      setIsInvoiceDeleteModalOpen(false);
      setInvoiceToDelete(null);
    }
  };

  const handleDelete = (id: string) => {
    setOrderToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;
    try {
      await axios.delete(`https://ddrp-be.onrender.com/orders/${orderToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchOrders();
      toast.success("Order deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete order. Please try again.");
    } finally {
      setIsDeleteModalOpen(false);
      setOrderToDelete(null);
    }
  };

  const checkForDelays = async () => {
    setIsDelayCheckLoading(true);
    try {
      await axios.post("https://ddrp-be.onrender.com/orders/check-delays", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Delay check completed!");
    } catch (err) {
      toast.error("Failed to check for delays. Please try again.");
    } finally {
      setIsDelayCheckLoading(false);
    }
  };

  const startEditingDate = (order: Order) => {
    setEditingOrder(order);
    setNewExpectedDate(order.expected_delivery_date ? new Date(order.expected_delivery_date).toISOString().split('T')[0] : "");
  };

  const saveExpectedDate = async () => {
    if (!editingOrder || !newExpectedDate) return;
    try {
      await axios.put(`https://ddrp-be.onrender.com/orders/${editingOrder.id}/expected-delivery`, {
        expected_delivery_date: new Date(newExpectedDate).toISOString()
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchOrders();
      setEditingOrder(null);
      setNewExpectedDate("");
      toast.success("Expected delivery date updated!");
    } catch (err) {
      toast.error("Failed to update expected delivery date. Please try again.");
    }
  };

  const cancelEditing = () => {
    setEditingOrder(null);
    setNewExpectedDate("");
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.id.toString().includes(searchTerm);
    const matchesFilter = filter === "All" || o.status === filter;
    return matchesSearch && matchesFilter;
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!token || role !== "admin") {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Admin Dashboard</h1>
              <p className="text-slate-600">Manage customer orders and inventory</p>
            </div>
          </div>

          {activeTab === "orders" && (
            <>
              {/* Search and Filter */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <input
                    type="text"
                    placeholder="Search by product, customer, or order ID..."
                    className="flex-1 p-2 border rounded-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilter("All")}
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${filter === "All" ? "bg-slate-600 text-white" : "bg-slate-200 text-slate-800"}`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilter("Pending")}
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${filter === "Pending" ? "bg-amber-600 text-white" : "bg-amber-100 text-amber-800"}`}
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => setFilter("In Production")}
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${filter === "In Production" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-800"}`}
                    >
                      In Production
                    </button>
                    <button
                      onClick={() => setFilter("Dispatched")}
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${filter === "Dispatched" ? "bg-orange-600 text-white" : "bg-orange-100 text-orange-800"}`}
                    >
                      Dispatched
                    </button>
                    <button
                      onClick={() => setFilter("Delivered")}
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${filter === "Delivered" ? "bg-emerald-600 text-white" : "bg-emerald-100 text-emerald-800"}`}
                    >
                      Delivered
                    </button>
                  </div>
                  <button
                    onClick={checkForDelays}
                    disabled={isDelayCheckLoading}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition duration-200 disabled:opacity-50"
                  >
                    {isDelayCheckLoading ? "Checking..." : "Check for Delays"}
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === "billing" && (
            <>
              {/* Billing Actions */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-black">Invoice Management</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowGstInvoiceForm(true)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition duration-200"
                    >
                      + GST Invoice
                    </button>
                    <button
                      onClick={fetchInvoices}
                      className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition duration-200"
                    >
                      Refresh
                    </button>
                  </div>
                </div>

                {/* Invoice List */}
                {isBillingLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : invoices.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-black text-lg">No invoices found.</p>
                    <p className="text-black text-sm mt-2">Create invoices for completed orders.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {invoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition duration-200"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-black text-base mb-2">
                              Invoice #{invoice.invoice_number}
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-black mb-3">
                              {invoice.order_id && <p>Order: #{invoice.order_id}</p>}
                              <p>Customer: {invoice.customer_name}</p>
                              <p>Issued: {new Date(invoice.issue_date).toLocaleDateString()}</p>
                              <p>Due: {new Date(invoice.due_date).toLocaleDateString()}</p>
                            </div>

                            {invoice.line_items && invoice.line_items.length > 0 && (
                              <div className="mb-3 overflow-x-auto">
                                <table className="w-full text-xs">
                                  <thead className="bg-gray-200">
                                    <tr>
                                      <th className="px-2 py-1 text-left">Description</th>
                                      <th className="px-2 py-1 text-center">Qty</th>
                                      <th className="px-2 py-1 text-right">Rate</th>
                                      <th className="px-2 py-1 text-right">Amount</th>
                                      <th className="px-2 py-1 text-right">Tax</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {invoice.line_items.map((item, idx) => (
                                      <tr key={idx} className="border-b">
                                        <td className="px-2 py-1">{item.description}</td>
                                        <td className="px-2 py-1 text-center">{item.quantity}</td>
                                        <td className="px-2 py-1 text-right">₹{item.rate.toFixed(2)}</td>
                                        <td className="px-2 py-1 text-right">₹{item.amount.toFixed(2)}</td>
                                        <td className="px-2 py-1 text-right">₹{(item.cgst_amount + item.sgst_amount + item.igst_amount).toFixed(2)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}

                            <div className="bg-white rounded p-2 mb-3">
                              <div className="flex justify-between text-xs text-black mb-1">
                                <span>Subtotal:</span>
                                <span>₹{invoice.subtotal.toFixed(2)}</span>
                              </div>
                              {invoice.total_tax > 0 && (
                                <div className="flex justify-between text-xs text-black mb-1">
                                  <span>Tax (CGST+SGST+IGST):</span>
                                  <span>₹{invoice.total_tax.toFixed(2)}</span>
                                </div>
                              )}
                              {invoice.discount_amount > 0 && (
                                <div className="flex justify-between text-xs text-black mb-1">
                                  <span>Discount:</span>
                                  <span>-₹{invoice.discount_amount.toFixed(2)}</span>
                                </div>
                              )}
                              <div className="border-t flex justify-between text-sm font-bold text-black">
                                <span>Total:</span>
                                <span>₹{invoice.final_amount.toFixed(2)}</span>
                              </div>
                            </div>

                            <span
                              className={`text-xs font-medium px-2 py-1 rounded-full inline-block ${
                                invoice.status === "Paid"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : invoice.status === "Pending"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-slate-100 text-slate-800"
                              }`}
                            >
                              {invoice.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => setPreviewInvoiceId(invoice.id)}
                            className="flex-1 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition duration-200"
                          >
                            👁️ View & Print
                          </button>
                          <button
                            onClick={() => handleViewPDF(invoice.id)}
                            className="flex-1 px-2 py-1 bg-indigo-500 hover:bg-indigo-600 text-white text-xs rounded transition duration-200"
                          >
                            ⬇️ Download
                          </button>
                          <button
                            onClick={() => updateInvoiceStatus(invoice.id, "Paid")}
                            className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded transition duration-200"
                          >
                            Mark Paid
                          </button>
                          <button
                            onClick={() => handleDeleteInvoice(invoice.id)}
                            className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition duration-200"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}


              </div>
            </>
          )}

          {activeTab === "inventory" && (
            <>
              {/* Inventory Actions */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-black">Raw Materials Inventory</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={checkNaturalAlerts}
                      className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded-lg transition duration-200"
                    >
                      Check Natural Alerts
                    </button>
                    <button
                      onClick={fetchRawMaterials}
                      className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition duration-200"
                    >
                      Refresh
                    </button>
                  </div>
                </div>

                {/* Inventory List */}
                {isInventoryLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : rawMaterials.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-black text-lg">No raw materials found.</p>
                    <p className="text-black text-sm mt-2">Add inventory for orders to see them here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rawMaterials.map((material) => (
                      <div
                        key={material.id}
                        className="bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition duration-200"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-black text-sm mb-1">
                              Order #{material.order_id}
                            </h3>
                            <p className="text-xs text-black">Batch: {material.batch_no}</p>
                            <p className="text-xs text-black">Recipe: {material.recipe_no}</p>
                            <p className="text-xs text-black">Quantity: {material.raw_material_quantity} kg</p>
                            <p className="text-xs text-black">Type: {material.rubber_type}</p>
                            <p className="text-xs text-black">Arrived: {new Date(material.arrival_date).toLocaleDateString()}</p>
                            {material.consumption_deadline && (
                              <p className={`text-xs ${new Date(material.consumption_deadline) < new Date() && !material.consumption_date ? "text-red-600 font-semibold" : "text-black"}`}>
                                Deadline: {new Date(material.consumption_deadline).toLocaleDateString()}
                                {new Date(material.consumption_deadline) < new Date() && !material.consumption_date && " (Overdue)"}
                              </p>
                            )}
                            {material.consumption_date && (
                              <p className="text-xs text-green-600">Consumed: {new Date(material.consumption_date).toLocaleDateString()}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 mt-2">
                          {!material.consumption_date && (
                            <button
                              onClick={() => handleConsumeMaterial(material.id)}
                              className="flex-1 px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded transition duration-200"
                            >
                              Mark as Consumed
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteMaterial(material.id)}
                            className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition duration-200"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Inventory Button */}
                <div className="mt-6">
                  <button
                    onClick={() => setShowInventoryForm(!showInventoryForm)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition duration-200"
                  >
                    {showInventoryForm ? "Cancel" : "Add Raw Material"}
                  </button>
                </div>

                {/* Add Inventory Form */}
                {showInventoryForm && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg border">
                    <h3 className="text-lg font-semibold mb-4 text-black">Add Raw Material Inventory</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <select
                        value={selectedOrder?.id || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          const order = orders.find(o => o.id === value);
                          setSelectedOrder(order || null);
                        }}
                        className="p-2 border rounded-lg text-black"
                      >
                        <option value="">Select Order</option>
                        {orders.filter(o => o.status !== "Delivered").map((order) => (
                          <option key={order.id} value={order.id}>
                            Order #{order.id} - {order.product} (Qty: {order.quantity})
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Batch No"
                        value={inventoryForm.batch_no}
                        onChange={(e) => setInventoryForm({...inventoryForm, batch_no: e.target.value})}
                        className="p-2 border rounded-lg text-black"
                      />
                      <input
                        type="text"
                        placeholder="Recipe No"
                        value={inventoryForm.recipe_no}
                        onChange={(e) => setInventoryForm({...inventoryForm, recipe_no: e.target.value})}
                        className="p-2 border rounded-lg text-black"
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Quantity (kg)"
                        value={inventoryForm.raw_material_quantity}
                        onChange={(e) => setInventoryForm({...inventoryForm, raw_material_quantity: e.target.value})}
                        className="p-2 border rounded-lg text-black"
                      />
                      <select
                        value={inventoryForm.rubber_type}
                        onChange={(e) => setInventoryForm({...inventoryForm, rubber_type: e.target.value})}
                        className="p-2 border rounded-lg text-black"
                      >
                        <option value="">Select Rubber Type</option>
                        <option value="Natural">Natural</option>
                        <option value="Nitrile">Nitrile</option>
                        <option value="EPDM">EPDM</option>
                        <option value="Neoprene">Neoprene</option>
                        <option value="Styrene Butadiene">Styrene Butadiene</option>
                        <option value="Butyl">Butyl</option>
                        <option value="Silicone">Silicone</option>
                      </select>
                    </div>
                    <button
                      onClick={handleAddInventory}
                      disabled={!selectedOrder || !inventoryForm.batch_no || !inventoryForm.rubber_type || !inventoryForm.raw_material_quantity || parseFloat(inventoryForm.raw_material_quantity) <= 0}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition duration-200 disabled:opacity-50"
                    >
                      Add Inventory
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === "orders" && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
              <h2 className="text-xl font-semibold text-slate-800 mb-6">All Orders</h2>
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500 text-lg">No orders found.</p>
                  <p className="text-slate-400 text-sm mt-2">Try adjusting your search or filter.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredOrders.map((o) => (
                    <div
                      key={o.id}
                      className="bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition duration-200 relative"
                    >
                      <button
                        onClick={() => handleDelete(o.id)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition"
                        aria-label="Delete order"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800 text-sm mb-1 flex items-center gap-1">
                            {o.product}
                            {o.status === "Pending" && (
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </h3>
                          <p className="text-xs text-slate-500">Order: {o.id} </p>
                          <p className="text-xs text-slate-500">Qty: {o.quantity}</p>
                          {o.user_name && <p className="text-xs text-slate-400">Customer: {o.user_name}</p>}
                          {o.user_phone && <p className="text-xs text-slate-400">Phone: {o.user_phone}</p>}
                          <p className="text-xs text-slate-400">Ordered: {new Date(o.order_date).toLocaleDateString()}</p>
                          {o.expected_delivery_date && (
                            <div className="mt-1">
                              {editingOrder?.id === o.id ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="date"
                                    value={newExpectedDate}
                                    onChange={(e) => setNewExpectedDate(e.target.value)}
                                    className="text-xs px-2 py-1 border rounded"
                                  />
                                  <button
                                    onClick={saveExpectedDate}
                                    className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={cancelEditing}
                                    className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <p className={`text-xs ${new Date(o.expected_delivery_date) < new Date() && o.status !== "Delivered" ? "text-red-600 font-semibold" : "text-slate-400"}`}>
                                    Expected: {new Date(o.expected_delivery_date).toLocaleDateString()}
                                    {new Date(o.expected_delivery_date) < new Date() && o.status !== "Delivered" && " (Delayed)"}
                                  </p>
                                  <button
                                    onClick={() => startEditingDate(o)}
                                    className="text-xs text-blue-500 hover:text-blue-700 underline"
                                  >
                                    Edit
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full mt-2 inline-block ${
                              o.status === "Pending"
                                ? "bg-amber-100 text-amber-800"
                                : o.status === "In Production"
                                ? "bg-blue-100 text-blue-800"
                                : o.status === "Dispatched"
                                ? "bg-orange-100 text-orange-800"
                                : o.status === "Delivered"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-800"
                            }`}
                          >
                            {o.status}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <button
                          onClick={() => handleStatusUpdate(o.id, "Pending")}
                          className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs rounded transition duration-200"
                        >
                          Pending
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(o.id, "In Production")}
                          className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition duration-200"
                        >
                          In Production
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(o.id, "Dispatched")}
                          className="px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white text-xs rounded transition duration-200"
                        >
                          Dispatched
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(o.id, "Delivered")}
                          className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs rounded transition duration-200"
                        >
                          Delivered
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          </div>
        </div>
  
        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg text-black font-semibold mb-4">Confirm Deletion</h3>
              <p className="mb-4 text-black">Are you sure you want to delete this order? This action cannot be undone.</p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 text-black bg-slate-200 rounded-lg hover:bg-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-black bg-red-600 rounded-lg hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* GST Invoice Form Modal */}
        {showGstInvoiceForm && (
          <InvoiceForm
            token={token}
            onSuccess={fetchInvoices}
            onClose={() => setShowGstInvoiceForm(false)}
          />
        )}

        {/* Invoice Preview Modal */}
        {previewInvoiceId && (
          <InvoicePreview
            invoiceId={previewInvoiceId}
            token={token}
            onClose={() => setPreviewInvoiceId(null)}
          />
        )}

        {/* Status Update Confirmation Modal */}
        {isStatusConfirmModalOpen && pendingStatusUpdate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg text-black font-semibold mb-4">Confirm Status Update</h3>
              <p className="mb-4 text-black">
                Are you sure you want to update the status of <strong>"{pendingStatusUpdate.orderProduct}"</strong> to <strong>"{pendingStatusUpdate.status}"</strong>?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={cancelStatusUpdate}
                  className="px-4 py-2 text-black bg-slate-200 rounded-lg hover:bg-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStatusUpdate}
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Update Success Modal */}
        {isStatusSuccessModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 className="text-lg text-black font-semibold mb-2">Status Updated Successfully!</h3>
                <p className="mb-6 text-gray-600">The order status has been updated successfully.</p>
                <button
                  onClick={() => setIsStatusSuccessModalOpen(false)}
                  className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Delete Confirmation Modal */}
        {isInvoiceDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg text-black font-semibold mb-4">Confirm Invoice Deletion</h3>
              <p className="mb-4 text-black">Are you sure you want to delete this invoice? This action cannot be undone.</p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsInvoiceDeleteModalOpen(false)}
                  className="px-4 py-2 text-black bg-slate-200 rounded-lg hover:bg-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteInvoice}
                  className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Raw Material Delete Confirmation Modal */}
        {isMaterialDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg text-black font-semibold mb-4">Confirm Raw Material Deletion</h3>
              <p className="mb-4 text-black">Are you sure you want to delete this raw material entry? This action cannot be undone.</p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsMaterialDeleteModalOpen(false)}
                  className="px-4 py-2 text-black bg-slate-200 rounded-lg hover:bg-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteMaterial}
                  className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
}
