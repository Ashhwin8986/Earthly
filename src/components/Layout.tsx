import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import ChatBot from "./ChatBot";

const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <Outlet />
      </main>
      <ChatBot />
    </div>
  );
};

export default Layout;