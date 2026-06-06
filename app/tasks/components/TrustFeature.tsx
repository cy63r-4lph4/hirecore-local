import type { ComponentType } from "react";

export function TrustFeature({
  icon: Icon,
  title,
  text,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/70 p-4 shadow-(--shadow-card) backdrop-blur-xl">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <h3 className="text-sm font-black">{title}</h3>

          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}