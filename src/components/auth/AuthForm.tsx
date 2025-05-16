
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
import { LogIn, Hotel } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  password: z.string().min(3, { message: "Password must be at least 3 characters" }), // Simplified for demo
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export function AuthForm() {
  const { login, loading } = useAuth();
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
      // Determine redirect based on role (fetched from useAuth after login)
      // This logic will be slightly delayed due to auth state update, handled by AuthGuard primarily
      // For direct redirect:
      const loggedInUser = JSON.parse(localStorage.getItem('pwa-hotel-user') || '{}'); // Quick check
      if (redirectPath) {
        router.push(redirectPath);
      } else if (loggedInUser.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/'); // Default to booking page for guests
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
        <Hotel className="h-12 w-12 text-accent mx-auto mb-3" />
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>Access your account or the admin panel.</CardDescription>
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
          <Button type="submit" className="w-full" disabled={isSubmitting || loading}>
            {isSubmitting || loading ? (
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
