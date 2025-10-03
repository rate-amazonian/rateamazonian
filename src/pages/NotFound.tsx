import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

// Resolve the logo via URL so Vite bundles it reliably
const logoUrl = new URL("../data/rate.jpeg", import.meta.url).href;

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Link to="/" className="fixed top-4 left-4 z-50 flex items-center gap-2">
        <div
          className="relative h-40 w-40 rounded-full shadow-2xl overflow-hidden ring-1 ring-border/40 animate-[spin_12s_linear_infinite]"
          style={{
            background:
              "radial-gradient( circle at 30% 30%, rgba(255,255,255,0.85), rgba(255,255,255,0.08) 40%), conic-gradient(from 220deg at 50% 50%, hsl(var(--primary)) 0%, hsl(var(--secondary)) 35%, hsl(var(--primary)) 70%, hsl(var(--secondary)) 100%)",
          }}
        >
          <img src={logoUrl} alt="RateAmazonian" className="absolute inset-0 h-full w-full object-cover rounded-full opacity-95" />
          <div className="absolute -top-6 -left-6 h-24 w-24 rounded-full bg-white/50 blur-xl" />
        </div>
      </Link>
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-gray-600">Oops! Page not found</p>
        <Link to="/" className="text-blue-500 underline hover:text-blue-700">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
