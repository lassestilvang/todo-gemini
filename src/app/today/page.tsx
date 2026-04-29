"use client";

import { useEffect } from "react";
import { useTaskStore } from "@/store/task-store";
import { useSettingsStore, SortOption } from "@/store/settings-store";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { TaskItem } from "@/components/task-item"; // Import TaskItem
import { sortTasks } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";

export default function TodayPage() {
  const { tasks, fetchTodayTasks } = useTaskStore(); // Removed updateTask
  const { showCompleted, setShowCompleted, sortBy, setSortBy } =
    useSettingsStore();

  useEffect(() => {
    fetchTodayTasks(showCompleted);
  }, [fetchTodayTasks, showCompleted]);

  const sortedTasks = sortTasks(tasks, sortBy);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Today</h1>
        <div className="flex items-center space-x-4">
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
          {/* TaskDialog for Today tasks - needs a listId, which is not directly available here. */}
          {/* <TaskDialog listId={inbox.id}>
            <Button>Add Task</Button>
          </TaskDialog> */}
        </div>
      </div>

      <div className="space-y-2">
        {sortedTasks.length > 0 ? (
          sortedTasks.map((task) => <TaskItem key={task.id} task={task} />)
        ) : (
          <div className="text-center py-10 border-2 border-dashed rounded-md text-muted-foreground">
            No tasks found for today. Enjoy your day!
          </div>
        )}
      </div>
    </div>
  );
}
