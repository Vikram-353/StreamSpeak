// import Sidebar from "./Sidebar";
// import Navbar from "./Navbar";

// const Layout = ({ children, showSidebar = false }) => {
//   return (
//     <div className="min-h-screen">
//       <div className="flex">
//         {showSidebar && <Sidebar />}

//         <div className="flex-1 flex flex-col">
//           <Navbar />

//           <main className="flex-1 overflow-y-auto">{children}</main>
//         </div>
//       </div>
//     </div>
//   );
// };
// export default Layout;

// import Sidebar from "./Sidebar";
// import Navbar from "./Navbar";

// const Layout = ({ children, showSidebar = false }) => {
//   return (
//     <div className="drawer lg:drawer-open min-h-screen">
//       {/* Toggle for small screens */}
//       <input id="sidebar-toggle" type="checkbox" className="drawer-toggle" />

//       <div className="drawer-content flex flex-col">
//         {/* Navbar contains hamburger */}
//         <Navbar />

//         <main className="flex-1 overflow-y-auto p-4">{children}</main>
//       </div>

//       {showSidebar && (
//         <div className="drawer-side">
//           <label htmlFor="sidebar-toggle" className="drawer-overlay"></label>
//           <Sidebar />
//         </div>
//       )}
//     </div>
//   );
// };

// export default Layout;

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = ({ children, showSidebar = false }) => {
  return (
    <div className="drawer lg:drawer-open min-h-screen">
      {/* Toggle for small screens */}
      <input id="sidebar-toggle" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col">
        {/* Navbar contains hamburger */}
        <Navbar showSidebar={showSidebar} />

        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>

      {showSidebar && (
        <div className="drawer-side">
          <label htmlFor="sidebar-toggle" className="drawer-overlay"></label>
          <Sidebar />
        </div>
      )}
    </div>
  );
};

export default Layout;
