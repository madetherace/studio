
import { AuthForm } from '@/components/auth/auth-form';
import AuthGuard from '@/components/auth/auth-guard';

export default function LoginPage() {
  return (
    <AuthGuard>
      <AuthForm />
    </AuthGuard>
  );
}
