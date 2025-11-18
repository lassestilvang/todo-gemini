export interface List {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  name: string;
  description: string | null;
  date: string | null;
  deadline: string | null;
  reminder: string | null;
  estimate: number;
  actualTime: number | null;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  completed: boolean;
  recurring: string | null; // JSON stored as string
  createdAt: string;
  updatedAt: string;
  listId: string;
  parentId: string | null;
  subTasks?: Task[]; // Added subTasks
  history?: TaskHistory[]; // Added history
}

export interface TaskHistory {
  id: string;
  change: string;
  createdAt: string;
  taskId: string;
}
