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
        <div className="border-4 shadow-sm justify-center relative mt-30 ml-125 w-100 h-70">
            <div className="flex justify-center items-center flex-col space-y-6 mt-15">
                <label className="input validator">
                    <PiFinnTheHumanThin />
                    <input
                        type="text"
                        placeholder="Username"
                        pattern="[A-Za-z][A-Za-z0-9\-]*"
                        minLength={3}
                        maxLength={30}
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
                        title="Must be more than 8 characters, including number, lowercase letter, uppercase letter"
                    />
                </label>
            </div>

        </div>


    );
};

