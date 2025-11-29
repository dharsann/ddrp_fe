import { useState, FormEvent } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import axios from "axios";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("https://ddrp-be.onrender.com/register", {
        name,
        email,
        phone,
        password,
      });
      setIsSuccessModalOpen(true);
    } catch (error) {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      alert(axiosError.response?.data?.detail || "Registration failed");
    }
  };

  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false);
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-slate-100 p-4">
      <div className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl p-10 border border-slate-200 hover:shadow-3xl transition-all duration-300">
        {/* Soft Glow Accent */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-green-500/10 blur-xl -z-10" />

        {/* Header */}
        <div className="text-center mb-10">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl mx-auto flex items-center justify-center shadow-md">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-800 mb-2 tracking-tight">
            Create Account
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Join{" "}
            <span className="text-emerald-600 font-semibold">
              DDRP
            </span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="group">
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-slate-700 mb-2"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200 hover:border-emerald-400"
            />
          </div>

          <div className="group">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-slate-700 mb-2"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200 hover:border-emerald-400"
            />
          </div>

          <div className="group">
            <label
              htmlFor="phone"
              className="block text-sm font-semibold text-slate-700 mb-2"
            >
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200 hover:border-emerald-400"
            />
          </div>

          <div className="group">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-slate-700 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200 hover:border-emerald-400"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Create Account
          </button>
        </form>

        {/* Divider */}
        <div className="my-8 flex items-center justify-center space-x-4">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-slate-400 text-xs uppercase font-semibold">
            or
          </span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-slate-600 text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-emerald-600 hover:text-emerald-800 font-semibold transition duration-200 underline underline-offset-4"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg text-black font-semibold mb-4">Registration Successful</h3>
            <p className="mb-4 text-black">Your account has been created successfully! Please login to continue.</p>
            <div className="flex justify-end">
              <button
                onClick={handleSuccessModalClose}
                className="px-4 py-2 text-black bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
