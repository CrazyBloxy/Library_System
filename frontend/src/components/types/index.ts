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

export interface Data_Logs {
  id: number;
  student_id: string;
  name: string;
  section: string;
  book_id: string;
  title: string;
  borrow_date: string;
  return_date: string;
  status: 'Pending Borrow' | 'Checked Out' | 'Pending Return' | 'Returned';
  condition: 'Good' | 'Damaged' | 'Lost';
}

