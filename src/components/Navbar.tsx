import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";

interface NavbarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  showTabs?: boolean;
}

export default function Navbar({ activeTab, onTabChange, showTabs = true }: NavbarProps) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <nav className="bg-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold">DDRP</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {showTabs && activeTab && onTabChange && (
              <div className="flex space-x-4">
                <button
                  onClick={() => onTabChange("orders")}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === "orders"
                      ? "bg-slate-700 text-white"
                      : "text-slate-300 hover:text-white hover:bg-slate-700"
                  }`}
                >
                  Orders
                </button>
                <button
                  onClick={() => onTabChange("inventory")}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === "inventory"
                      ? "bg-slate-700 text-white"
                      : "text-slate-300 hover:text-white hover:bg-slate-700"
                  }`}
                >
                  Inventory
                </button>
                <button
                  onClick={() => onTabChange("billing")}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === "billing"
                      ? "bg-slate-700 text-white"
                      : "text-slate-300 hover:text-white hover:bg-slate-700"
                  }`}
                >
                  Billing
                </button>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}