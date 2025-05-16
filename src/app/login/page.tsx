
import AuthGuard from '@/components/auth/AuthGuard';
import { AuthForm } from '@/components/auth/AuthForm'; // Corrected path

export default function LoginPage() {
  return (
    <AuthGuard publicRoute={true}> {/* Login page is public */}
      <div className="flex items-center justify-center py-12">
        <AuthForm />
      </div>
    </AuthGuard>
  );
}
