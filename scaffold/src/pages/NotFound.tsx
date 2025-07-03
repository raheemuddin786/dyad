import { useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { useTheme } from "@/providers/theme-provider";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Monitor } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const getButtonVariant = (targetTheme: "light" | "dark" | "system") => {
    if (targetTheme === "system") {
      return theme === "system" ? "default" : "outline";
    }
    return resolvedTheme === targetTheme ? "default" : "outline";
  };

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="inline-block">
          <Button variant="outline">Return to Home</Button>
        </a>
        <div className="flex justify-center gap-2">
          <Button
            variant={getButtonVariant("light")}
            onClick={() => setTheme("light")}
          >
            <Sun className="w-4 h-4 mr-2" /> Light
          </Button>
          <Button
            variant={getButtonVariant("dark")}
            onClick={() => setTheme("dark")}
          >
            <Moon className="w-4 h-4 mr-2" /> Dark
          </Button>
          <Button
            variant={getButtonVariant("system")}
            onClick={() => setTheme("system")}
          >
            <Monitor className="w-4 h-4 mr-2" /> System
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
