import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";


dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());


app.use(cors({
  origin: 'http://localhost:5173' 
}));


// Root Route that displays if backend is running
app.get("/", (req: Request, res: Response) => {
    res.send("Library System backend is running");
});

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("Unhandled error:", err.stack);
    res.status(500).json({ message: "Internal server error" });
});

// Server Port
const PORT: number = process.env.PORT ? Number(process.env.PORT) : 4000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});