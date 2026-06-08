export interface Student {
  student_id: string;
  name: string;
  section: string;
  active: boolean;
}

export interface Book {
  book_id: string;
  title: string;
  author: string;
  copyright_date: number;
  status: 'Available' | 'Not Available';
  condition: 'Good' | 'Damaged' | 'Lost';
}

