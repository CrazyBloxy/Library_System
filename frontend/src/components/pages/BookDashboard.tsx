import { useState, useEffect } from "react";
/* Icons */
import { TbDatabaseSearch } from "react-icons/tb";
/* Forms */
import { EditBook } from "./forms/EditBook";
import { AddBook } from "./forms/AddBook";
/* Services (Backend API) & Types */
import api from "../../services/api";
import type { Book } from "../types/index";


export const BookDashboard = () => {
    const [modalState, setModalState] = useState<{ type: string; id: string } | null>(null);
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);

    useEffect(() => {
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
        const query = searchQuery.toLowerCase().trim();
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

    const handleUpdateBookState = (originalTargetBarcode: string, updatedBook: Book) => {
        setBooks((prevBooks) =>
            prevBooks.map((book) =>
                book.book_id === originalTargetBarcode ? updatedBook : book
            )
        );
    };

    const handleAddBookState = (newBook: Book) => {
        setBooks((prevBooks) => [...prevBooks, newBook]);
    };

    const formsComponents: Record<string, React.ReactNode> = {
        edit: (
            <EditBook
                bookIdToEdit={modalState?.id || ""}
                onClose={() => setModalState(null)}
                onBookUpdated={(updatedData) => handleUpdateBookState(modalState?.id || "", updatedData)}
            />
        ),
        add: (
            <AddBook
                onClose={() => setModalState(null)}
                onBookAdded={handleAddBookState}
            />
        )
    };

    const handleDeleteBook = async (bookId: string, bookTitle: string) => {
        // Prevents accidental deletion
        const confirmDelete = window.confirm(`Are you absolutely sure you want to permanently delete "${bookTitle}" (${bookId})?`);
        if (!confirmDelete) return;

        setDeleteLoadingId(bookId);
        try {
            // Targets your exact Express book removal route
            const response = await api.delete(`/api/admin/removebook/${bookId}`);

            if (response.status === 200 || response.status === 201) {
                // 2. VISUAL SWEEP: Instantly drops the book from the screen list array
                setBooks((prevBooks) => prevBooks.filter((book) => book.book_id !== bookId));
                alert(response.data.message);
            }
        } catch (err: any) {
            console.error("Delete tracking execution failed:", err);
            const errMsg = err.response?.data?.message || "Could not complete book removal.";
            alert(errMsg);
        } finally {
            setDeleteLoadingId(null);
        }
    };

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
                            <th></th>
                            <th></th>
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
                                    <th><button
                                        onClick={() => setModalState({ type: "edit", id: book.book_id })}
                                        className='btn btn-circle btn-warning w-20'
                                    >
                                        EDIT
                                    </button></th>
                                    <th> <button
                                        onClick={() => handleDeleteBook(book.book_id, book.title)}
                                        className='btn btn-circle btn-error w-20'
                                        disabled={deleteLoadingId !== null}
                                    >
                                        {deleteLoadingId === book.book_id ? (
                                            <span className="loading loading-spinner loading-xs"></span>
                                        ) : (
                                            "DELETE"
                                        )}
                                    </button></th>
                                </tr>
                            ))
                        ) : (<tr>
                            <td colSpan={5} className="text-center text-2xl py-12 text-base-400 font-semibold">
                                No books match your search query "{searchQuery}"
                            </td>
                        </tr>)}
                    </tbody>
                </table>
            </div>

            {/* Opens Pop UI Forms */}
            <div className="flex flex-row gap-3 justify-center mt-10">
                <button onClick={() => setModalState({ type: "add", id: "" })} className="btn btn-soft"> Add Book </button>
            </div>

            {/* Checks if activeForms has a string */}
            {modalState && (
                <div className="fixed bg-black/50 min-h-screen z-10 w-screen flex justify-center items-center top-0 left-0">
                    <div className="bg-info-content p-8 w-150 h-150">
                        <div className="flex flex-col gap-4">
                            {formsComponents[modalState.type]}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};