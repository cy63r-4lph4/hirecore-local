"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

type AdminTaskPaginationProps = {
  page: number;
  totalPages?: number;
  loading: boolean;
  onPageChange: (page: number) => void;
};

export function AdminTaskPagination({
  page,
  totalPages = 1,
  loading,
  onPageChange,
}: AdminTaskPaginationProps) {
  return (
    <div className="mt-8 flex flex-col gap-3 border-t border-border/50 pt-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
        Page {page} of {totalPages}
      </p>

      <div className="flex gap-2">
        <Button
          variant="outline"
          className="rounded-xl border-border bg-background/50 text-[10px] font-black uppercase tracking-widest"
          disabled={page <= 1 || loading}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <Button
          variant="outline"
          className="rounded-xl border-border bg-background/50 text-[10px] font-black uppercase tracking-widest"
          disabled={loading || page >= Math.max(1, totalPages)}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}