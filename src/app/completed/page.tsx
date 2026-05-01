"use client";

import { useEffect } from "react";
import { useTaskStore } from "@/store/task-store";
import { useSettingsStore, SortOption } from "@/store/settings-store";
import { TaskItem } from "@/components/task-item";
import { sortTasks } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, CheckCircle, Trash2 } from "lucide-react";

export default function CompletedTasksPage() {
  const { tasks, fetchTasks, clearCompletedTasks, isLoading, error } =
    useTaskStore();
  const { sortBy, setSortBy } = useSettingsStore();

  useEffect(() => {
    // We want to fetch tasks including completed ones, then filter for ONLY completed ones
    // Or we could add a specific API for completed tasks.
    // For now, let's fetch all tasks and filter here.
    fetchTasks(undefined, true);
  }, [fetchTasks]);

  const handleClearAll = async () => {
    if (
      confirm(
        "Are you sure you want to permanently delete ALL completed tasks?",
      )
    ) {
      await clearCompletedTasks();
    }
  };

  const completedTasks = tasks.filter((t) => t.completed);
  const sortedTasks = sortTasks(completedTasks, sortBy);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <button
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium"
          onClick={() => fetchTasks(undefined, true)}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <h1 className="text-2xl font-bold">Completed Tasks</h1>
        </div>
        <div className="flex items-center space-x-4">
          {isLoading && (
            <span className="text-xs text-muted-foreground animate-pulse">
              Loading...
            </span>
          )}
          <div className="flex items-center space-x-2">
            <Select
              value={sortBy}
              onValueChange={(value: SortOption) => setSortBy(value)}
            >
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <ArrowUpDown className="w-3 h-3 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="date">Due Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {completedTasks.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              className="h-8 text-xs"
              onClick={handleClearAll}
              disabled={isLoading}
            >
              <Trash2 className="w-3 h-3 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {sortedTasks.length > 0 ? (
          sortedTasks.map((task) => <TaskItem key={task.id} task={task} />)
        ) : (
          <div className="text-center py-10 border-2 border-dashed rounded-md text-muted-foreground">
            No completed tasks found.
          </div>
        )}
      </div>
    </div>
  );
}
