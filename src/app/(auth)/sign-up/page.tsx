import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import CredentialsSignUpForm from "./credentials-signup-form";

export default function SignUpPage() {
  return (
    <div className="w-full flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">إنشاء حساب جديد</CardTitle>
          <CardDescription>
            أدخل بياناتك لإنشاء حساب جديد
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CredentialsSignUpForm />
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="text-center text-sm text-muted-foreground">
            لديك حساب بالفعل؟{" "}
            <Link href="/sign-in" className="text-primary hover:underline font-medium">
              تسجيل الدخول
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
