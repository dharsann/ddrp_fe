import { useState, FormEvent } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const res = await axios.post("https://ddrp-be.onrender.com/token", formData);
      const token: string = res.data.access_token;

      const payload = JSON.parse(atob(token.split(".")[1]));
      const role: string = payload.role;
      const userId = typeof payload.user_id === "string" ? payload.user_id : undefined;

      login(token, role, userId);

      if (role === "admin") router.push("/admin");
      else router.push("/order");
    } catch {
      alert("Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 p-4">
      <div className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl p-10 border border-slate-200 hover:shadow-3xl transition-all duration-300">
        {/* Accent Glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 blur-xl -z-10" />

        {/* Logo & Heading */}
        <div className="text-center mb-10">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-md">
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-800 mb-2 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Sign in to <span className="text-indigo-600 font-semibold">DDRP</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
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
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 hover:border-blue-400"
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 hover:border-blue-400"
            />
          </div>

          <button
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Sign In
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
            Don’t have an account?{" "}
            <Link
              href="/register"
              className="text-blue-600 hover:text-indigo-700 font-semibold transition duration-200 underline underline-offset-4"
            >
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
