import express, { Request, Response } from "express";
import pool from "../config/db.js";

const router = express.Router();

// ========================================== FORMS =============================================

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

        // Checks if there's already an existing ticket from ANY student trying to borrow the same book to prevent duplication
        const alreadyExistingTicketCheck = await pool.query("SELECT * FROM borrow_and_return_logs WHERE book_id = $1 AND status = 'Pending Borrow'", [book_id]);

        if (alreadyExistingTicketCheck.rows.length > 0) {
            // Check if the person who already holds the ticket is the CURRENT student or someone else
            const existingTicket = alreadyExistingTicketCheck.rows[0];

            if (existingTicket.student_id === student_id) {
                return res.status(400).json({
                    message: "Transaction Denied. You already have a pending ticket for this book."
                });
            } else {
                return res.status(400).json({
                    message: "Transaction Denied. Another student has already submitted a pending borrow request for this specific book copy."
                });
            }
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

        const book = bookCheck.rows[0];
        if (book.condition === "Lost") {
            return res.status(405).json({
                message: "Transaction Denied. This book is marked as Lost. Please consult with the staff."
            });
        }

        const query = `
            UPDATE borrow_and_return_logs 
            SET status = 'Pending Return'
            WHERE student_id = $1 AND book_id = $2 AND status = 'Checked Out'
            RETURNING *;
        `;
        const logResult = await pool.query(query, [student_id, book_id]);
        if (logResult.rowCount === 0) return res.status(404).json({ message: "No active checkout record found." });

        // Sends feedback
        res.status(201).json({
            message: "Book successfully Returned!",
            data: logResult.rows[0]
        });


    } catch (err: any) {
        console.error("Return transaction error:", err.message);
        res.status(500).json({ message: "Server database transaction failed.", error: err.message });
    }
});

// ========================================== STAFF LOGIN =============================================

// Staff Login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        return res.status(200).json({
            success: true,
            message: "Access granted!"
        });
    }

    return res.status(401).json({
        success: false,
        message: "Invalid credentials."
    });
});

// ========================================== FETCH DATABASE =============================================

// Get Books Database
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

// Get Students Database
router.get("/admin/studentdb", async (req: Request, res: Response) => {
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

// Get borrow and return form logs Database
router.get("/admin/logs", async (req: Request, res: Response) => {
    try {
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

// ========================================== CONDITIONAL =============================================

// Accept Borrow Form Function
router.patch("/admin/accept-borrow/:id", async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;

        await client.query("BEGIN");  // Staging the update before finalizing

        // Updates borrow_date and status
        const updateLogQuery = `
            UPDATE borrow_and_return_logs 
            SET borrow_date = NOW(),
                status = 'Checked Out'
            WHERE id = $1 
              AND status = 'Pending Borrow'
            RETURNING *;
        `;
        const logResult = await client.query(updateLogQuery, [id]);

        if (logResult.rowCount === 0) {
            await client.query("ROLLBACK"); // Cancel everything safely
            return res.status(400).json({
                message: "This book has already been borrowed, or there is no active borrow record."
            });
        }

        const bookId = logResult.rows[0].book_id;

        // Updates status
        const updateBookQuery = `
            UPDATE books 
            SET status = 'Not Available' 
            WHERE book_id = $1;
        `;
        await client.query(updateBookQuery, [bookId]);

        await client.query("COMMIT"); // Finalize all changes

        res.status(200).json({
            message: "Borrow request approved successfully and inventory locked!",
            data: logResult.rows[0]
        });

    } catch (err: any) {
        await client.query("ROLLBACK");
        console.error("Borrow Approval Error:", err.message);
        res.status(500).json({ message: "Database transaction failed.", error: err.message });
    } finally {
        client.release();
    }
});

// Accepts Return Form Function
router.patch("/admin/accept-return/:id", async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { book_condition } = req.body;

         if (!book_condition) {
            return res.status(400).json({ message: "Book condition is missing." });
        }

        await client.query("BEGIN");  // Staging the update before finalizing

        // Updates return_date and status
        const updateLogQuery = `
            UPDATE borrow_and_return_logs 
            SET return_date = NOW(),
                status = 'Returned',
                condition = $1
            WHERE id = $2 
              AND status = 'Pending Return'
            RETURNING *;
        `;
        const logResult = await client.query(updateLogQuery, [book_condition, id]);

        if (logResult.rowCount === 0) {
            await client.query("ROLLBACK"); // Cancel everything safely
            return res.status(400).json({
                message: "This book has already been returned, or there is no active borrow record."
            });
        }

        const bookId = logResult.rows[0].book_id;

        // Updates status
        const updateBookQuery = `
            UPDATE books 
            SET status = 'Available', condition = $1
            WHERE book_id = $2;
        `;
        await client.query(updateBookQuery, [book_condition, bookId]);

        await client.query("COMMIT"); // Finalize all changes

        res.status(200).json({
            message: "Return request approved successfully and inventory locked!",
            data: logResult.rows[0]
        });

    } catch (err: any) {
        await client.query("ROLLBACK");
        console.error("Borrow Approval Error:", err.message);
        res.status(500).json({ message: "Database transaction failed.", error: err.message });
    } finally {
        client.release();
    }
});

// ========================================== UPDATE =============================================

// Updates Student Data
router.put("/admin/student/:student_id", async (req: Request, res: Response) => {
    try {
        const { student_id } = req.params;
        const { student_id: new_student_id, name, section, active } = req.body;

        if (student_id !== new_student_id) {
            const conflictCheck = await pool.query("SELECT * FROM students WHERE student_id = $1", [new_student_id]);
            if (conflictCheck.rows.length > 0) {
                return res.status(400).json({ message: "Student ID already exists." });
            }
        }

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

// Updates Book Data
router.put("/admin/book/:book_id", async (req: Request, res: Response) => {
    try {
        const { book_id } = req.params;
        const { book_id: new_book_id, title, author, copyright_date, status, condition } = req.body;

        if (book_id !== new_book_id) {
            const conflictCheck = await pool.query("SELECT * FROM books WHERE book_id = $1", [new_book_id]);
            if (conflictCheck.rows.length > 0) {
                return res.status(400).json({ message: "The new barcode code already exists." });
            }
        }

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

// ========================================== ADD/INSERT =============================================

// Add New Book in the Database
router.post("/admin/addbook", async (req: Request, res: Response) => {
    try {
        const { book_id, title, author, copyright_date, status, condition } = req.body;

        if (!book_id || !title || !author || !copyright_date || !status || !condition) {
            return res.status(400).json({ message: "Please provide all required fields." })
        }

        const checkbookID = await pool.query("SELECT * FROM books where book_id = $1", [book_id])
        if (checkbookID.rows.length > 0) {
            return res.status(400).json({ message: "This Book ID already existed." })
        }

        const query = `
        INSERT INTO books (book_id, title, author, copyright_date, status, condition)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`
        const result = await pool.query(query, [book_id, title, author, copyright_date, status, condition])

        res.status(201).json({
            message: "Book has been successfully made!",
            data: result.rows[0]
        });


    } catch (err: any) {
        console.error("Book add error:", err.message);
        res.status(500).json({ message: "Server database transaction failed.", error: err.message });
    }
});

// ========================================== DELETE =============================================

// Deletes when declined Borrow Form
router.delete("/admin/logs/decline/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const query = `
            DELETE FROM borrow_and_return_logs 
            WHERE id = $1 AND status = 'Pending Borrow' 
            RETURNING *;
        `;
        const result = await pool.query(query, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "No active pending borrow request found matching that log identifier."
            });
        }

        res.status(200).json({
            message: "Borrow application successfully declined and wiped from database queue!",
            declinedTicket: result.rows[0]
        });

    } catch (err: any) {
        console.error("Decline ticket log clear failure:", err.message);
        res.status(500).json({ message: "Server database transaction failed.", error: err.message });
    }
});

// Deletes Book Data
router.delete("/admin/removebook/:book_id", async (req: Request, res: Response) => {
    try {
        const { book_id } = req.params;

        const query = "DELETE FROM books WHERE book_id = $1 RETURNING *;";
        const result = await pool.query(query, [book_id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Book barcode not found in catalog index." });
        }

        res.status(200).json({
            message: "Book successfully purged from inventory archives!",
            deletedAsset: result.rows[0]
        });

    } catch (err: any) {
        console.error("Book deletion execution failure:", err.message);

        //If a book has history inside logs, standard configuration blocks hard drops
        if (err.message.includes("violates foreign key constraint")) {
            return res.status(400).json({
                message: "Cannot destroy asset. This book has existing transactional log records linked to it."
            });
        }
        res.status(500).json({ message: "Server database transaction failed.", error: err.message });
    }
});

export default router;