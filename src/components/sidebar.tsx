"use client";

import React, { useEffect, useState } from "react";
import { useListStore } from "@/store/list-store";
import { useTaskStore } from "@/store/task-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { AddListDialog } from "./add-list-dialog";
import { AddTaskDialog } from "./add-task-dialog";
import Link from "next/link";
import {
  Inbox,
  Calendar,
  CalendarDays,
  Filter,
  CheckCircle,
  Star,
  ChevronDown,
  PlusCircle,
  Search,
  Plus,
  MoreVertical,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const Sidebar = () => {
  const { lists, fetchLists, deleteList } = useListStore();
  const { searchResults, searchTasks, clearSearchResults } = useTaskStore();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  useEffect(() => {
    if (searchQuery.length > 2) {
      searchTasks(searchQuery);
    } else {
      clearSearchResults();
    }
  }, [searchQuery, searchTasks, clearSearchResults]);

  const handleDeleteList = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      confirm("Are you sure you want to delete this list and all its tasks?")
    ) {
      await deleteList(id);
    }
  };

  return (
    <aside className="w-80 h-screen bg-sidebar text-sidebar-foreground p-4 flex flex-col border-r border-sidebar-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarFallback>N</AvatarFallback>
          </Avatar>
          <h1 className="text-lg font-semibold">n0rd</h1>
        </div>
      </div>

      <div className="mb-6">
        <AddTaskDialog listId={lists[0]?.id}>
          <Button className="w-full justify-start mb-2">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add task
          </Button>
        </AddTaskDialog>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        {searchQuery.length > 2 && searchResults.length > 0 && (
          <div className="mt-2 p-2 border rounded-md bg-background">
            <h3 className="text-sm font-semibold mb-1">Search Results</h3>
            <ul className="space-y-1">
              {searchResults.map((task) => (
                <li key={task.id} className="text-sm">
                  <Link href={`/task/${task.id}`} className="hover:underline">
                    {task.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-2">
        <Link
          href="/"
          className="flex items-center p-2 rounded-md bg-sidebar-accent text-sidebar-accent-foreground"
        >
          <Inbox className="mr-3 h-5 w-5" />
          <span className="flex-1">Inbox</span>
          {/* <span className="text-xs text-muted-foreground">5</span> */}
        </Link>
        <Link href="/today" className="flex items-center p-2 rounded-md">
          <Calendar className="mr-3 h-5 w-5" />
          <span className="flex-1">Today</span>
          {/* <span className="text-xs text-muted-foreground">2</span> */}
        </Link>
        <Link href="/next-7-days" className="flex items-center p-2 rounded-md">
          <CalendarDays className="mr-3 h-5 w-5" />
          <span>Next 7 Days</span>
        </Link>
        <Link href="/upcoming" className="flex items-center p-2 rounded-md">
          <CalendarDays className="mr-3 h-5 w-5" />
          <span>Upcoming</span>
        </Link>
        <Link href="#" className="flex items-center p-2 rounded-md">
          <Filter className="mr-3 h-4 w-4" />
          <span>Filters & Labels</span>
        </Link>
        <Link href="#" className="p-2 flex items-center rounded-md">
          <CheckCircle className="mr-3 h-5 w-5" />
          <span>Completed</span>
        </Link>
      </nav>

      <div className="space-y-4">
        <Collapsible>
          <CollapsibleTrigger className="w-full flex items-center text-sm font-semibold">
            <ChevronDown className="mr-2 h-4 w-4" />
            Favorites
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-6 space-y-2 mt-2">
            <Link href="/all" className="flex items-center text-sm">
              <Star className="mr-3 h-4 w-4 text-yellow-500" />
              <span className="flex-1">All Tasks</span>
              {/* <span className="text-xs text-muted-foreground">12</span> */}
            </Link>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible defaultOpen>
          <div className="w-full flex items-center text-sm font-semibold justify-between">
            <CollapsibleTrigger className="flex items-center">
              <ChevronDown className="mr-2 h-4 w-4" />
              My Projects
            </CollapsibleTrigger>
            <AddListDialog>
              <Button variant="ghost" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </AddListDialog>
          </div>
          <CollapsibleContent className="pl-6 space-y-2 mt-2">
            {lists.map((list) => (
              <div key={list.id} className="flex items-center text-sm group">
                <Link href="#" className="flex-1 flex items-center">
                  <span
                    className="mr-3 h-4 w-4 text-center"
                    style={{ color: list.color }}
                  >
                    {list.icon}
                  </span>
                  <span className="flex-1">{list.name}</span>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={(e) => handleDeleteList(e, list.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete List
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </div>

      <div className="mt-auto -mx-4 -mb-4 p-4 border-t border-sidebar-border">
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <span>Lasse</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
