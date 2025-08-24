import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = ({ children = null, showSidebar = false }) => {
  return (
    <div className="min-h-screen flex bg-base-100">
      {/* Sidebar */}
      {showSidebar && <Sidebar />}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
