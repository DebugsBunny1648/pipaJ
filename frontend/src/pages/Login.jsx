import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Email and password required"); return; }
    setLoading(true);
    try {
      const u = await login(email, password);
      toast.success("Welcome back!");
      navigate(u.role === "admin" ? "/admin" : "/account");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div data-testid="login-page" className="max-w-md mx-auto px-6 py-20">
      <h1 className="font-serif-pipa text-5xl text-center mb-2">Welcome Back</h1>
      <p className="text-center text-[#4A4A4A] text-sm mb-10">Sign in to continue to Pipa</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          data-testid="login-email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-white border border-[#E5E0D8] px-3 py-3 text-sm outline-none focus:border-[#B45F45]"
        />
        <input
          data-testid="login-password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-white border border-[#E5E0D8] px-3 py-3 text-sm outline-none focus:border-[#B45F45]"
        />
        <button
          data-testid="login-submit"
          disabled={loading}
          className="w-full bg-[#1A1A1A] text-white py-3 text-xs uppercase tracking-widest hover:bg-[#B45F45] disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>
      <p className="text-center text-sm text-[#4A4A4A] mt-6">
        New here? <Link to="/signup" className="text-[#B45F45] hover:underline">Create account</Link>
      </p>
      <div className="mt-10 text-xs text-[#4A4A4A] bg-[#F3EFE9] p-4 border border-[#E5E0D8]">
        <p className="font-medium mb-1">Demo Accounts:</p>
        <p>Admin: admin@pipa.com / Admin@123</p>
        <p>Customer: demo@pipa.com / Demo@123</p>
      </div>
    </div>
  );
};

export default Login;
