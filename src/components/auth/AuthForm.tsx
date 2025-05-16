
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
import { LogIn, Hotel, Loader2 } from 'lucide-react'; // Added Loader2
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }), // Min 1 for simple presence check
  password: z.string().min(1, { message: "Password is required" }), // Min 1 for simple presence check
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export function AuthForm() {
  const { login, loading: authLoading } = useAuth(); // Renamed loading to authLoading to avoid conflict
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    const success = await login(data.username, data.password);

    if (success) {
      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.username}!`,
      });
      
      const redirectPath = searchParams.get('redirect');
      // User object is updated by useAuth, we can access it after successful login.
      // For immediate redirect logic, we need to fetch the user from the auth context *after* login.
      // Or, login function could return the user object. For now, we rely on useAuth to update.
      // The AuthGuard will handle redirect based on role if this push is too generic or early.
      
      // A simple check based on username for demo purposes. In real app, role comes from user object.
      const isAdmin = data.username === 'admin'; 

      if (redirectPath) {
        router.push(redirectPath);
      } else if (isAdmin) {
        router.push('/admin');
      } else {
        // Check if user has a room from mock-data or localStorage if necessary
        // For this simple PWA, we direct to booking page if no room, or room page if room exists.
        // This logic might be better handled by AuthGuard or a dedicated redirect service.
        // For now, guests are redirected to the booking page by default after login.
        router.push('/'); 
      }
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid username or password.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <Hotel className="h-12 w-12 text-primary mx-auto mb-3" />
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>Access your PWA Hotel Account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="username">Username</Label>
            <Input id="username" placeholder="e.g., admin or testguest" {...register('username')}
                   className={errors.username ? 'border-destructive' : ''} />
            {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" {...register('password')}
                   className={errors.password ? 'border-destructive' : ''} />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting || authLoading}>
            {isSubmitting || authLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                Signing in...
              </div>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" /> Sign In
              </>
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground text-center w-full">
          Admin: username `admin`, password `password`. <br/>
          Guest: username `testguest`, password `password`.
        </p>
      </CardFooter>
    </Card>
  );
}
