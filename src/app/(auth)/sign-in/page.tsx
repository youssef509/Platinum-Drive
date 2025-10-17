import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import { Metadata } from "next";
import CredentialsSignInForm from "./credentials-signin-form";
import Link from "next/link";

export const metadata: Metadata = {
    title: "تسجيل الدخول",
    description: "صفحة تسجيل الدخول",
};


const SignInPage = () => {
    return (
        <div className="w-full flex min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">تسجيل الدخول</CardTitle>
                <CardDescription>
                    قم بتسجيل الدخول إلى حسابك
                </CardDescription>
            </CardHeader>
            <CardContent>
                <CredentialsSignInForm />
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <div className="text-center text-sm text-muted-foreground">
                    ليس لديك حساب؟{" "}
                    <Link href="/sign-up" className="text-primary hover:underline font-medium">
                        إنشاء حساب جديد
                    </Link>
                </div>
            </CardFooter>
        </Card>
        </div>
    );
}

export default SignInPage;