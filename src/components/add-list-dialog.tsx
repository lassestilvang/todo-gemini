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
import { useListStore } from "@/store/list-store";
import { useForm } from "react-hook-form"; // Import useForm
import { zodResolver } from "@hookform/resolvers/zod"; // Import zodResolver
import * as z from "zod"; // Import zod

// Define schema for form validation
const formSchema = z.object({
  name: z.string().min(1, { message: "List name is required." }),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: "Invalid color format.",
  }),
  icon: z
    .string()
    .min(1, { message: "Icon is required." })
    .max(2, { message: "Icon must be an emoji (1 or 2 characters)." }),
});

interface AddListDialogProps {
  children: React.ReactNode;
}

export function AddListDialog({ children }: AddListDialogProps) {
  const [open, setOpen] = useState(false);
  const { addList, isLoading } = useListStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      color: "#a1a1aa",
      icon: "📝",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await addList(values);
    form.reset({
      name: "",
      color: "#a1a1aa",
      icon: "📝",
    }); // Reset form fields with default values
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New List</DialogTitle>
          <DialogDescription>
            Create a new list to organize your tasks.
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
                {...form.register("name")} // Register input with react-hook-form
                className="col-span-3"
              />
              {form.formState.errors.name && (
                <p className="col-span-4 text-right text-red-500 text-sm">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="color" className="text-right">
                Color
              </Label>
              <Input
                id="color"
                type="color"
                {...form.register("color")} // Register input with react-hook-form
                className="col-span-3 h-8"
              />
              {form.formState.errors.color && (
                <p className="col-span-4 text-right text-red-500 text-sm">
                  {form.formState.errors.color.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="icon" className="text-right">
                Icon (Emoji)
              </Label>
              <Input
                id="icon"
                {...form.register("icon")} // Register input with react-hook-form
                className="col-span-3"
              />
              {form.formState.errors.icon && (
                <p className="col-span-4 text-right text-red-500 text-sm">
                  {form.formState.errors.icon.message}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save List"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
