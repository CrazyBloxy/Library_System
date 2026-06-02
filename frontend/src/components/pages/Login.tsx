import { useState } from "react";
import { NavLink } from "react-router-dom";
/* Icons */
import { PiFinnTheHumanThin, PiLockKeyFill } from "react-icons/pi";



export const Login = () => {
    const [form, setForm] = useState({ username: "", password: "" });
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
        <form onSubmit={handleSubmit}>
            <div className="border-3 border-gray-700 bg-gray-800 shadow-sm justify-center relative mt-30 ml-125 w-100 h-80">
                <h1 className="text-blue-300 text-6xl mt-3 ml-8">Login</h1>
                <div className="flex justify-center items-center flex-col space-y-8 mt-6">
                    <label className="input validator">
                        <PiFinnTheHumanThin />
                        <input
                            type="text"
                            required
                            placeholder="Username"
                            pattern="[A-Za-z][A-Za-z0-9\-]*"
                            minLength={3}
                            maxLength={30}
                            value={form.username}
                            onChange={(e) => setForm({...form, username: e.target.value})}
                        />
                    </label>

                    <label className="input validator">
                        <PiLockKeyFill />
                        <input
                            type="password"
                            required
                            placeholder="Password"
                            minLength={8}
                            pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                            value={form.password}
                            onChange={(e) => setForm({...form, password: e.target.value})}
                        />
                    </label>
                    <button className="btn btn-soft btn-accent">
                        Login
                    </button>
                </div>
            </div>
        </form>

    );
};

