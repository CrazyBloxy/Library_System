import { useState } from "react";
/* Icons */
import { FaIdBadge } from "react-icons/fa";
import { PiFinnTheHumanThin } from "react-icons/pi";
/* API */
import api from "../../../services/api";
import type { Book } from "../../types/index";

interface closeModal {
    bookIdToEdit: string;
    onClose: () => void;
    onBookUpdated: (updatedBook: Book) => void;
}

export const EditBook = ({ bookIdToEdit, onClose, onBookUpdated }: closeModal) => {
    const [form, setForm] = useState({
        new_book_id: "", title: "", author: "", copyright_date: "", status: "", condition: ""
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
            const { new_book_id, title, author, copyright_date, status, condition } = form;

            const payload: any = {};
            if (new_book_id.trim() !== "") payload.new_book_id = new_book_id;
            if (title.trim() !== "") payload.title = title;
            if (author.trim() !== "") payload.author = author;
            if (copyright_date.trim() !== "") payload.copyright_date = copyright_date;
            if (status !== "") payload.status = status;
            if (condition !== "") payload.condition = condition;

            // Stop tracking network operations if nothing was modified
            if (Object.keys(payload).length === 0) {
                setError("Please fill out at least one field to update.");
                setLoading(false);
                return;
            }

            // Target the immutable original barcode ID in the URL path string
            const response = await api.put(`/api/admin/book/${bookIdToEdit}`, payload);

            if (response.status === 200 || response.status === 201) {
                console.log("Book details saved successfully.");
                const successMsg = response.data?.message || "Book catalog updated successfully!";
                setSuccess(successMsg);

                if (response.data?.data) {
                    const updatedRow = Array.isArray(response.data.data) ? response.data.data[0] : response.data.data;
                    onBookUpdated(updatedRow);
                }

                setForm({ new_book_id: "", title: "", author: "", copyright_date: "", status: "", condition: "" });
            }

        } catch (err: any) {
            console.error("Attempt failed:", err);
            const errMsg = err.response?.data?.message || "Connection to Express server failed.";
            setError(errMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
            
            {/* System Status Notifications Viewport Banner Box */}
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
                <h1 className="text-blue-300 text-4xl font-medium tracking-wide">Edit Book Profile</h1>
                
                <p className="text-[11px] text-base-400">
                    Modifying system key record for book ID: <span className="font-mono text-warning font-bold">{bookIdToEdit}</span>
                </p>

                {/* Optional Forms Input Element Options */}
                <label className="input validator w-full max-w-md">
                    <FaIdBadge />
                    <input
                        type="text"
                        placeholder="New Book ID Number"
                        value={form.new_book_id}
                        onChange={(e) => setForm({ ...form, new_book_id: e.target.value })}
                    />
                </label>

                <label className="input validator w-full max-w-md">
                    <PiFinnTheHumanThin />
                    <input
                        type="text"
                        placeholder="Book Title"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                </label>

                <label className="input validator w-full max-w-md">
                    <PiFinnTheHumanThin />
                    <input
                        type="text"
                        placeholder="Author Name"
                        value={form.author}
                        onChange={(e) => setForm({ ...form, author: e.target.value })}
                    />
                </label>

                <label className="input validator w-full max-w-md">
                    <FaIdBadge />
                    <input
                        type="text"
                        placeholder="Copyright Date Year (e.g., 2024)"
                        value={form.copyright_date}
                        onChange={(e) => setForm({ ...form, copyright_date: e.target.value })}
                    />
                </label>

                {/* Status Options Dropdown Element */}
                <select 
                    className="select select-bordered select-sm w-full max-w-md bg-base-100 focus:outline-none text-xs"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                    <option value="">Keep Current Availability Status</option>
                    <option value="Available">Available</option>
                    <option value="Not Available">Not Available</option>
                </select>

                {/* Condition Options Dropdown Element */}
                <select 
                    className="select select-bordered select-sm w-full max-w-md bg-base-100 focus:outline-none text-xs"
                    value={form.condition}
                    onChange={(e) => setForm({ ...form, condition: e.target.value })}
                >
                    <option value="">Keep Current Wear Condition</option>
                    <option value="Good">Good</option>
                    <option value="Damaged">Damaged</option>
                    <option value="Lost">Lost</option>
                </select>

                <div className="flex flex-row justify-center items-center space-x-3 pt-2 w-full max-w-md">
                    <button type="button" onClick={onClose} className="btn btn-soft btn-error flex-1" disabled={loading}>Cancel</button>
                    <button type="submit" className="btn btn-soft btn-accent flex-1" disabled={loading}>
                        {loading ? <span className="loading loading-spinner loading-xs"></span> : "Save Updates"}
                    </button>
                </div>
            </div>
        </form>
    );
};
