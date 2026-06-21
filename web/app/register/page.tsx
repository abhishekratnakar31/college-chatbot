"use client";

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Mail, Lock, User, ArrowRight, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const { registerWithEmail, loginWithGoogle, user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // If already logged in, redirect to home
  if (user) {
    router.push("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerWithEmail(email, password, name);
      router.push("/");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create account. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
      router.push("/");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to sign in with Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-black flex flex-col justify-center items-center p-6 relative overflow-hidden selection:bg-[#b69cc4]/30 font-sans">
      {/* Background elements */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#b69cc4]/[0.05] blur-[120px] rounded-full pointer-events-none" />

      {/* Back button */}
      <Link
        href="/"
        className="absolute top-6 left-6 md:top-10 md:left-10 flex items-center gap-2 text-zinc-600 hover:text-black text-xs font-black uppercase tracking-widest transition-colors"
      >
        <ChevronLeft size={16} />
        Back to Home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white border-2 border-black rounded-[2rem] p-8 md:p-10 shadow-[4px_4px_0px_0px_#000000] relative z-10 text-black"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-12 h-12 bg-[#b69cc4] border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-4 text-black">
            <GraduationCap className="text-black w-6 h-6" />
          </div>
          <h2 className="text-3xl font-serif font-black text-black tracking-tight">
            Create Account
          </h2>
          <p className="text-zinc-600 text-sm mt-1 font-bold">
            Join the academic intelligence engine
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border-2 border-red-500 text-red-700 text-xs font-bold px-4 py-3 rounded-lg mb-6 text-center shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">
              Full Name
            </label>
            <div className="relative flex items-center bg-white border-2 border-black rounded-lg transition-colors focus-within:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <User className="text-zinc-400 absolute left-4 w-4 h-4" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Morgan"
                className="w-full bg-transparent pl-12 pr-4 py-3.5 text-sm text-black placeholder:text-zinc-400 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">
              Email Address
            </label>
            <div className="relative flex items-center bg-white border-2 border-black rounded-lg transition-colors focus-within:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Mail className="text-zinc-400 absolute left-4 w-4 h-4" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                className="w-full bg-transparent pl-12 pr-4 py-3.5 text-sm text-black placeholder:text-zinc-400 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">
              Password
            </label>
            <div className="relative flex items-center bg-white border-2 border-black rounded-lg transition-colors focus-within:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Lock className="text-zinc-400 absolute left-4 w-4 h-4" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full bg-transparent pl-12 pr-4 py-3.5 text-sm text-black placeholder:text-zinc-400 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#b69cc4] text-black border-2 border-black font-black text-sm rounded-lg hover:bg-[#a387b3] transition-all hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shadow-[2px_2px_0px_0px_#000000] flex items-center justify-center gap-2 mt-8"
          >
            {loading ? "Registering..." : "Get Started"}
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="relative my-8 flex items-center justify-center">
          <div className="absolute inset-0 w-full border-t-2 border-black/10" />
          <span className="relative px-3 bg-white text-[10px] font-black text-zinc-500 uppercase tracking-widest">
            or signup with
          </span>
        </div>

        {/* Google OAuth SignUp */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          disabled={loading}
          className="w-full py-3.5 bg-white border-2 border-black text-black font-black text-sm rounded-lg hover:bg-zinc-50 transition-all hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shadow-[2px_2px_0px_0px_#000000] flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.137 4.2-3.414 0-6.173-2.77-6.173-6.185 0-3.415 2.76-6.185 6.173-6.185 1.545 0 2.946.568 4.032 1.51l3.076-3.076C19.23 2.158 15.97 1 12.24 1c-6.082 0-11 4.93-11 11s4.918 11 11 11c5.918 0 10.364-4.127 10.364-10.455 0-.6-.055-1.182-.146-1.77L12.24 10.285z"
            />
          </svg>
          Google Workspace
        </button>

        <p className="text-center text-zinc-600 text-xs mt-8 font-bold">
          Already have an account?{" "}
          <Link href="/login" className="text-black hover:underline font-extrabold">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
