import { useState } from "react";
import { NavLink } from "react-router-dom";



export const Login = () => {
    const [form, setForm] = useState({username: "", password: ""});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        try {
            
        } catch (error: any) {
            
        } finally {

        };
        
    };

    return (
        <>
            <nav className="text-center items-center justify-between flex flex-row w-full bg-gray-800 text-white">
                <div className="flex flex-row m-7">
                    <NavLink to="/" className="text-xs flex flex-row items-center font-bold">
                        Back
                    </NavLink>
                </div>
            </nav>
            
            <div className="justify-center flex-1 text-center bg-gray-500 text-4xl mt-10 ml-145 w-50 h-15">
                <h1> Staff Login </h1>
            </div>
            <div className="flex items-center justify-center mt-15">
                <form onSubmit={handleSubmit} className="space-y-10 border-2 bg-white">

                    {/* Username */}
                    <div>
                        <input type="username"
                        placeholder="Username"
                        value={form.username}
                        onChange={(e) => setForm({...form, username: e.target.value})}
                        className="relative flex item-center placeholder-gray-400 mt-3"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <input type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={(e) => setForm({...form, password: e.target.value})}
                        className="relative flex item-center placeholder-gray-400"
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

