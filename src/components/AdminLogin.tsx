import { useState } from "react";
import { Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { verifyAdminLogin, setAdminLoggedIn } from "@/lib/adminAuth";

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

const AdminLogin = ({ onLoginSuccess }: AdminLoginProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (verifyAdminLogin(username, password)) {
        setAdminLoggedIn(true);
        onLoginSuccess();
      } else {
        setError("Invalid username or password");
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="flex items-center justify-center mb-6">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Lock className="h-6 w-6 text-primary" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-foreground text-center mb-2">
            Admin Login
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Access the admin dashboard to manage and monitor the application
          </p>

          {/* Error Alert */}
          {error && (
            <Alert className="mb-6 bg-destructive/10 border-destructive/30">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full gap-2"
              disabled={isLoading || !username || !password}
            >
              <Lock className="h-4 w-4" />
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-3">
              Demo Credentials:
            </p>
            <div className="bg-secondary rounded-lg p-3 text-xs space-y-1">
              <p>
                <span className="text-muted-foreground">Username: </span>
                <span className="text-foreground font-mono">admin</span>
              </p>
              <p>
                <span className="text-muted-foreground">Password: </span>
                <span className="text-foreground font-mono">Admin@12345</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
