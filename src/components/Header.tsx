import { Calendar, MessageCircle, DollarSign, User, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import APISecretsModal from "@/components/APISecretsModal";

interface UserProfile {
  name: string;
  email: string;
  picture: string;
}

declare global {
  interface Window {
    google: any;
  }
}

const Header = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiSecretsOpen, setApiSecretsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load Google Sign-In SDK
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleSignIn;
    document.body.appendChild(script);

    // Load user from localStorage if exists
    const savedUser = localStorage.getItem("userProfile");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to load saved user profile:", e);
      }
    }

    return () => {
      // Cleanup
      const googleScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (googleScript) {
        googleScript.remove();
      }
    };
  }, []);

  const initializeGoogleSignIn = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: "566319724872-kn7kqd58poci11m9q3v64r8ltk5ifbi4.apps.googleusercontent.com",
        callback: handleGoogleSignIn,
      });

      // Optionally render the sign-in button
      if (document.getElementById("google-signin-button")) {
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-button"),
          {
            theme: "dark",
            size: "large",
          }
        );
      }
    }
  };

  const handleGoogleSignIn = (response: any) => {
    setIsLoading(true);
    try {
      // Decode JWT token to get user info
      const base64Url = response.credential.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      const decodedToken = JSON.parse(jsonPayload);

      const userProfile: UserProfile = {
        name: decodedToken.name || decodedToken.email.split("@")[0],
        email: decodedToken.email,
        picture: decodedToken.picture || "",
      };

      setUser(userProfile);
      localStorage.setItem("userProfile", JSON.stringify(userProfile));
    } catch (error) {
      console.error("Error processing Google Sign-In:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem("userProfile");
    
    // Sign out from Google
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  const handleSignInClick = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.promptAsync();
    }
  };

  return (
    <header className="bg-background border-b border-border px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none"/>
          </svg>
          <span className="text-xl font-semibold text-foreground">MICSVNest</span>
        </div>
        <span className="bg-secondary text-muted-foreground text-xs px-2 py-0.5 rounded">V2.0</span>
      </div>
      
      <nav className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-2">
          <Calendar className="h-4 w-4" />
          Event Calendar
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <MessageCircle className="h-4 w-4" />
          Join Discord
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <DollarSign className="h-4 w-4" />
          Pricing
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          onClick={() => setApiSecretsOpen(true)}
          title="API Secrets"
        >
          <DollarSign className="h-4 w-4" />
          API Secrets
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          onClick={() => navigate("/admin")}
          title="Admin Panel"
        >
          <Shield className="h-4 w-4" />
          Admin
        </Button>

        {/* User Profile or Sign In Button */}
        {user ? (
          <div className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-2 ml-2">
            <img
              src={user.picture}
              alt={user.name}
              className="h-8 w-8 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Signed in as</span>
              <span className="text-xs font-medium text-primary">{user.name}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="ml-2 gap-1"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <Button
              variant="default"
              size="sm"
              className="gap-2"
              onClick={handleSignInClick}
              disabled={isLoading}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isLoading ? "Signing in..." : "Sign in with Google"}
            </Button>
            <div className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-2 ml-2">
              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Developed By</span>
                <span className="text-xs font-medium text-primary">Ar Abir</span>
              </div>
            </div>
          </>
        )}
      </nav>
      <div id="google-signin-button" style={{ display: "none" }}></div>

      <APISecretsModal open={apiSecretsOpen} onOpenChange={setApiSecretsOpen} />
    </header>
  );
};

export default Header;
