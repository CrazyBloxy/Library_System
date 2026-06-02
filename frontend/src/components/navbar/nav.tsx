import { NavLink, useLocation } from "react-router-dom";

/* Icons */
import { TiArrowLeftThick } from "react-icons/ti";
import { MdOutlineLogin } from "react-icons/md";


export const Navbar = () => {
  const location = useLocation();
  const LoginNav = ["/login"]

  if (LoginNav.includes(location.pathname)) {
    return (
      <>
        <div className="navbar bg-base-100 shadow-sm">
          <div className="navbar-start">
            <NavLink to="/" className="btn btn-error">
              <TiArrowLeftThick /> Back
            </NavLink>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="navbar bg-base-100 shadow-sm">
        <div className="navbar-start">
          <h1 className="text-4xl ml-3 text-amber-500 font-bold ">Library System</h1>
        </div>

        <div className="navbar-end">
          <NavLink to="/login" className="btn btn-accent">
            Staff Login <MdOutlineLogin className="size-5"/>
          </NavLink>
        </div>
      </div>
    </>

  );
};

