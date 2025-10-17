'use client';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";


const CredentialsSignInForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
            } else if (result?.ok) {
                router.push("/");
                router.refresh();
            }
        } catch (err) {
            setError("حدث خطأ أثناء تسجيل الدخول");
        } finally {
            setIsLoading(false);
        }
    };

    return <form onSubmit={handleSubmit}>
    <div className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/10 rounded-md">
          {error}
        </div>
      )}
      <div className="space-y-4">
        <Label htmlFor="email">البريد الإلكتروني</Label>
        <Input 
          id="email" 
          type="email" 
          required 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div className="space-y-4">
        <Label htmlFor="password">كلمة المرور</Label>
        <Input 
          id="password" 
          type="password" 
          required 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
      </Button>
    </div>
  </form>;
}
 
export default CredentialsSignInForm;