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
import { useForm, useWatch } from "react-hook-form"; // Import useForm and useWatch
import { zodResolver } from "@hookform/resolvers/zod"; // Import zodResolver
import * as z from "zod"; // Import zod

// Define schema for form validation
const formSchema = z.object({
  name: z.string().min(1, { message: "Task name is required." }),
  description: z.string().nullable(),
  date: z.date().nullable(),
  deadline: z.date().nullable(),
  reminder: z.string().nullable(), // Added reminder to formSchema
  estimate: z
    .string()
    .regex(/^\d{2}:\d{2}$/, { message: "Estimate must be in HH:mm format." }),
  priority: z.enum(["NONE", "LOW", "MEDIUM", "HIGH"]),
});

interface AddTaskDialogProps {
  children: React.ReactNode;
  listId: string;
  parentId?: string;
}

export function AddTaskDialog({
  children,
  listId,
  parentId,
}: AddTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const { addTask } = useTaskStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: null,
      date: null,
      deadline: null,
      reminder: null, // Added reminder to defaultValues
      estimate: "00:00",
      priority: "NONE",
    },
  });

  const dateValue = useWatch({ control: form.control, name: "date" });
  const deadlineValue = useWatch({ control: form.control, name: "deadline" });
  const priorityValue = useWatch({ control: form.control, name: "priority" });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const [hours, minutes] = values.estimate.split(":").map(Number);
    const estimateInMinutes = hours * 60 + minutes;

    await addTask({
      name: values.name,
      description: values.description,
      listId,
      date: values.date?.toISOString() || null,
      deadline: values.deadline?.toISOString() || null,
      reminder: values.reminder, // Added reminder
      estimate: estimateInMinutes,
      priority: values.priority,
      parentId: parentId || null,
    });
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {parentId ? "Add Sub-Task" : "Add New Task"}
          </DialogTitle>
          <DialogDescription>
            {parentId
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
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    <Button
                      variant={"outline"}
                      className={cn(
                        "col-span-3 justify-start text-left font-normal",
                        !dateValue && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateValue ? format(dateValue, "PPP") : <span>Pick a date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateValue || undefined}
                      onSelect={(date) => form.setValue("date", date || null)}
                      initialFocus
                    />
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
                      !form.watch("deadline") && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("deadline") ? (
                      format(form.watch("deadline")!, "PPP")
                    ) : (
                      <span>Pick a deadline</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.watch("deadline") || undefined}
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
                value={form.watch("priority")}
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
