"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // State UI thuần túy để bật/tắt hiển thị mật khẩu
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Đăng nhập thất bại");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen w-full flex-col justify-between bg-[#F9F5F1] px-6 py-8 text-[#1A1A1A] selection:bg-[#1A1A1A] selection:text-[#F9F5F1]">
      {/* Main Content */}
      <main className="mx-auto my-auto w-full max-w-[380px] py-12">
        <div className="mb-9">
          <p className="mb-2 font-mono text-[11px] tracking-[0.12em] text-[#78736D] uppercase">
            [ Admin Access ]
          </p>
          <h1 className="text-[28px] leading-tight font-medium tracking-[-0.03em] text-[#1A1A1A]">
            Đăng nhập hệ thống
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email Field */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="flex items-center justify-between font-mono text-[11px] tracking-wider text-[#5C5752] uppercase"
            >
              <span>Email</span>
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@aibook.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[#DCD5CC] bg-[#FDFBF9] px-3.5 py-3 text-sm text-[#1A1A1A] placeholder:text-[#B0A99F] transition-colors duration-150 outline-none hover:border-[#A39D95] focus:border-[#1A1A1A] focus:bg-white"
              required
            />
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="flex items-center justify-between font-mono text-[11px] tracking-wider text-[#5C5752] uppercase"
            >
              <span>Mật khẩu</span>
            </label>
            <div className="relative flex items-center">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[#DCD5CC] bg-[#FDFBF9] py-3 pr-14 pl-3.5 text-sm text-[#1A1A1A] placeholder:text-[#B0A99F] transition-colors duration-150 outline-none hover:border-[#A39D95] focus:border-[#1A1A1A] focus:bg-white"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 font-mono text-[11px] tracking-wider text-[#78736D] uppercase transition-colors hover:text-[#1A1A1A]"
              >
                {showPassword ? "Ẩn" : "Hiện"}
              </button>
            </div>
          </div>

          {/* Error Alert - Gọn gàng, sắc nét */}
          {error && (
            <div className="rounded-lg border border-[#D94E4E]/30 bg-[#F4E6E4] px-3.5 py-2.5 text-xs font-medium text-[#B83232]">
              {error}
            </div>
          )}

          {/* Submit Button - Tương phản cao, không bóng đổ màu mè */}
          <button
            type="submit"
            disabled={loading}
            className="mt-3 flex w-full cursor-pointer items-center justify-center rounded-lg bg-[#1A1A1A] px-4 py-3.5 text-sm font-medium tracking-wide text-[#F9F5F1] transition-all duration-150 hover:bg-[#333333] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Đang xác thực..." : "Tiếp tục →"}
          </button>
        </form>
      </main>
    </div>
  );
}
