"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Task } from "@/types";
import { isOverdue, cn } from "@/lib/utils";
import { useTaskStore } from "@/store/task-store";
import { TaskDialog } from "./task-dialog";
import { Button } from "./ui/button";
import { Plus, History, Trash2, Pencil } from "lucide-react";
import { TaskHistoryDialog } from "./task-history-dialog";
import { motion } from "framer-motion"; // Import motion

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const { updateTask, deleteTask } = useTaskStore();

  const handleToggleTask = (taskId: string, completed: boolean) => {
    updateTask(taskId, { completed: !completed });
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      await deleteTask(taskId);
    }
  };

  return (
    <motion.div // Wrap with motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-2"
    >
      <div
        className={cn(
          "flex items-center p-2 rounded-md border group",
          isOverdue(task) && "border-red-500",
        )}
      >
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => handleToggleTask(task.id, task.completed)}
          className="mr-2"
        />
        <span
          className={task.completed ? "line-through text-muted-foreground" : ""}
        >
          {task.name}
        </span>

        <div className="ml-auto flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {task.history && task.history.length > 0 && (
            <TaskHistoryDialog history={task.history} taskName={task.name}>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <History className="h-4 w-4" />
              </Button>
            </TaskHistoryDialog>
          )}
          <TaskDialog listId={task.listId} parentId={task.id}>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Plus className="h-4 w-4" />
            </Button>
          </TaskDialog>
          <TaskDialog listId={task.listId} task={task}>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Pencil className="h-4 w-4" />
            </Button>
          </TaskDialog>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => handleDeleteTask(task.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {task.subTasks && task.subTasks.length > 0 && (
        <div className="ml-8 space-y-2">
          {task.subTasks.map((subTask) => (
            <TaskItem key={subTask.id} task={subTask} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
