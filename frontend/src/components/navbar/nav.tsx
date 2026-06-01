import { NavLink } from "react-router-dom";



export const Navbar = () => {
  return (
    <nav className="text-center items-center justify-between flex flex-row w-full bg-gray-800 text-white">
      <div className="flex flex-row m-3">
        <h1 className="text-5xl text-amber-400 font-bold ">Library System</h1>
        <NavLink to="/login" className="text-xs flex flex-row items-center ml-240 font-bold">
            Staff Login
        </NavLink>
      </div>
    </nav>
  );
};

