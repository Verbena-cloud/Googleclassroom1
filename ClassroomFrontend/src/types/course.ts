// Course related types
export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface Course {
  courseID: string;
  courseName: string;
  section?: string;
  description?: string;
  teacher?: Teacher;
  createdAt?: string;
  updatedAt?: string;
}

export interface Announcement {
  title: string;
  description: string;
  actions: {
    text: string;
    color: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning";
    variant: "text" | "outlined" | "contained";
  }[];
}
