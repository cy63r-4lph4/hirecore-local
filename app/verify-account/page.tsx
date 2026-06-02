import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Verify } from "crypto";
import VerifyAccountClient from "./verify-account-client";

export const dynamic = "force-dynamic";

export default function VerifyAccountPage() {
  return (
    <Suspense fallback={<VerifyAccountFallback />}>
      <VerifyAccountClient />
    </Suspense>
  );
}

function VerifyAccountFallback() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 py-16 text-foreground">
      <section className="w-full max-w-xl rounded-[2rem] border border-border/80 bg-card/85 p-9 text-center shadow-2xl backdrop-blur-2xl">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] border border-border bg-background">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>

        <h1 className="mt-7 text-3xl font-black tracking-tight">
          Loading Verify Account
        </h1>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-muted-foreground">
          Preparing your secure callback session...
        </p>
      </section>
    </main>
  );
}
