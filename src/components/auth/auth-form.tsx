
"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, useSearchParams } from 'next/navigation';
import type { User } from '@/types';
import { LogIn, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export function AuthForm() {
  const [isGuestLogin, setIsGuestLogin] = useState(true);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    let user: User | null = null;

    // Hardcoded users for demo purposes
    if (data.email === 'admin@eleon.com' && data.password === 'password') {
      user = { id: 'admin1', name: 'Admin User', email: data.email, role: 'admin' };
    } else if (data.email === 'guest@eleon.com' && data.password === 'password') {
      user = { id: 'guest1', name: 'Guest User', email: data.email, role: 'guest' };
    }

    if (user) {
      if ((isGuestLogin && user.role === 'guest') || (!isGuestLogin && user.role === 'admin')) {
        login(user);
        toast({
          title: "Login Successful",
          description: `Welcome back, ${user.name}!`,
        });
        const redirectPath = searchParams.get('redirect') || (user.role === 'admin' ? '/admin/dashboard' : '/guest/dashboard');
        router.push(redirectPath);
      } else {
         toast({
          title: "Login Failed",
          description: `Credentials are for a ${user.role}, not a ${isGuestLogin ? 'guest' : 'admin'}.`,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid email or password.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 to-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <Building className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold text-foreground">Welcome to Eleon</CardTitle>
          <CardDescription>
            {isGuestLogin ? "Sign in to access your room and manage your stay." : "Administrator Access Portal"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register('email')} 
                     className={errors.email ? 'border-destructive' : ''} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" {...register('password')} 
                     className={errors.password ? 'border-destructive' : ''}/>
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" /> Sign In as {isGuestLogin ? "Guest" : "Admin"}
                </>
              )}
            </Button>
          </form>
           <p className="mt-4 text-xs text-muted-foreground text-center">
            Guest: guest@eleon.com / password <br />
            Admin: admin@eleon.com / password
          </p>
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          <Button variant="link" onClick={() => setIsGuestLogin(!isGuestLogin)} className="text-sm text-primary">
            {isGuestLogin ? "Switch to Admin Login" : "Switch to Guest Login"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
