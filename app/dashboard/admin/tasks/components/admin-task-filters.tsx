"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { JobStatus } from "@/lib/api/admin/tasks";

export type StatusFilter = JobStatus | "ALL";

const statusOptions: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING_APPROVAL" },
  { label: "Open", value: "OPEN" },
  { label: "Closed", value: "CLOSED" },
  { label: "Rejected", value: "REJECTED" },
];

type AdminTaskFiltersProps = {
  search: string;
  status: StatusFilter;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
};

export function AdminTaskFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: AdminTaskFiltersProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="relative w-full xl:max-w-md">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          placeholder="Search by title, description, location..."
          className="h-12 rounded-xl border-border bg-background/50 pl-11 focus:ring-primary/20"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <Select
        value={status}
        onValueChange={(value) => onStatusChange(value as StatusFilter)}
      >
        <SelectTrigger className="h-12 rounded-xl border-border bg-background/50 xl:w-[240px]">
          <SelectValue placeholder="Task status" />
        </SelectTrigger>

        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}