import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import AuthClient from "./auth-client";

export const dynamic = "force-dynamic";

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthFallback />}>
      <AuthClient />
    </Suspense>
  );
}

function AuthFallback() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-950 px-5 py-16 text-neutral-50">
      <section className="w-full max-w-xl rounded-[2rem] border border-neutral-800 bg-neutral-900/80 p-9 text-center shadow-2xl backdrop-blur-2xl">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] border border-neutral-800 bg-neutral-950">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>

        <h1 className="mt-7 text-3xl font-black tracking-tight">
          Loading auth
        </h1>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-neutral-400">
          Preparing your sign-in page...
        </p>
      </section>
    </main>
  );
}
