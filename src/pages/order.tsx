import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { Order } from "../types/types";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";

export default function OrderPage() {
  const { token, userId, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // Modal states
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !token) {
      router.push("/login");
    }
  }, [token, authLoading, router]);

  const fetchOrders = useCallback(async () => {
    if (!userId) {
      console.log("User ID not found in context");
      return;
    }
    try {
      const res = await axios.get<Order[]>(`https://ddrp-be.onrender.com/orders/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (error) {
      console.error("Failed to fetch orders", error);
      const axiosError = error as { response?: { status?: number; data?: { detail?: string } } };
      if (axiosError.response?.status === 401) {
        logout();
        router.push("/login");
      } else {
        setModalMessage("Failed to fetch orders: " + (axiosError.response?.data?.detail || "Unknown error"));
        setIsErrorModalOpen(true);
      }
    }
  }, [userId, token, logout, router]);

  useEffect(() => {
    if (token && userId) {
      fetchOrders();
    }
  }, [token, userId, fetchOrders]);

  const handlePlaceOrder = () => {
    if (!product.trim()) {
      setModalMessage("Please enter a product name");
      setIsErrorModalOpen(true);
      return;
    }
    setIsConfirmModalOpen(true);
  };

  const confirmPlaceOrder = async () => {
    setIsConfirmModalOpen(false);
    setIsLoading(true);
    try {
      const res = await axios.post<Order>(
        "https://ddrp-be.onrender.com/orders",
        { product: product.trim(), quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrderId(res.data.id);
      setModalMessage(`Order placed successfully! Order ID: ${res.data.id}`);
      setIsSuccessModalOpen(true);
      setProduct("");
      setQuantity(1);
      fetchOrders();
    } catch (error) {
      console.error("Order placement error:", error);
      const axiosError = error as { response?: { data?: { detail?: string } } };
      setModalMessage("Error placing order: " + (axiosError.response?.data?.detail || "Unknown error"));
      setIsErrorModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!token) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Place Your Order</h1>
              <p className="text-slate-600">Request custom rubber spare parts</p>
            </div>
          </div>

        {/* Order Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">New Order</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="product" className="block text-sm font-medium text-slate-700 mb-2">
                Product Name
              </label>
              <input
                id="product"
                type="text"
                placeholder="Describe the rubber spare part you need"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-slate-50"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-slate-700 mb-2">
                Quantity
              </label>
              <input
                id="quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-slate-50"
                disabled={isLoading}
              />
            </div>
          </div>
          <button
            onClick={handlePlaceOrder}
            disabled={isLoading || !product.trim()}
            className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg"
          >
            {isLoading ? "Placing Order..." : "Place Order"}
          </button>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-800">Your Orders</h2>
            <button
              onClick={fetchOrders}
              className="bg-slate-600 hover:bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              Refresh
            </button>
          </div>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 text-lg">No orders found.</p>
              <p className="text-slate-400 text-sm mt-2">Your placed orders will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <div key={o.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition duration-200 bg-slate-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800">{o.product}</h3>
                      <p className="text-sm text-slate-600 mt-1">Quantity: {o.quantity}</p>
                      <p className="text-sm text-slate-500 mt-1">Ordered on: {new Date(o.order_date).toLocaleDateString()}</p>
                      {o.expected_delivery_date && (
                        <p className={`text-sm mt-1 ${new Date(o.expected_delivery_date) < new Date() && o.status !== "Delivered" ? "text-red-600 font-semibold" : "text-slate-500"}`}>
                          Expected Delivery: {new Date(o.expected_delivery_date).toLocaleDateString()}
                          {new Date(o.expected_delivery_date) < new Date() && o.status !== "Delivered" && " (Delayed)"}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
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
              ))}
            </div>
          )}
        </div>
        {/* Confirmation Modal */}
        {isConfirmModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg text-black font-semibold mb-4">Confirm Order</h3>
              <p className="mb-4 text-black">
                Are you sure you want to place an order for {quantity} x {product.trim()}?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="px-4 py-2 text-black bg-slate-200 rounded-lg hover:bg-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmPlaceOrder}
                  className="px-4 py-2 text-black bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {isSuccessModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg text-black font-semibold mb-4">Order Placed</h3>
              <p className="mb-4 text-black">{modalMessage}</p>
              <div className="flex justify-end">
                <button
                  onClick={() => setIsSuccessModalOpen(false)}
                  className="px-4 py-2 text-black bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Modal */}
        {isErrorModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg text-black font-semibold mb-4">Error</h3>
              <p className="mb-4 text-black">{modalMessage}</p>
              <div className="flex justify-end">
                <button
                  onClick={() => setIsErrorModalOpen(false)}
                  className="px-4 py-2 text-black bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
