import { useState } from "react";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Key, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiKey } from "@/lib/types";

interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const apiKeySchema = z.object({
  name: z.string().min(1, "API key name is required"),
});

type ApiKeyFormValues = z.infer<typeof apiKeySchema>;

export function ApiKeyDialog({ open, onOpenChange }: ApiKeyDialogProps) {
  const { toast } = useToast();
  const [newApiKey, setNewApiKey] = useState<ApiKey | null>(null);
  const [copied, setCopied] = useState(false);
  
  const form = useForm<ApiKeyFormValues>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      name: "",
    },
  });
  
  const createApiKeyMutation = useMutation({
    mutationFn: async (data: ApiKeyFormValues) => {
      const res = await apiRequest("POST", "/api/keys", data);
      return await res.json();
    },
    onSuccess: (data: ApiKey) => {
      setNewApiKey(data);
      queryClient.invalidateQueries({ queryKey: ["/api/keys"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create API key",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleSubmit = (data: ApiKeyFormValues) => {
    createApiKeyMutation.mutate(data);
  };
  
  const copyToClipboard = () => {
    if (newApiKey) {
      navigator.clipboard.writeText(newApiKey.key);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "The API key has been copied to your clipboard",
      });
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };
  
  const handleClose = () => {
    form.reset();
    setNewApiKey(null);
    setCopied(false);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Create New API Key
          </DialogTitle>
          <DialogDescription>
            API keys allow external applications to access the ProbeOps API. 
            Create a key with a descriptive name to help you identify its purpose.
          </DialogDescription>
        </DialogHeader>
        
        {!newApiKey ? (
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="api-key-name">API Key Name</Label>
                <Input
                  id="api-key-name"
                  placeholder="e.g. Production Server"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createApiKeyMutation.isPending}
              >
                {createApiKeyMutation.isPending ? "Creating..." : "Create API Key"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-api-key">Your New API Key</Label>
              <div className="flex items-center">
                <Input
                  id="new-api-key"
                  readOnly
                  value={newApiKey.key}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-12"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-red-600 mt-1">
                Copy this key now. You won't be able to see it again!
              </p>
            </div>
            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
