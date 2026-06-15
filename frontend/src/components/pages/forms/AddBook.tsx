import { useState } from "react";
/* Icons */
import { FaIdBadge } from "react-icons/fa";
import { PiFinnTheHumanThin } from "react-icons/pi";
/* API */
import api from "../../../services/api";

interface closeModal {
    onClose: () => void;
    onBookAdded: (newBook: any) => void;
}

export const AddBook = ({ onClose, onBookAdded }: closeModal) => {
    const [form, setForm] = useState({
        book_id: "",
        title: "",
        author: "",
        copyright_date: "",
        status: "",
        condition: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const { book_id, title, author, copyright_date, status, condition } = form;

            const response = await api.post('/api/admin/addbook', {
                book_id, title, author, copyright_date, status, condition
            });

            if (response.status == 200 || response.status === 201) {
                console.log("Book added successfully.");
                const successMsg = response.data?.message || "Book created successfully!";
                setSuccess(successMsg);

                if (response.data?.data) {
                    onBookAdded(response.data.data);
                }

                setForm({ book_id: "", title: "", author: "", copyright_date: "", status: "", condition: "" });
            }

        } catch (err: any) {
            console.error("Add book operational attempt failed:", err);
            const errMsg = err.response?.data?.message || "Connection to Express server failed.";
            setError(errMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
            
            {/* Visual Alert Area Boundary Wrapper Matrix System */}
            <div className="w-full max-w-md min-h-12 flex items-center justify-center mb-2">
                {success && (
                    <div className="alert alert-success w-full text-sm py-2 justify-center text-center animate-fade-in shadow-md">
                        <span>{success}</span>
                    </div>
                )}

                {error && (
                    <div className="alert alert-error w-full text-sm py-2 justify-center text-center animate-fade-in shadow-md">
                        <span>{error}</span>
                    </div>
                )}
            </div>

            <div className="flex justify-center items-center flex-col space-y-4 w-full">
                <h1 className="text-blue-300 text-4xl font-medium tracking-wide text-center">Add New Book</h1>

                {/* Input Fields Container Matrix */}
                <label className="input validator w-full max-w-md">
                    <FaIdBadge />
                    <input
                        type="text"
                        required
                        placeholder="Enter Book barcode/ID"
                        value={form.book_id}
                        onChange={(e) => setForm({ ...form, book_id: e.target.value })}
                        disabled={loading}
                    />
                </label>

                <label className="input validator w-full max-w-md">
                    <PiFinnTheHumanThin />
                    <input
                        type="text"
                        required
                        placeholder="Book Title Name"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        disabled={loading}
                    />
                </label>

                <label className="input validator w-full max-w-md">
                    <PiFinnTheHumanThin />
                    <input
                        type="text"
                        required
                        placeholder="Author Name"
                        value={form.author}
                        onChange={(e) => setForm({ ...form, author: e.target.value })}
                        disabled={loading}
                    />
                </label>

                <label className="input validator w-full max-w-md">
                    <FaIdBadge />
                    <input
                        type="text"
                        required
                        placeholder="Copyright Date Year (e.g., 2024)"
                        value={form.copyright_date}
                        onChange={(e) => setForm({ ...form, copyright_date: e.target.value })}
                        disabled={loading}
                    />
                </label>

                {/* Availability Criteria Status Input Dropdown */}
                <select 
                    required
                    className="select select-bordered select-sm w-full max-w-md bg-base-100 text-xs focus:outline-none"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    disabled={loading}
                >
                    <option value="" disabled hidden>Select Availability Status</option>
                    <option value="Available">Available</option>
                    <option value="Not Available">Not Available</option>
                </select>

                {/* Material Condition Status Input Dropdown */}
                <select 
                    required
                    className="select select-bordered select-sm w-full max-w-md bg-base-100 text-xs focus:outline-none"
                    value={form.condition}
                    onChange={(e) => setForm({ ...form, condition: e.target.value })}
                    disabled={loading}
                >
                    <option value="" disabled hidden>Select Wear Condition</option>
                    <option value="Good">Good</option>
                    <option value="Damaged">Damaged</option>
                    <option value="Lost">Lost</option>
                </select>

                <div className="flex flex-row justify-center items-center space-x-3 pt-2 w-full max-w-md">
                    <button type="button" onClick={onClose} className="btn btn-soft btn-error flex-1" disabled={loading}>Cancel</button>
                    <button type="submit" className="btn btn-soft btn-accent flex-1" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="loading loading-spinner loading-xs"></span>
                                Creating...
                            </>
                        ) : (
                            "Add Asset"
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
};
