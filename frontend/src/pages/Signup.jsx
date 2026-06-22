import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const Signup = () => {
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (name.trim().length < 2) { toast.error("Name must be at least 2 characters"); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { toast.error("Invalid email"); return; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await signup(name.trim(), email, password);
      toast.success("Account created!");
      navigate("/account");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Signup failed");
    } finally { setLoading(false); }
  };

  return (
    <div data-testid="signup-page" className="max-w-md mx-auto px-6 py-20">
      <h1 className="font-serif-pipa text-5xl text-center mb-2">Create Account</h1>
      <p className="text-center text-[#4A4A4A] text-sm mb-10">Join the Pipa family</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          data-testid="signup-name"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-white border border-[#E5E0D8] px-3 py-3 text-sm outline-none focus:border-[#B45F45]"
        />
        <input
          data-testid="signup-email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-white border border-[#E5E0D8] px-3 py-3 text-sm outline-none focus:border-[#B45F45]"
        />
        <input
          data-testid="signup-password"
          type="password"
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-white border border-[#E5E0D8] px-3 py-3 text-sm outline-none focus:border-[#B45F45]"
        />
        <button
          data-testid="signup-submit"
          disabled={loading}
          className="w-full bg-[#1A1A1A] text-white py-3 text-xs uppercase tracking-widest hover:bg-[#B45F45] disabled:opacity-60"
        >
          {loading ? "Creating…" : "Create Account"}
        </button>
      </form>
      <p className="text-center text-sm text-[#4A4A4A] mt-6">
        Already a member? <Link to="/login" className="text-[#B45F45] hover:underline">Sign in</Link>
      </p>
    </div>
  );
};

export default Signup;
