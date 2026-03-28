'use client';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useSignIn } from "@clerk/nextjs/legacy";
import { useRouter } from "next/navigation";

const CredentialsSignInForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { signIn, setActive, isLoaded } = useSignIn();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoaded) return;

        setError("");
        setIsLoading(true);

        try {
            const result = await signIn.create({
                identifier: email,
                password: password,
            });

            if (result.status === 'complete') {
                await setActive({ session: result.createdSessionId });
                router.push("/");
                router.refresh();
            } else if (result.status === 'needs_second_factor') {
                setError("يتطلب حسابك التحقق بخطوتين. يرجى التحقق من بريدك الإلكتروني.");
            } else if (result.status === 'needs_identifier') {
                setError("يرجى إدخال البريد الإلكتروني");
            } else if (result.status === 'needs_first_factor') {
                setError("يرجى إدخال كلمة المرور");
            } else {
                setError(`حدث خطأ أثناء تسجيل الدخول (${result.status})، يرجى المحاولة مرة أخرى`);
            }
        } catch (err: unknown) {
            const clerkError = err as { errors?: Array<{ message?: string; longMessage?: string }> };
            const message = clerkError.errors?.[0]?.longMessage
                || clerkError.errors?.[0]?.message
                || "البريد الإلكتروني أو كلمة المرور غير صحيحة";
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
                <Button type="submit" disabled={isLoading || !isLoaded} className="w-full">
                    {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                </Button>
            </div>
        </form>
    );
};

export default CredentialsSignInForm;
