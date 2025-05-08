import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Register schema with password confirmation
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().min(1, "Email is required").email("Must be a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Login schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;
type LoginFormValues = z.infer<typeof loginSchema>;

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const { loginMutation, registerMutation } = useAuth();
  
  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });
  
  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  
  // Handle login form submission
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate({
      username: data.username,
      password: data.password,
    });
  };
  
  // Handle register form submission
  const onRegisterSubmit = (data: RegisterFormValues) => {
    const { confirmPassword, ...userData } = data;
    registerMutation.mutate(userData);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-primary">ProbeOps</h1>
            <p className="text-gray-600 mt-1">
              {isLogin ? "Sign in to your account" : "Create your account"}
            </p>
          </div>
          
          {isLogin ? (
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
              <div className="mb-4">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="username"
                  {...loginForm.register("username")}
                />
                {loginForm.formState.errors.username && (
                  <p className="mt-1 text-sm text-red-600">
                    {loginForm.formState.errors.username.message}
                  </p>
                )}
              </div>
              
              <div className="mb-6">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...loginForm.register("password")}
                />
                {loginForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-me"
                    {...loginForm.register("rememberMe")}
                  />
                  <Label htmlFor="remember-me" className="text-sm">
                    Remember me
                  </Label>
                </div>
                
                <div className="text-sm">
                  <a href="#forgot-password" className="font-medium text-primary hover:text-indigo-500">
                    Forgot password?
                  </a>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
              <div className="mb-4">
                <Label htmlFor="register-username">Username</Label>
                <Input
                  id="register-username"
                  type="text"
                  placeholder="johndoe"
                  {...registerForm.register("username")}
                />
                {registerForm.formState.errors.username && (
                  <p className="mt-1 text-sm text-red-600">
                    {registerForm.formState.errors.username.message}
                  </p>
                )}
              </div>
              
              <div className="mb-4">
                <Label htmlFor="register-email">Email Address</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="you@example.com"
                  {...registerForm.register("email")}
                />
                {registerForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              
              <div className="mb-4">
                <Label htmlFor="register-password">Password</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="••••••••"
                  {...registerForm.register("password")}
                />
                {registerForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 8 characters long.
                </p>
              </div>
              
              <div className="mb-6">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  {...registerForm.register("confirmPassword")}
                />
                {registerForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {registerForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          )}
          
          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <Button
                variant="link"
                className="font-medium text-primary"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Sign up" : "Sign in"}
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
