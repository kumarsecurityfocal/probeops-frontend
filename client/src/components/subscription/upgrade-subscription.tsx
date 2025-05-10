import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionTier, SubscriptionTiers } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useSubscription } from "@/hooks/use-rbac";
import { Check, Crown, Gem, Star, Loader2 } from "lucide-react";

export function UpgradeSubscription() {
  const { toast } = useToast();
  const { subscriptionTier: currentTier } = useSubscription();
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);

  // Mutation for updating subscription
  const updateSubscriptionMutation = useMutation({
    mutationFn: async (tier: SubscriptionTier) => {
      const response = await apiRequest("POST", "/api/user/subscription", { tier });
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Subscription updated",
        description: `Your subscription has been successfully updated to ${formatTierName(selectedTier!)}`,
      });
      
      // Refresh user data to get updated subscription information
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/rate-limits"] });
      
      // Reset selected tier
      setSelectedTier(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update subscription",
        description: error.message || "There was an error updating your subscription. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Format subscription tier name for display
  const formatTierName = (tier: SubscriptionTier) => {
    return {
      [SubscriptionTiers.FREE]: "Free",
      [SubscriptionTiers.STANDARD]: "Standard",
      [SubscriptionTiers.ENTERPRISE]: "Enterprise",
    }[tier];
  };

  // Define tiers and their features
  const tiers = [
    {
      id: SubscriptionTiers.FREE,
      name: "Free",
      price: "$0",
      description: "Basic monitoring for personal use",
      icon: <Star className="h-5 w-5 text-slate-500" />,
      features: [
        "100 requests per day",
        "1,000 requests per month",
        "15-minute probe interval",
        "Basic monitoring tools"
      ],
      buttonText: "Current Plan",
      buttonVariant: "outline" as const,
      bgClass: "bg-slate-50 border-slate-200"
    },
    {
      id: SubscriptionTiers.STANDARD,
      name: "Standard",
      price: "$9.99",
      description: "Enhanced monitoring for professionals",
      icon: <Gem className="h-5 w-5 text-primary" />,
      features: [
        "500 requests per day",
        "5,000 requests per month",
        "5-minute probe interval",
        "Enhanced monitoring tools",
        "Priority support"
      ],
      buttonText: "Upgrade",
      buttonVariant: "default" as const,
      bgClass: "bg-primary/5 border-primary/20"
    },
    {
      id: SubscriptionTiers.ENTERPRISE,
      name: "Enterprise",
      price: "$29.99",
      description: "Advanced monitoring for businesses",
      icon: <Crown className="h-5 w-5 text-amber-500" />,
      features: [
        "1,000 requests per day",
        "10,000 requests per month",
        "5-minute probe interval",
        "Advanced monitoring tools",
        "24/7 priority support",
        "Custom integration options"
      ],
      buttonText: "Upgrade",
      buttonVariant: "default" as const,
      bgClass: "bg-amber-50 border-amber-200"
    }
  ];

  const handleSubscriptionChange = () => {
    if (selectedTier && selectedTier !== currentTier) {
      updateSubscriptionMutation.mutate(selectedTier);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Subscription Plans</h2>
        <p className="text-muted-foreground">Choose the plan that best fits your needs</p>
      </div>

      <RadioGroup
        value={selectedTier || currentTier || SubscriptionTiers.FREE}
        onValueChange={(value) => setSelectedTier(value as SubscriptionTier)}
        className="grid gap-6 md:grid-cols-3"
      >
        {tiers.map((tier) => (
          <Label
            key={tier.id}
            htmlFor={tier.id}
            className="cursor-pointer"
          >
            <Card className={`h-full transition-all ${
              (selectedTier || currentTier) === tier.id 
                ? `ring-2 ring-primary ${tier.bgClass}` 
                : "hover:border-primary/50"
            }`}
            >
              <CardHeader>
                <div className="flex justify-between items-center">
                  {tier.icon}
                  <div className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary-foreground">
                    {tier.price}/month
                  </div>
                </div>
                <CardTitle className="mt-2">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="pt-4">
                  <RadioGroupItem
                    value={tier.id}
                    id={tier.id}
                    className="sr-only"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant={currentTier === tier.id ? "outline" : tier.buttonVariant}
                  className="w-full"
                  disabled={currentTier === tier.id}
                >
                  {currentTier === tier.id ? "Current Plan" : tier.buttonText}
                </Button>
              </CardFooter>
            </Card>
          </Label>
        ))}
      </RadioGroup>

      {selectedTier && selectedTier !== currentTier && (
        <div className="flex justify-end">
          <Button
            onClick={handleSubscriptionChange}
            disabled={updateSubscriptionMutation.isPending}
            className="bg-gradient-primary text-white"
          >
            {updateSubscriptionMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Confirm Subscription Change
          </Button>
        </div>
      )}
    </div>
  );
}