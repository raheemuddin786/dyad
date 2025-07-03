import { useTheme } from "@/providers/theme-provider";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Monitor } from "lucide-react";

const Index = () => {
  const { setTheme, theme, resolvedTheme } = useTheme();

  const getButtonVariant = (targetTheme: "light" | "dark" | "system") => {
    if (targetTheme === "system") {
      return theme === "system" ? "default" : "outline";
    }
    return resolvedTheme === targetTheme ? "default" : "outline";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Welcome to Your Blank App</h1>
        <p className="text-xl text-muted-foreground">
          Start building your amazing project here!
        </p>
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
      <MadeWithDyad />
    </div>
  );
};

export default Index;
