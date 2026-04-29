"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useTaskStore } from "@/store/task-store";
import { useListStore } from "@/store/list-store"; // Import useListStore
import { Textarea } from "./ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Task } from "@/types";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Define schema for form validation
const formSchema = z.object({
  name: z.string().min(1, { message: "Task name is required." }),
  description: z.string().nullable(),
  date: z.date().nullable(),
  deadline: z.date().nullable(),
  reminder: z.string().nullable(),
  estimate: z
    .string()
    .regex(/^\d{2}:\d{2}$/, { message: "Estimate must be in HH:mm format." }),
  priority: z.enum(["NONE", "LOW", "MEDIUM", "HIGH"]),
  listId: z.string().min(1, { message: "List is required." }), // Added listId
});

interface TaskDialogProps {
  children?: React.ReactNode;
  listId: string;
  parentId?: string;
  task?: Task;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TaskDialog({
  children,
  listId,
  parentId,
  task,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: TaskDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen =
    externalOnOpenChange !== undefined ? externalOnOpenChange : setInternalOpen;

  const { addTask, updateTask } = useTaskStore();
  const { lists } = useListStore(); // Get lists

  const formatEstimate = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: task?.name || "",
      description: task?.description || null,
      date: task?.date ? new Date(task.date) : null,
      deadline: task?.deadline ? new Date(task.deadline) : null,
      reminder: task?.reminder || null,
      estimate: task ? formatEstimate(task.estimate) : "00:00",
      priority: task?.priority || "NONE",
      listId: task?.listId || listId, // Default to listId
    },
  });

  // Update form values when task changes
  React.useEffect(() => {
    if (task && open) {
      form.reset({
        name: task.name,
        description: task.description,
        date: task.date ? new Date(task.date) : null,
        deadline: task.deadline ? new Date(task.deadline) : null,
        reminder: task.reminder,
        estimate: formatEstimate(task.estimate),
        priority: task.priority,
        listId: task.listId,
      });
    }
  }, [task, open, form]);

  const dateValue = useWatch({ control: form.control, name: "date" });
  const deadlineValue = useWatch({ control: form.control, name: "deadline" });
  const priorityValue = useWatch({ control: form.control, name: "priority" });
  const currentListId = useWatch({ control: form.control, name: "listId" });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const [hours, minutes] = values.estimate.split(":").map(Number);
    const estimateInMinutes = hours * 60 + minutes;

    const taskData = {
      name: values.name,
      description: values.description,
      listId: values.listId,
      date: values.date?.toISOString() || null,
      deadline: values.deadline?.toISOString() || null,
      reminder: values.reminder,
      estimate: estimateInMinutes,
      priority: values.priority,
      parentId: parentId || task?.parentId || null,
    };

    if (task) {
      await updateTask(task.id, taskData);
    } else {
      await addTask(taskData);
    }

    if (!task) {
      form.reset();
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {task ? "Edit Task" : parentId ? "Add Sub-Task" : "Add New Task"}
          </DialogTitle>
          <DialogDescription>
            {task
              ? "Update the details of your task."
              : parentId
                ? "Create a new sub-task for this task."
                : "Create a new task for your list."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                {...form.register("name")}
                className="col-span-3"
              />
              {form.formState.errors.name && (
                <p className="col-span-4 text-right text-red-500 text-sm">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                {...form.register("description")}
                className="col-span-3"
              />
              {form.formState.errors.description && (
                <p className="col-span-4 text-right text-red-500 text-sm">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="listId" className="text-right">
                Project
              </Label>
              <Select
                value={currentListId}
                onValueChange={(value) => form.setValue("listId", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {lists.map((list) => (
                    <SelectItem key={list.id} value={list.id}>
                      <span className="flex items-center">
                        <span className="mr-2">{list.icon}</span>
                        {list.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.listId && (
                <p className="col-span-4 text-right text-red-500 text-sm">
                  {form.formState.errors.listId.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "col-span-3 justify-start text-left font-normal",
                      !dateValue && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateValue ? (
                      format(dateValue, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateValue || undefined}
                    onSelect={(date) => form.setValue("date", date || null)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.date && (
                <p className="col-span-4 text-right text-red-500 text-sm">
                  {form.formState.errors.date.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deadline" className="text-right">
                Deadline
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "col-span-3 justify-start text-left font-normal",
                      !deadlineValue && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deadlineValue ? (
                      format(deadlineValue, "PPP")
                    ) : (
                      <span>Pick a deadline</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={deadlineValue || undefined}
                    onSelect={(date) => form.setValue("deadline", date || null)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.deadline && (
                <p className="col-span-4 text-right text-red-500 text-sm">
                  {form.formState.errors.deadline.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="estimate" className="text-right">
                Estimate (HH:mm)
              </Label>
              <Input
                id="estimate"
                type="time"
                {...form.register("estimate")}
                className="col-span-3"
              />
              {form.formState.errors.estimate && (
                <p className="col-span-4 text-right text-red-500 text-sm">
                  {form.formState.errors.estimate.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">
                Priority
              </Label>
              <Select
                value={priorityValue}
                onValueChange={(value: Task["priority"]) =>
                  form.setValue("priority", value)
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">None</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.priority && (
                <p className="col-span-4 text-right text-red-500 text-sm">
                  {form.formState.errors.priority.message}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save Task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
