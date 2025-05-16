
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Smartphone, KeyRound, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import AuthGuard from "@/components/auth/auth-guard";

export default function LandingPage() {
  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen">
        <header className="bg-primary text-primary-foreground shadow-md">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Building className="h-8 w-8" />
              <h1 className="text-3xl font-bold">Eleon</h1>
            </div>
            <nav>
              <Link href="/login">
                <Button variant="secondary" className="text-primary hover:bg-primary/10">
                  Login / Sign Up
                </Button>
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-grow">
          {/* Hero Section */}
          <section className="py-20 bg-gradient-to-br from-primary/10 to-background">
            <div className="container mx-auto px-6 text-center">
              <Smartphone className="h-24 w-24 text-primary mx-auto mb-6" />
              <h2 className="text-5xl font-extrabold text-foreground mb-6">
                Welcome to Eleon
              </h2>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Experience the future of hotel stays. Seamless room access, smart controls, and unparalleled convenience, all from your smartphone.
              </p>
              <Link href="/login">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  Get Started
                </Button>
              </Link>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16 bg-background">
            <div className="container mx-auto px-6">
              <h3 className="text-3xl font-bold text-center text-foreground mb-12">
                Why Choose Eleon?
              </h3>
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="p-3 bg-primary/10 rounded-full w-fit mb-4">
                      <KeyRound className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Mobile Room Access</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Unlock your room, control lights, and manage your stay directly from our intuitive mobile interface.
                    </CardDescription>
                  </CardContent>
                </Card>
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="p-3 bg-primary/10 rounded-full w-fit mb-4">
                      <ShieldCheck className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle>Secure & Reliable</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Robust authentication and secure session management ensure your access and data are always protected.
                    </CardDescription>
                  </CardContent>
                </Card>
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                     <div className="p-3 bg-primary/10 rounded-full w-fit mb-4">
                       <Image src="https://placehold.co/100x100/34196B/F5F0FF.png" alt="Admin Dashboard Icon" width={32} height={32} className="rounded-full" data-ai-hint="dashboard chart" />
                    </div>
                    <CardTitle>Powerful Admin Tools</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Administrators get a comprehensive dashboard to monitor room status, view analytics, and manage facilities.
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </main>

        <footer className="bg-foreground text-background text-center py-8">
          <p>&copy; {new Date().getFullYear()} Eleon. All rights reserved.</p>
          <p className="text-sm text-muted-foreground">Modern Hotel Solutions, Reimagined.</p>
        </footer>
      </div>
    </AuthGuard>
  );
}
