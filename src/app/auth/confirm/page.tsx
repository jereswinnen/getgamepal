"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function ConfirmPage() {
  return (
    <div className="container max-w-md mx-auto py-12">
      <div className="flex flex-col items-center space-y-6 text-center">
        <div className="p-3 bg-green-100 rounded-full">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Check your email
          </h1>
          <p className="text-muted-foreground">
            We've sent you a verification link. Please check your email to
            confirm your account.
          </p>
        </div>

        <div className="pt-4">
          <Button asChild>
            <Link href="/auth/login">Go to Login</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
