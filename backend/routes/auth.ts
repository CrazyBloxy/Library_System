import express, { Request, Response } from "express";
import pool from "../config/db.js";


const router = express.Router();


// Student Form (One-Time-Register)
router.post("/student", async (req: Request, res: Response) => {
    try {
        // Checks if user did not put anything.
        const { student_id, name, section } = req.body;
        if (!student_id || !name || !section) {
            return res.status(400).json({ message: "Please provide all required fields." });
        }

        // Checks if user already existed in the database
        const userExist = await pool.query("SELECT * FROM students WHERE students_id = $1", [student_id]);
        if (userExist.rows.length > 0) {
            return res.status(400).json({ message: "User already exists." });
        }

        // If successfull, it will run this and store it in the database
        const insertLogQuery = `
            INSERT INTO students (student_id, name, section) 
            VALUES ($1, $2, $3) 
            RETURNING *;
        `;
        const logResult = await pool.query(insertLogQuery, [student_id, name, section]);

        // Sends feedback
        res.status(201).json({
            message: "Student Sign up successfully made!",
            data: logResult.rows[0]
        });


    } catch (err: any) {
        console.error("Student Sign Up error:", err.message);
        res.status(500).json({ message: "Server database transaction failed.", error: err.message });
    }
});

// Borrow Form
router.post("/borrow", async (req: Request, res: Response) => {
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

        // Checks if the book is currently available. Otherwise, form will be blocked
        const book = bookCheck.rows[0];
        if (book.status === "Not Available") {
            const reason = book.condition === "Lost"
                ? "This book is marked as Lost."
                : "This book is currently checked out.";

            return res.status(400).json({
                message: `Transaction Denied. ${reason}`
            });
        }

        // Checks if theres already existing ticket to prevent dupelication
        const ticketCheck = await pool.query("SELECT * FROM borrow_and_return_logs WHERE student_id = $1 AND book_id = $2 AND status = 'Not Available'", [student_id, book_id])
        if (ticketCheck.rows.length > 0) {
            return res.status(400).json({
                message: "Transaction Denied. This student already has an active ticket for this book and must return their current copy first."
            });
        }

        // If successfull, it will run this and store it in the database
        const insertLogQuery = `
            INSERT INTO borrow_and_return_logs (student_id, book_id) 
            VALUES ($1, $2) 
            RETURNING *;
        `;
        const logResult = await pool.query(insertLogQuery, [student_id, book_id]);

        // Sends feedback
        res.status(201).json({
            message: "Book successfully checked out!",
            data: logResult.rows[0]
        });

    } catch (err: any) {
        console.error("Borrow transaction error:", err.message);
        res.status(500).json({ message: "Server database transaction failed.", error: err.message });
    }
});

router.post("/return", async (req: Request, res: Response) => {
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

        await pool.query("BEGIN");  // Staging the update before finalizing

        // If successfull, it will run this and update
        const updateLogQuery = `
            UPDATE borrow_and_return_logs 
            SET return_date = NOW(), 
                status = 'Available'
            WHERE student_id = $1 
              AND book_id = $2 
              AND status = 'Not Available'
            RETURNING *;
        `;
        const logResult = await pool.query(updateLogQuery, [student_id, book_id]);

        if (logResult.rowCount === 0) {
            await pool.query("ROLLBACK"); // Cancel everything safely
            return res.status(400).json({ 
                message: "This book has already been returned, or there is no active borrow record." 
            });
        }

        // If successfull, it will run this and update
        const updateBookQuery = `
            UPDATE books 
            SET status = 'Available' 
            WHERE book_id = $1;
        `;
        await pool.query(updateBookQuery, [book_id]);
        
        await pool.query("COMMIT"); // Finalize all changes
        
        // Sends feedback
        res.status(200).json({
            message: "Book successfully Returned!",
            data: logResult.rows[0]
        });


    } catch (err: any) {
        console.error("Return transaction error:", err.message);
        res.status(500).json({ message: "Server database transaction failed.", error: err.message });
    }
});

export default router;