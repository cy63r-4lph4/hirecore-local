import WorkforceClient from "./workforce-client";

export default function WorkforcePage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Workforce Members
        </h1>
        <p className="text-sm text-muted-foreground">
          All approved workforce members
        </p>
      </div>

      <WorkforceClient />
    </div>
  );
}