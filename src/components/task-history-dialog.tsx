"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TaskHistory } from "@/types";
import { format } from "date-fns";

interface TaskHistoryDialogProps {
  children: React.ReactNode;
  history: TaskHistory[];
  taskName: string;
}

export function TaskHistoryDialog({ children, history, taskName }: TaskHistoryDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>History for &quot;{taskName}&quot;</DialogTitle>
          <DialogDescription>
            A log of all changes made to this task.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-72 w-full rounded-md border p-4">
          {history.length === 0 ? (
            <p className="text-muted-foreground">No history available for this task.</p>
          ) : (
            <div className="space-y-4">
              {history.map((entry) => (
                <div key={entry.id} className="text-sm">
                  <p className="font-medium">{entry.change}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(entry.createdAt), "PPP p")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
