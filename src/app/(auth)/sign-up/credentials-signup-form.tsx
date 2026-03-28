'use client';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useSignUp } from "@clerk/nextjs/legacy";
import { useRouter } from "next/navigation";

const CredentialsSignUpForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { signUp, setActive, isLoaded } = useSignUp();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoaded) return;

        setError("");

        if (password !== confirmPassword) {
            setError("كلمات المرور غير متطابقة");
            return;
        }

        setIsLoading(true);

        try {
            const firstName = name.split(' ')[0] || name;
            const lastName = name.split(' ').slice(1).join(' ') || undefined;

            const result = await signUp.create({
                emailAddress: email,
                password,
                firstName,
                lastName,
            });

            if (result.status === 'complete') {
                await setActive({ session: result.createdSessionId });
                router.push("/");
                router.refresh();
            } else if (result.status === 'missing_requirements') {
                // Email verification required
                await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
                router.push(`/verify?email=${encodeURIComponent(email)}`);
            }
        } catch (err: unknown) {
            const clerkError = err as { errors?: Array<{ message?: string; longMessage?: string }> };
            const message = clerkError.errors?.[0]?.longMessage
                || clerkError.errors?.[0]?.message
                || "حدث خطأ أثناء إنشاء الحساب";
            setError(message);
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
                <Button type="submit" disabled={isLoading || !isLoaded} className="w-full">
                    {isLoading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
                </Button>
            </div>
        </form>
    );
};

export default CredentialsSignUpForm;
