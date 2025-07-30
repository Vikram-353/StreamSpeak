// import { Link, useLocation } from "react-router-dom";
// import useAuthHook from "../hooks/useAuthHook";
// import { BellIcon, LogOutIcon, ShipWheelIcon } from "lucide-react";
// import { useQueryClient, useMutation } from "@tanstack/react-query";
// import { logout } from "../lib/api";
// import ThemeSelector from "./ThemeSelector";
// // import useLogout from "../hooks/useLogout";

// const Navbar = () => {
//   const { authUser } = useAuthHook();
//   const location = useLocation();
//   const isChatPage = location.pathname?.startsWith("/chat");

//   const queryClient = useQueryClient();
//   const { mutate: logoutMutation } = useMutation({
//     mutationFn: logout,
//     onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
//   });

//   //   const { logoutMutation } = useLogout();

//   return (
//     <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
//       <div className="container mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex items-center justify-end w-full">
//           {/* LOGO - ONLY IN THE CHAT PAGE */}
//           {isChatPage && (
//             <div className="pl-5">
//               <Link to="/" className="flex items-center gap-2.5">
//                 <ShipWheelIcon className="size-9 text-primary" />
//                 <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary  tracking-wider">
//                   Streamify
//                 </span>
//               </Link>
//             </div>
//           )}

//           <div className="flex items-center gap-3 sm:gap-4 ml-auto">
//             <Link to={"/notifications"}>
//               <button className="btn btn-ghost btn-circle">
//                 <BellIcon className="h-6 w-6 text-base-content opacity-70" />
//               </button>
//             </Link>
//           </div>

//           {/* TODO */}
//           <ThemeSelector />

//           <div className="avatar">
//             <div className="w-9 rounded-full">
//               <img
//                 src={authUser?.profilePic || me}
//                 alt="User Avatar"
//                 rel="noreferrer"
//               />
//             </div>
//           </div>

//           {/* Logout button */}
//           <button className="btn btn-ghost btn-circle" onClick={logoutMutation}>
//             <LogOutIcon className="h-6 w-6 text-base-content opacity-70" />
//           </button>
//         </div>
//       </div>
//     </nav>
//   );
// };
// export default Navbar;

// import { Link, useLocation } from "react-router-dom";
// import useAuthHook from "../hooks/useAuthHook";
// import { BellIcon, LogOutIcon, ShipWheelIcon, MenuIcon } from "lucide-react";
// import { useQueryClient, useMutation } from "@tanstack/react-query";
// import { logout } from "../lib/api";
// import ThemeSelector from "./ThemeSelector";

// const Navbar = ({ showSidebar = false }) => {
//   const { authUser } = useAuthHook();
//   const location = useLocation();
//   const isChatPage = location.pathname?.startsWith("/chat");

//   const queryClient = useQueryClient();
//   const { mutate: logoutMutation } = useMutation({
//     mutationFn: logout,
//     onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
//   });

//   return (
//     <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
//       <div className="container mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex items-center justify-between w-full">
//           {/* Left side - Hamburger menu for small screens and Logo */}
//           <div className="flex items-center gap-3">
//             {/* Hamburger menu - only visible on small screens and when sidebar should be shown */}
//             {showSidebar && (
//               <label
//                 htmlFor="sidebar-toggle"
//                 className="btn btn-ghost btn-circle lg:hidden"
//               >
//                 <MenuIcon className="h-6 w-6 text-base-content opacity-70" />
//               </label>
//             )}

//             {/* LOGO - ONLY IN THE CHAT PAGE */}
//             {isChatPage && (
//               <Link to="/" className="flex items-center gap-2.5">
//                 <ShipWheelIcon className="size-9 text-primary" />
//                 <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
//                   Streamify
//                 </span>
//               </Link>
//             )}
//           </div>

//           {/* Right side - Actions */}
//           <div className="flex items-center gap-3 sm:gap-4">
//             <Link to={"/notifications"}>
//               <button className="btn btn-ghost btn-circle">
//                 <BellIcon className="h-6 w-6 text-base-content opacity-70" />
//               </button>
//             </Link>

//             <ThemeSelector />

//             <Link to="/profile">
//               <div className="avatar">
//                 <div className="w-9 rounded-full">
//                   <img
//                     src={authUser?.profilePic || me}
//                     alt="User Avatar"
//                     rel="noreferrer"
//                   />
//                 </div>
//               </div>
//             </Link>

//             {/* Logout button */}
//             <button
//               className="btn btn-ghost btn-circle"
//               onClick={logoutMutation}
//             >
//               <LogOutIcon className="h-6 w-6 text-base-content opacity-70" />
//             </button>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;

import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import useAuthHook from "../hooks/useAuthHook";
import {
  BellIcon,
  LogOutIcon,
  ShipWheelIcon,
  MenuIcon,
  UserIcon,
} from "lucide-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { logout } from "../lib/api";
import ThemeSelector from "./ThemeSelector";

const Navbar = ({ showSidebar = false }) => {
  const { authUser } = useAuthHook();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");

  const queryClient = useQueryClient();
  const { mutate: logoutMutation } = useMutation({
    mutationFn: logout,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between w-full">
          {/* Left side */}
          <div className="flex items-center gap-3">
            {showSidebar && (
              <label
                htmlFor="sidebar-toggle"
                className="btn btn-ghost btn-circle lg:hidden"
              >
                <MenuIcon className="h-6 w-6 text-base-content opacity-70" />
              </label>
            )}
            {isChatPage && (
              <Link to="/" className="flex items-center gap-2.5">
                <ShipWheelIcon className="size-9 text-primary" />
                <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                  Streamify
                </span>
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 sm:gap-4 relative">
            <Link to={"/notifications"}>
              <button className="btn btn-ghost btn-circle">
                <BellIcon className="h-6 w-6 text-base-content opacity-70" />
              </button>
            </Link>

            <ThemeSelector />

            {/* Profile Dropdown - Click to toggle */}
            <div className="relative" ref={dropdownRef}>
              <div
                className="avatar cursor-pointer"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
              >
                <div className="w-9 rounded-full">
                  <img
                    src={authUser?.profilePic}
                    alt="User Avatar"
                    rel="noreferrer"
                  />
                </div>
              </div>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-base-100 rounded shadow-lg border border-base-300 flex flex-col z-50">
                  <Link
                    to="/profile"
                    className="px-4 py-2 text-sm hover:bg-base-200 flex items-center gap-2"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <UserIcon className="w-4 h-4" />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      logoutMutation();
                    }}
                    className="px-4 py-2 text-sm hover:bg-base-200 flex items-center gap-2 text-left"
                  >
                    <LogOutIcon className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
