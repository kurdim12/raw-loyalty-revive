
import { useToast as useToastHook, toast as toastHook } from "@/hooks/use-toast";
import { toast as sonnerToast } from "@/components/ui/sonner";

export const useToast = useToastHook;

// Combine both toast libraries to provide a unified API
export const toast = {
  ...toastHook,
  success: (message: string) => sonnerToast.success(message),
  error: (message: string) => sonnerToast.error(message),
  info: (message: string) => sonnerToast.info(message),
  warning: (message: string) => sonnerToast.warning(message)
};
