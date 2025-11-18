"use client";

import { useEffect, useState } from "react";
import { useTaskStore } from "@/store/task-store";
import { Checkbox } from "@/components/ui/checkbox";
import { AddTaskDialog } from "@/components/add-task-dialog";
import { Button } from "@/components/ui/button";
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
          {/* AddTaskDialog for Today tasks - needs a listId, which is not directly available here. */}
          {/* <AddTaskDialog listId={inbox.id}>
            <Button>Add Task</Button>
          </AddTaskDialog> */}
        </div>
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}