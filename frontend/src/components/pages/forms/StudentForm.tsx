import { useState } from "react";
/* Icons */
import { PiFinnTheHumanThin } from "react-icons/pi";
import { FaIdBadge } from "react-icons/fa";
/* API */
import api from "../../../services/api"

interface closeModal {
    onClose: () => void;
}


export const StudentForm = ({ onClose }: closeModal) => {
    const [form, setForm] = useState({ name: "", student_id: "", section: "" });
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
            const { name, student_id, section } = form;
            const response = await api.post('/api/studentform', { student_id, name, section });

            if (response.data.success) {
                console.log("Student has been added to the database.")
                const successMsg = response.data?.message || "Student data saved successfully!";
                setSuccess(successMsg)
            }
            

        } catch (err: any) {
            console.error("Login attempt failed:", err);
            const errMsg = err.response?.data?.message || "Connection to Express server failed.";
            setError(errMsg);
        } finally {
            setLoading(false);
        };

    };

    if (error) {
        return (
            <div className="alert alert-error max-w-6xl mx-auto mt-12">
                <span>{error}</span>
            </div>
        );
    }

    if (success) {
        return (
            <div className="alert alert-success max-w-6xl mx-auto mt-12">
                <span>{success}</span>
            </div>
        );
    }

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div className="flex justify-center items-center flex-col space-y-8 mt-6">
                    <h1 className="text-blue-300 text-5xl">Student Form</h1>
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
                            value={form.student_id}
                            onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                        />
                    </label>

                    <label className="input validator">
                        <FaIdBadge />
                        <input
                            type="text"
                            required
                            placeholder="Section"
                            maxLength={30}
                            value={form.section}
                            onChange={(e) => setForm({ ...form, section: e.target.value })}
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