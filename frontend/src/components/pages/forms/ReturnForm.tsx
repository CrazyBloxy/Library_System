import { useState } from "react";
/* Icons */
import { FaIdBadge } from "react-icons/fa";
/* API */
import api from "../../../services/api"

interface closeModal {
    onClose: () => void;
}


export const ReturnForm = ({ onClose }: closeModal) => {
    const [form, setForm] = useState({ student_id: "", book_id: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        setError(""); // Resets Error Logs
        setSuccess("")
        try {
            const { student_id, book_id } = form;
            const response = await api.post('/api/returnform', { student_id, book_id });

            if (response.status === 201) {
                console.log("Appeal has been added to the database.")
                const successMsg = response.data?.message || "Request has sent successfully!";
                setSuccess(successMsg)

                setForm({ student_id: "", book_id: "" });
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
        <>
            <form onSubmit={handleSubmit}>
                {success && (
                    <div className="alert alert-success w-full max-w-md text-sm py-3 justify-center text-center animate-fade-in">
                        <span>{success}</span>
                    </div>
                )}

                {error && (
                    <div className="alert alert-error w-full max-w-md text-sm py-3 justify-center text-center">
                        <span>{error}</span>
                    </div>
                )}

                <div className="flex justify-center items-center flex-col space-y-8 mt-6">
                    <h1 className="text-blue-300 text-5xl">Returnt Form</h1>

                    <label className="input validator">
                        <FaIdBadge />
                        <input
                            type="text"
                            required
                            placeholder="Student ID"
                            maxLength={30}
                            value={form.student_id}
                            onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                        />
                    </label>

                    <label className="input validator">
                        <FaIdBadge />
                        <input
                            type="text"
                            required
                            placeholder="Book ID"
                            maxLength={30}
                            value={form.book_id}
                            onChange={(e) => setForm({ ...form, book_id: e.target.value })}
                        />
                    </label>

                    <div className="flex flex-row justify-center items-center space-x-3">
                        <button type="button" onClick={onClose} className="btn btn-soft btn-error">Cancel</button>
                        <button
                            type="submit"
                            className="btn btn-soft btn-accent"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="loading loading-spinner loading-xs"></span>
                                    Returning...
                                </>
                            ) : (
                                "Return"
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </>
    );

};