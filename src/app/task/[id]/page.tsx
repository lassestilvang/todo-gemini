"use client";

import { useEffect, useState } from "react";
import { useTaskStore } from "@/store/task-store";
import { Task } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { isOverdue, cn } from "@/lib/utils";

interface TaskPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function TaskPage({ params }: TaskPageProps) {
  const [task, setTask] = useState<Task | null>(null);
  const { updateTask } = useTaskStore();

  useEffect(() => {
    const fetchTask = async () => {
      const { id } = await params;
      const response = await fetch(`/api/tasks/${id}`);
      const data = await response.json();
      setTask(data);
    };
    fetchTask();
  }, [params]);

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    if (task) {
      await updateTask(taskId, { completed: !completed });
      setTask((prevTask) =>
        prevTask ? { ...prevTask, completed: !prevTask.completed } : null,
      );
    }
  };

  if (!task) {
    return <div>Loading task...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => handleToggleTask(task.id, task.completed)}
        />
        <h1
          className={cn(
            "text-2xl font-bold",
            task.completed && "line-through text-muted-foreground",
          )}
        >
          {task.name}
        </h1>
      </div>
      {task.description && (
        <p className="text-muted-foreground">{task.description}</p>
      )}
      {task.date && <p>Date: {format(new Date(task.date), "PPP")}</p>}
      {task.deadline && (
        <p>Deadline: {format(new Date(task.deadline), "PPP")}</p>
      )}
      {task.estimate !== undefined && (
        <p>
          Estimate: {Math.floor(task.estimate / 60)}h {task.estimate % 60}m
        </p>
      )}
      {task.priority && <p>Priority: {task.priority}</p>}
      {isOverdue(task) && (
        <p className="text-red-500 font-semibold">Overdue!</p>
      )}

      {task.history && task.history.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">History</h2>
          {task.history.map((entry) => (
            <div key={entry.id} className="text-sm border p-2 rounded-md">
              <p className="font-medium">{entry.change}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(entry.createdAt), "PPP p")}
              </p>
            </div>
          ))}
        </div>
      )}

      {task.subTasks && task.subTasks.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Sub-Tasks</h2>
          {task.subTasks.map((subTask) => (
            <div
              key={subTask.id}
              className="flex items-center p-2 rounded-md border"
            >
              <Checkbox checked={subTask.completed} className="mr-2" />
              <span>{subTask.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
