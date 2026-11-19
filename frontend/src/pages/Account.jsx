import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, useStore, ADMIN_TOKEN_KEY } from "../lib/store";

export default function Account() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshSettings } = useStore();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      await refreshSettings();
      navigate("/admin");
    } catch (err) {
      setError(typeof err.response?.data?.detail === "string" ? err.response.data.detail : "SIGN IN FAILED");
    } finally {
      setLoading(false);
    }
  };

  const field = { border: "1px solid var(--ink)", height: 52, padding: "0 15px" };

  return (
    <div className="px-[20px] pt-[60px] pb-[80px]" data-testid="account-page">
      <div className="max-w-[400px] mx-auto">
        <h1 className="font-display mb-[10px]" style={{ fontSize: 32 }}>ACCOUNT</h1>
        <p className="t-body mb-[40px]" style={{ color: "var(--muted)" }}>
          Store staff sign in to the admin studio below.
        </p>
        <form onSubmit={submit} className="flex flex-col gap-[15px]" data-testid="login-form">
          <input data-testid="login-email" type="email" required placeholder="EMAIL ADDRESS" className="t-mono-sm bg-transparent outline-none w-full" style={field}
            value={email} onChange={(e) => setEmail(e.target.value)} />
          <input data-testid="login-password" type="password" required placeholder="PASSWORD" className="t-mono-sm bg-transparent outline-none w-full" style={field}
            value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="t-mono-xs" data-testid="login-error">{error}</p>}
          <button data-testid="login-submit" type="submit" className="btn-primary" disabled={loading}>
            {loading ? "SIGNING IN…" : "SIGN IN"}
          </button>
        </form>
      </div>
    </div>
  );
}
