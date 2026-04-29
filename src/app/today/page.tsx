"use client";

import { useEffect, useState } from "react";
import { useTaskStore } from "@/store/task-store";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { TaskItem } from "@/components/task-item"; // Import TaskItem

export default function TodayPage() {
  const { tasks, fetchTodayTasks } = useTaskStore(); // Removed updateTask
  const [showCompleted, setShowCompleted] = useState(true);

  useEffect(() => {
    fetchTodayTasks(showCompleted);
  }, [fetchTodayTasks, showCompleted]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Today</h1>
        <div className="flex items-center space-x-2">
          <Label htmlFor="show-completed">Show Completed</Label>
          <Switch
            id="show-completed"
            checked={showCompleted}
            onCheckedChange={setShowCompleted}
          />
          {/* TaskDialog for Today tasks - needs a listId, which is not directly available here. */}
          {/* <TaskDialog listId={inbox.id}>
            <Button>Add Task</Button>
          </TaskDialog> */}
        </div>
      </div>

      <div className="space-y-2">
        {tasks.length > 0 ? (
          tasks.map((task) => <TaskItem key={task.id} task={task} />)
        ) : (
          <div className="text-center py-10 border-2 border-dashed rounded-md text-muted-foreground">
            No tasks found for today. Enjoy your day!
          </div>
        )}
      </div>
    </div>
  );
}
