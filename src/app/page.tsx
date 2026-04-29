"use client";

import { useEffect, useState } from "react";
import { useTaskStore } from "@/store/task-store";
import { useListStore } from "@/store/list-store";
import { Button } from "@/components/ui/button";
import { TaskDialog } from "@/components/task-dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { TaskItem } from "@/components/task-item"; // Import TaskItem

export default function Home() {
  const { tasks, fetchTasks } = useTaskStore(); // Removed updateTask
  const { lists } = useListStore();
  const inbox = lists.find((list) => list.name === "Inbox");
  const [showCompleted, setShowCompleted] = useState(true);

  useEffect(() => {
    if (inbox) {
      fetchTasks(inbox.id, showCompleted);
    }
  }, [inbox, fetchTasks, showCompleted]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Inbox</h1>
        <div className="flex items-center space-x-2">
          <Label htmlFor="show-completed">Show Completed</Label>
          <Switch
            id="show-completed"
            checked={showCompleted}
            onCheckedChange={setShowCompleted}
          />
          {inbox && (
            <TaskDialog listId={inbox.id}>
              <Button>Add Task</Button>
            </TaskDialog>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {tasks.length > 0 ? (
          tasks.map((task) => <TaskItem key={task.id} task={task} />)
        ) : (
          <div className="text-center py-10 border-2 border-dashed rounded-md text-muted-foreground">
            No tasks found. Click "Add Task" to get started!
          </div>
        )}
      </div>
    </div>
  );
}
