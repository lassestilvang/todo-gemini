"use client";

import { useEffect } from "react";
import { useTaskStore } from "@/store/task-store";
import { useListStore } from "@/store/list-store";
import { Button } from "@/components/ui/button";
import { TaskDialog } from "@/components/task-dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { TaskItem } from "@/components/task-item"; // Import TaskItem

import { useSettingsStore, SortOption } from "@/store/settings-store";
import { sortTasks } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";

export default function Home() {
  const { tasks, fetchTasks, isLoading, error } = useTaskStore();
  const { lists } = useListStore();
  const { showCompleted, setShowCompleted, sortBy, setSortBy } =
    useSettingsStore();
  const inbox = lists.find((list) => list.name === "Inbox");

  useEffect(() => {
    if (inbox) {
      fetchTasks(inbox.id, showCompleted);
    }
  }, [inbox, fetchTasks, showCompleted]);

  const sortedTasks = sortTasks(tasks, sortBy);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={() => inbox && fetchTasks(inbox.id, showCompleted)}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Inbox</h1>
        <div className="flex items-center space-x-4">
          {isLoading && (
            <span className="text-xs text-muted-foreground animate-pulse">
              Loading...
            </span>
          )}
          <div className="flex items-center space-x-2">
            <Label htmlFor="show-completed" className="text-sm">
              Show Completed
            </Label>
            <Switch
              id="show-completed"
              checked={showCompleted}
              onCheckedChange={setShowCompleted}
            />
          </div>

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
          {inbox && (
            <TaskDialog listId={inbox.id}>
              <Button>Add Task</Button>
            </TaskDialog>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {sortedTasks.length > 0 ? (
          sortedTasks.map((task) => <TaskItem key={task.id} task={task} />)
        ) : (
          <div className="text-center py-10 border-2 border-dashed rounded-md text-muted-foreground">
            No tasks found. Click &quot;Add Task&quot; to get started!
          </div>
        )}
      </div>
    </div>
  );
}
