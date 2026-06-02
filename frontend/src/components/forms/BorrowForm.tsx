import { useState } from "react";
import { NavLink } from "react-router-dom";
/* Icons */
import { PiFinnTheHumanThin } from "react-icons/pi";
import { FaIdBadge } from "react-icons/fa";

interface closeModal {
    onClose: () => void;
}


export const BorrowForm = ({ onClose }: closeModal) => {
    const [form, setForm] = useState({ name: "", studentID: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        try {

        } catch (error: any) {

        } finally {
            setLoading(false);
        };

    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div className="flex justify-center items-center flex-col space-y-8 mt-6">
                    <h1 className="text-blue-300 text-5xl">Borrow Form</h1>
                    <label className="input validator">
                        <PiFinnTheHumanThin />
                        <input
                            type="text"
                            required
                            placeholder="Name"
                            maxLength={30}
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                    </label>

                    <label className="input validator">
                        <FaIdBadge />
                        <input
                            type="text"
                            required
                            placeholder="Student ID"
                            maxLength={30}
                            value={form.studentID}
                            onChange={(e) => setForm({ ...form, studentID: e.target.value })}
                        />
                    </label>
        
                    <div className="flex flex-row justify-center items-center space-x-3">
                        <button type="button" onClick={onClose} className="btn btn-soft btn-error">Cancel</button>
                        <button type="submit" className="btn btn-soft btn-accent">Sign Up</button>
                    </div>
                </div>
            </form>
        </>
    );

};