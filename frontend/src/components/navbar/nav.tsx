import { useNavigate, useLocation } from "react-router-dom";

/* Icons */
import { TiArrowLeftThick } from "react-icons/ti";
import { MdOutlineLogin } from "react-icons/md";


export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const navLocations = [
    "/login",
    "/dashboard"
  ]

  if (location.pathname === navLocations[0]) {
    return (
      <>
        <div className="navbar bg-base-100 shadow-sm">
          <div className="navbar-start">
            <button onClick={() => navigate("/")} className="btn btn-error">
              <TiArrowLeftThick /> Back
            </button>
          </div>
        </div>
      </>
    );
  };

  if (location.pathname === navLocations[1]) {
    return (
      <>
        <div className="navbar bg-base-100 shadow-sm">
          <div className="navbar-start">
            <h1 className="text-4xl ml-3 text-amber-500 font-bold ">Library System</h1>
          </div>
          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1 space-x-6">
              <li><button>Student Database</button></li>
              <li><button>Book Database</button></li>
              <li><button>Borrow & Return Logs</button></li>
            </ul>
          </div>
          <div className="navbar-end">
            <button onClick={() => {
              localStorage.removeItem("hasAccess");
              navigate("/login");
            }} className="btn btn-error">
              <TiArrowLeftThick /> Log Out
            </button>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <div className="navbar bg-base-100 shadow-sm">
        <div className="navbar-start">
          <h1 className="text-4xl ml-3 text-amber-500 font-bold ">Library System</h1>
        </div>

        <div className="navbar-end">
          <button onClick={() => navigate("/login")} className="btn btn-accent">
            Staff Login <MdOutlineLogin className="size-5" />
          </button>
        </div>
      </div>
    </>

  );
};

