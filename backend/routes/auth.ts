import express, { Request, Response } from "express";
import pool from "../config/db.js";


const router = express.Router();


// Student Form (One-Time-Register)
router.post("/studentform", async (req: Request, res: Response) => {
    try {
        // Checks if user did not put anything.
        const { student_id, name , section } = req.body;
        if (!student_id || !name || !section) {
            return res.status(400).json({ message: "Please provide all required fields." });
        }
        
        // Checks if user already existed in the database
        const userExist = await pool.query("SELECT * FROM students WHERE students_id = $1", [student_id]);
        if (userExist.rows.length > 0) {
            return res.status(400).json({ message: "User already exists." });
        }
    } catch (err: any) {
        console.error("Student Sign Up error:", err.message);
        res.status(500).json({ message: "Student Sign Up Failed.", error: err.message });
    }
});

// Borrow Form
router.post("/borrowform", async (req: Request, res: Response) => {
    try {
        // Checks if user did not put anything.
        const { student_id, book_id } = req.body;
        if (!student_id || !book_id) {
            return res.status(400).json({ message: "Please provide all required fields." });
        }
        
        // Checks if user already existed in the database
        const studentCheck = await pool.query("SELECT * FROM students WHERE student_id = $1", [student_id]);
        
        if (studentCheck.rows.length === 0) {
            return res.status(404).json({ message: "This student ID is not registered in the system." });
        }

        // Checks if the student account is deactivated
        const student = studentCheck.rows[0];
        if (student.is_active === false) {
            return res.status(403).json({ message: "This student account has been deactivated." });
        }

        // Checks if the book actually exist in the database
        const bookCheck = await pool.query("SELECT * FROM books WHERE book_id = $1", [book_id]);
        if (bookCheck.rows.length === 0) {
            return res.status(404).json({ message: "This Book ID code does not exist in the inventory." });
        }



    } catch (err: any) {
        console.error("Borrow transaction error:", err.message);
        res.status(500).json({ message: "Server database transaction failed.", error: err.message });
    }
});

export default router;