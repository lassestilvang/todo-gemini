"use client";

import { useEffect, useState } from "react";
import { useTaskStore } from "@/store/task-store";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { TaskItem } from "@/components/task-item"; // Import TaskItem

export default function UpcomingPage() {
  const { tasks, fetchUpcomingTasks } = useTaskStore(); // Removed updateTask
  const [showCompleted, setShowCompleted] = useState(true);

  useEffect(() => {
    fetchUpcomingTasks(showCompleted);
  }, [fetchUpcomingTasks, showCompleted]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Upcoming</h1>
        <div className="flex items-center space-x-2">
          <Label htmlFor="show-completed">Show Completed</Label>
          <Switch
            id="show-completed"
            checked={showCompleted}
            onCheckedChange={setShowCompleted}
          />
          {/* TaskDialog for Upcoming tasks - needs a listId, which is not directly available here. */}
        </div>
      </div>

      <div className="space-y-2">
        {tasks.length > 0 ? (
          tasks.map((task) => <TaskItem key={task.id} task={task} />)
        ) : (
          <div className="text-center py-10 border-2 border-dashed rounded-md text-muted-foreground">
            No upcoming tasks found.
          </div>
        )}
      </div>
    </div>
  );
}
