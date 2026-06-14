import { useState } from "react";
/* Icons */
import { FaIdBadge } from "react-icons/fa";
import { PiFinnTheHumanThin } from "react-icons/pi";
/* API */
import api from "../../../services/api"

interface closeModal {
    studentIdToEdit: string;
    onClose: () => void;
    onStudentUpdated: (updatedStudent: any) => void;
}

export const EditStudent = ({ studentIdToEdit, onClose, onStudentUpdated }: closeModal) => {
    const [form, setForm] = useState({
        new_student_id: "", name: "", section: "", active: ""
    });
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
            const { new_student_id, name, section, active } = form;

            const payload: any = {};

            // Only attach properties if the admin actually typed text inside them
            if (new_student_id.trim() !== "") payload.new_student_id = new_student_id;
            if (name.trim() !== "") payload.name = name;
            if (section.trim() !== "") payload.section = section;
            if (active !== "") payload.active = active;

            // Stop network tracking if nothing was modified
            if (Object.keys(payload).length === 0) {
                setError("Please fill out at least one field to update.");
                setLoading(false);
                return;
            }

            const response = await api.put(`/api/admin/student/${studentIdToEdit}`, payload);

            if (response.status === 200 || response.status === 201) {
                console.log("Appeal has been added to the database.")
                const successMsg = response.data?.message || "Request has sent successfully!";
                setSuccess(successMsg)

                if (response.data?.data) {
                    // If your backend returns an array (e.g., result.rows), grab the first item [0]
                    const updatedRow = Array.isArray(response.data.data) ? response.data.data[0] : response.data.data;
                    onStudentUpdated(updatedRow);
                }

                setForm({ new_student_id: "", name: "", section: "", active: "true" });
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
            <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
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

                <div className="flex justify-center items-center flex-col space-y-6 w-full mt-10">
                    <h1 className="text-blue-300 text-5xl font-medium tracking-wide">Edit Student</h1>

                    <p className="text-[11px] text-base-400">
                        Modifying system key record for student ID: <span className="font-mono text-warning font-bold">{studentIdToEdit}</span>
                    </p>

                    {/* Modified Updates Values Form Section */}
                    <label className="input validator w-full max-w-md">
                        <FaIdBadge />
                        <input
                            type="text"
                            placeholder="New Student ID Number"
                            value={form.new_student_id}
                            onChange={(e) => setForm({ ...form, new_student_id: e.target.value })}
                        />
                    </label>

                    <label className="input validator w-full max-w-md">
                        <PiFinnTheHumanThin />
                        <input
                            type="text"
                            placeholder="Full Name"
                            maxLength={30}
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                    </label>

                    <label className="input validator w-full max-w-md">
                        <FaIdBadge />
                        <input
                            type="text"
                            placeholder="Section Class Group"
                            value={form.section}
                            onChange={(e) => setForm({ ...form, section: e.target.value })}
                        />
                    </label>

                    {/* Account Activation Boolean Options Dropdown Element */}
                    <select
                        className="select select-bordered select-sm w-full max-w-md bg-base-100 focus:outline-none text-xs"
                        value={form.active}
                        onChange={(e) => setForm({ ...form, active: e.target.value })}
                    >
                        <option value="">Keep Current Account Status</option>
                        <option value="true">Account Status: Active</option>
                        <option value="false">Account Status: Deactivated</option>
                    </select>

                    <div className="flex flex-row justify-center items-center space-x-3 pt-2">
                        <button type="button" onClick={onClose} className="btn btn-soft btn-error" disabled={loading}>Cancel</button>
                        <button type="submit" className="btn btn-soft btn-accent" disabled={loading}>
                            {loading ? <span className="loading loading-spinner loading-xs"></span> : "Save Updates"}
                        </button>
                    </div>
                </div>
            </form>
        </>
    );
};