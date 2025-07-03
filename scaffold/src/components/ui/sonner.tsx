import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success:
            "group-[.toast]:bg-success group-[.toast]:text-success-foreground",
          error:
            "group-[.toast]:bg-destructive group-[.toast]:text-destructive-foreground",
          warning:
            "group-[.toast]:bg-warning group-[.toast]:text-warning-foreground",
          info: "group-[.toast]:bg-info group-[.toast]:text-info-foreground",
        },
      }}
      theme="system"
      {...props}
    />
  );
};

export { Toaster };
