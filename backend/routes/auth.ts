import express, { Request, Response } from "express";
import pool from "../config/db.js";


const router = express.Router();


// Student Form (One-Time-Register)
router.post("/studentform", async (req: Request, res: Response) => {
    try {
        // Checks if user did not put anything.
        const { student_id, name, section } = req.body;
        if (!student_id || !name || !section) {
            return res.status(400).json({ message: "Please provide all required fields." });
        }

        // Checks if user already existed in the database
        const userExist = await pool.query("SELECT * FROM students WHERE student_id = $1", [student_id]);
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

// Return Form
router.post("/returnform", async (req: Request, res: Response) => {
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

        const query = `
            UPDATE borrow_and_return_logs 
            SET status = 'Pending Return'
            WHERE student_id = $1 AND book_id = $2 AND status = 'Not Available'
            RETURNING *;
        `;
        const logResult = await pool.query(query, [student_id, book_id]);
        if (logResult.rowCount === 0) return res.status(404).json({ message: "No active checkout record found." });

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

// GET
router.get("/bookdb", async (req: Request, res: Response) => {
    try {
        // Gets the book intentory
        const query = `
            SELECT book_id, title, author, copyright_date, status, condition 
            FROM books 
            ORDER BY title ASC;
        `;
        const result = await pool.query(query);

        res.status(200).json({
            message: "Books inventory fetched successfully!",
            count: result.rowCount,
            data: result.rows
        });

    } catch (err: any) {
        console.error("Fetch Error:", err.message);
        res.status(500).json({ message: "Server database failed to retrieve.", error: err.message });
    }
});

router.get("/studentdb", async (req: Request, res: Response) => {
    try {
        // Gets the student data
        const query = `
            SELECT student_id, name, section, active
            FROM students
            ORDER BY name ASC;
        `;
        const result = await pool.query(query);

        res.status(200).json({
            message: "Student data fetched successfully!",
            count: result.rowCount,
            data: result.rows
        });

    } catch (err: any) {
        console.error("Fetch Error:", err.message);
        res.status(500).json({ message: "Server database failed to retrieve.", error: err.message });
    }
});


router.get("/admin/logs", async (req: Request, res: Response) => {
    try {
        // Gets the student data
        const query = `
            SELECT 
                logs.id, logs.student_id, student.name, student.section,
                logs.book_id, book.title, logs.borrow_date, logs.return_date, logs.status, logs.condition
            FROM borrow_and_return_logs AS logs
            INNER JOIN students AS student ON logs.student_id = student.student_id
            INNER JOIN books AS book ON logs.book_id = book.book_id
            ORDER BY logs.id DESC;
        `;
        const result = await pool.query(query);

        res.status(200).json({
            message: "Logs data fetched successfully!",
            count: result.rowCount,
            data: result.rows
        });

    } catch (err: any) {
        console.error("Fetch Error:", err.message);
        res.status(500).json({ message: "Server database failed to retrieve.", error: err.message });
    }
});

router.patch("/admin/accept-borrow", async (req: Request, res: Response) => {
    try {
        const { student_id, book_id } = req.body;
        if (!student_id || !book_id) {
            return res.status(400).json({ message: "Student ID and Book ID are required." });
        }

        await pool.query("BEGIN");  // Staging the update before finalizing

        // If successfull, it will run this and update
        const updateLogQuery = `
            UPDATE borrow_and_return_logs 
            SET borrow_date = NOW(),
                status = 'Checked Out'
            WHERE student_id = $1 
              AND book_id = $2 
              AND status = 'Pending Borrow'
            RETURNING *;
        `;
        const logResult = await pool.query(updateLogQuery, [student_id, book_id]);

        if (logResult.rowCount === 0) {
            await pool.query("ROLLBACK"); // Cancel everything safely
            return res.status(400).json({ 
                message: "This book has already been borrowed, or there is no active borrow record." 
            });
        }

        // If successfull, it will run this and update
        const updateBookQuery = `
            UPDATE books 
            SET status = 'Not Available' 
            WHERE book_id = $1;
        `;
        await pool.query(updateBookQuery, [book_id]);
        
        await pool.query("COMMIT"); // Finalize all changes
    } catch (err: any) {
        await pool.query("ROLLBACK");
        console.error("Borrow Approval Error:", err.message);
        res.status(500).json({ message: "Database transaction failed.", error: err.message });
    }
});

router.patch("/admin/accept-return", async (req: Request, res: Response) => {
    try {
        const { student_id, book_id, condition } = req.body;
        if (!student_id || !book_id || condition) {
            return res.status(400).json({ message: "Student ID, Book ID, and condition are required." });
        }

        await pool.query("BEGIN");  // Staging the update before finalizing

        // If successfull, it will run this and update
        const updateLogQuery = `
            UPDATE borrow_and_return_logs 
            SET return_date = NOW(),
                status = 'Available',
                condition = $3
            WHERE student_id = $1 
              AND book_id = $2 
              AND status = 'Pending Return'
            RETURNING *;
        `;
        const logResult = await pool.query(updateLogQuery, [student_id, book_id, condition]);

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
    } catch (err: any) {
        await pool.query("ROLLBACK");
        console.error("Borrow Approval Error:", err.message);
        res.status(500).json({ message: "Database transaction failed.", error: err.message });
    }
});

router.put("/students/:student_id", async (req: Request, res: Response) => {
    try {
        const { student_id } = req.params;
        const { student_id: new_student_id, name, section, active } = req.body;

        const query = `
            UPDATE students 
            SET student_id = $1,
                name = $2, 
                section = $3, 
                active = $4
            WHERE student_id = $5
            RETURNING *;
        `;
        
        const result = await pool.query(query, [new_student_id, name, section, active, student_id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Student record not found in the master index." });
        }

        res.status(200).json({
            message: "Student profile updated successfully!",
            data: result.rows[0]
        });

    } catch (err: any) {
        console.error("Student profile edit error:", err.message);
        res.status(500).json({ message: "Server database transaction failed.", error: err.message });
    }
});


router.put("/admin/books/:book_id", async (req: Request, res: Response) => {
    try {
        const { book_id } = req.params;
        const { book_id: new_book_id, title, author, copyright_date, status, condition } = req.body;

        const query = `
            UPDATE books 
            SET book_id = $1,
                title = $2, 
                author = $3, 
                copyright_date = $4, 
                status = $5, 
                condition = $6
            WHERE book_id = $7
            RETURNING *;
        `;

        const result = await pool.query(query, [new_book_id, title, author, copyright_date, status, condition, book_id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Book barcode identifier not found in warehouse index." });
        }

        res.status(200).json({
            message: "Book catalog profile saved and synced successfully!",
            data: result.rows[0]
        });

    } catch (err: any) {
        console.error("Book details edit error:", err.message);
        res.status(500).json({ message: "Server database transaction failed.", error: err.message });
    }
});




export default router;