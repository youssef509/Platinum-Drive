'use client';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const CredentialsSignUpForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        // Validate passwords match
        if (password !== confirmPassword) {
            setError("كلمات المرور غير متطابقة");
            setIsLoading(false);
            return;
        }

        try {
            // Register user
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                    name: name || undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.details) {
                    // Handle Zod validation errors
                    const errorMessages = Object.values(data.details).flat().join(", ");
                    setError(errorMessages);
                } else {
                    setError(data.error || "حدث خطأ أثناء إنشاء الحساب");
                }
                return;
            }

            // Auto login after successful registration
            const signInResult = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (signInResult?.error) {
                setError("تم إنشاء الحساب بنجاح، لكن حدث خطأ في تسجيل الدخول");
            } else if (signInResult?.ok) {
                router.push("/");
                router.refresh();
            }
        } catch (err) {
            setError("حدث خطأ أثناء إنشاء الحساب");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-6">
                {error && (
                    <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/10 rounded-md">
                        {error}
                    </div>
                )}
                <div className="space-y-4">
                    <Label htmlFor="name">الاسم (اختياري)</Label>
                    <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isLoading}
                        placeholder="أدخل اسمك"
                    />
                </div>
                <div className="space-y-4">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        placeholder="example@domain.com"
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
                        placeholder="8 أحرف على الأقل"
                    />
                </div>
                <div className="space-y-4">
                    <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isLoading}
                        placeholder="أعد إدخال كلمة المرور"
                    />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
                </Button>
            </div>
        </form>
    );
};

export default CredentialsSignUpForm;

