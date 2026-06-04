import express from "express";
import dotenv from "dotenv";
import cors from "cors";


dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173' 
}));


// Root Route that displays
app.get("/", (req, res) => {
    res.send("Library System backend is running");
});


const PORT: number = process.env.PORT ? Number(process.env.PORT) : 4000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});