export interface Student {
  id: string;
  name: string;
  studentId: string;
  role: "student";
}

export interface Book {
  id: string;
  title: string;
  author: string;
  availableCopies: number;
  status: "available" | "unavailable";
  condition: "good" | "bad" | "lost";
}

export interface BorrowRequest {
  id: number;
  studentId: string;
  bookId: number;
  requestDate: string;
  status: "pending" | "approved" | "declined";
}

export interface ReturnRequest {
    id: number;
    studentId: string;
    bookId: number;
    requestDate: string;
    status: "pending" | "returned";
    IsDamaged: boolean;
}