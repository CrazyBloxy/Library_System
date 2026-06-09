import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
/* Icons */
import { TbDatabaseSearch } from "react-icons/tb";
/* Forms */
import { StudentForm } from "./forms/StudentForm";
import { BorrowForm } from "./forms/BorrowForm";
import { ReturnForm } from "./forms/ReturnForm";
/* Services (Backend API) & Types */
import api from "../../services/api";
import type { Book } from "../types/index";

export const Home = () => {
    const [activeForm, setActiveForm] = useState<string | null>(null);
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const navigate = useNavigate();

    {/* Closes Pop UI Forms */ }
    const formsComponents: Record<string, React.ReactNode> = {
        student: <StudentForm onClose={() => setActiveForm(null)} />,
        borrow: <BorrowForm onClose={() => setActiveForm(null)} />,
        return: <ReturnForm onClose={() => setActiveForm(null)} />
    }


    useEffect(() => {
        // Directs them back to staff dashboard if still logged in
        if (localStorage.getItem("hasAccess") === "true") {
        navigate("/dashboard")
        return;
    }
        const fetchBooks = async () => {
            try {
                const response = await api.get<{ message: string; count: number; data: Book[] }>("/api/bookdb");
                setBooks(response.data.data);
                setError(null);
            } catch (err: any) {
                console.error("API Error:", err)
                setError('Database link failed. Is your Express server running?');
            } finally {
                setLoading(false);
            }
        };
        fetchBooks();
    }, []);

    // Search Filter
    const filteredBooks = books.filter((book) => {
        const query = searchQuery.toLowerCase();
        return (
            book.title?.toLowerCase().includes(query) ||
            book.author?.toLowerCase().includes(query) ||
            book.book_id?.toLowerCase().includes(query)
        );
    });

    // Loading & Error Handling
    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-error max-w-6xl mx-auto mt-12">
                <span>{error}</span>
            </div>
        );
    }

    return (
        <>
            {/* Search Bar */}
            <label className="input flex mx-auto mt-5">
                <TbDatabaseSearch />
                <input
                    type="search"
                    required
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </label>

            {/* Database Table */}
            <div className="overflow-y-auto max-h-96 h-96 mt-3 mx-auto w-full max-w-6xl flex flex-col border-4 rounded-lg">
                <table className="table table-xs">
                    <thead>
                        <tr>
                            <th>BOOK I.D.</th>
                            <th>TITLE</th>
                            <th>AUTHOR</th>
                            <th>COPYRIGHT DATE</th>
                            <th>STATUS</th>
                            <th>CONDITION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBooks.length > 0 ? (
                            filteredBooks.map((book) => (
                                <tr key={book.book_id}>
                                    <td>{book.book_id}</td>
                                    <td>{book.title}</td>
                                    <td>{book.author}</td>
                                    <td>{book.copyright_date}</td>
                                    <td>{book.status}</td>
                                    <td>{book.condition}</td>
                                </tr>
                            ))
                        ) : (<tr>
                            <td colSpan={5} className="text-center text-2xl py-12 text-base-400 font-semibold">
                                No books match your search query "{searchQuery}" {/* Rework this!!!!!!!!!!!!!!!!!! */}
                            </td>
                        </tr>)}
                    </tbody>
                </table>
            </div>

            {/* Opens Pop UI Forms */}
            <div className="flex flex-row gap-3 justify-center mt-10">
                <button onClick={() => setActiveForm("student")} className="btn btn-soft"> Student Sign Up </button>
                <button onClick={() => setActiveForm("borrow")} className="btn btn-soft"> Borrow </button>
                <button onClick={() => setActiveForm("return")} className="btn btn-soft"> Return </button>
            </div>

            {/* Checks if activeForms has a string */}
            {activeForm && (
                <div className="fixed bg-black/50 min-h-screen z-10 w-screen flex justify-center items-center top-0 left-0">
                    <div className="bg-info-content p-20 w-150">
                        <div className="flex flex-col gap-4">
                            {formsComponents[activeForm]}
                        </div>
                    </div>
                </div>
            )}
        </>

    );
};
