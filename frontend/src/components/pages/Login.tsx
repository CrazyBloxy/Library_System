import { useState } from "react";
import { NavLink } from "react-router-dom";



export const Login = () => {
    const [form, setForm] = useState({username: "", password: ""});

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        
    }

    return (
        <>
            <nav className="text-center items-center justify-between flex flex-row w-full bg-gray-800 text-white">
                <div className="flex flex-row m-6">
                    <NavLink to="/" className="text-xs flex flex-row items-center font-bold">
                        Back
                    </NavLink>
                </div>
            </nav>
            
            <div className="min-h-screen flex items-center justify-center">
                <form onSubmit={handleSubmit} className="space-y-10 border-2 bg-white">

                    {/* Username */}
                    <div>
                        <input type="username"
                        placeholder="Username"
                        value={form.username}
                        onChange={(e) => setForm({...form, username: e.target.value})}
                        className="relative flex item-center text-white placeholder-gray-400"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <input type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={(e) => setForm({...form, password: e.target.value})}
                        className="relative flex item-center text-white placeholder-gray-400"
                        />
                    </div>

                    {/* Submit */}
                    <div>
                        <button type="submit" className="text-white bg-blue-500 w-full">
                            Submit
                        </button>
                    </div>
                </form>
            </div>
            
        </>
        
        
    );
};

