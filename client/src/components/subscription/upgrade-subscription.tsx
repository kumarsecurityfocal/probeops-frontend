import { SubscriptionTier, SubscriptionTiers } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Zap } from "lucide-react";
import { SubscriptionTierBadge } from "./subscription-tier-badge";
import { useSubscription } from "@/hooks/use-rbac";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionPlanProps {
  tier: SubscriptionTier;
  price: string;
  description: string;
  features: string[];
  recommended?: boolean;
  currentTier: SubscriptionTier;
  onSelect?: (tier: SubscriptionTier) => void;
}

function SubscriptionPlan({
  tier,
  price,
  description,
  features,
  recommended = false,
  currentTier,
  onSelect,
}: SubscriptionPlanProps) {
  const isCurrentTier = currentTier === tier;
  
  return (
    <Card className={`w-full ${recommended ? 'border-primary shadow-lg' : ''}`}>
      {recommended && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs px-3 py-0.5 rounded-full">
          Recommended
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">{tier === SubscriptionTiers.FREE ? 'Free' : tier === SubscriptionTiers.STANDARD ? 'Standard' : 'Enterprise'}</CardTitle>
          <SubscriptionTierBadge tier={tier} />
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <span className="text-3xl font-bold">{price}</span>
          {tier !== SubscriptionTiers.FREE && <span className="text-muted-foreground">/month</span>}
        </div>
        
        <div className="space-y-2">
          {features.map((feature, i) => (
            <div key={i} className="flex items-start">
              <Check className="h-4 w-4 text-primary mt-0.5 mr-2 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant={isCurrentTier ? "outline" : recommended ? "default" : "secondary"}
          className={`w-full ${recommended ? 'bg-gradient-to-r from-primary to-purple-600' : ''}`}
          disabled={isCurrentTier}
          onClick={() => onSelect && onSelect(tier)}
        >
          {isCurrentTier ? (
            'Current Plan'
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              {tier === SubscriptionTiers.FREE ? 'Get Started' : 'Upgrade'}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

export function UpgradeSubscription() {
  const { subscriptionTier } = useSubscription();
  const { toast } = useToast();
  
  const handleSelectPlan = (tier: SubscriptionTier) => {
    // In a real app, this would navigate to a checkout page or open a payment modal
    toast({
      title: "Subscription Upgrade",
      description: `This would redirect to upgrade to the ${tier === SubscriptionTiers.STANDARD ? 'Standard' : 'Enterprise'} plan. This feature is not yet implemented.`,
    });
  };
  
  // Safe current tier that handles null value
  const currentTierSafe = subscriptionTier || SubscriptionTiers.FREE;
  
  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Upgrade Your Subscription</h2>
        <p className="text-muted-foreground mt-2">
          Choose the plan that best fits your needs. Upgrade anytime to get more API requests.
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <SubscriptionPlan
          tier={SubscriptionTiers.FREE}
          price="$0"
          description="Basic access for small-scale testing"
          features={[
            "100 API requests per day",
            "1,000 API requests per month",
            "15-minute interval between probes",
            "Basic support"
          ]}
          currentTier={currentTierSafe}
          onSelect={handleSelectPlan}
        />
        
        <SubscriptionPlan
          tier={SubscriptionTiers.STANDARD}
          price="$19"
          description="For regular monitoring needs"
          features={[
            "500 API requests per day",
            "5,000 API requests per month",
            "5-minute interval between probes",
            "Email support",
            "API key management"
          ]}
          recommended={true}
          currentTier={currentTierSafe}
          onSelect={handleSelectPlan}
        />
        
        <SubscriptionPlan
          tier={SubscriptionTiers.ENTERPRISE}
          price="$49"
          description="For professional monitoring"
          features={[
            "1,000 API requests per day",
            "10,000 API requests per month",
            "5-minute interval between probes",
            "Priority support",
            "Advanced analytics",
            "Custom integrations"
          ]}
          currentTier={currentTierSafe}
          onSelect={handleSelectPlan}
        />
      </div>
    </div>
  );
}