import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
// import AddTodo from "./pages/AddTodo";
// import Edittodo from "./pages/Edittodo";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";
import Landing from "./pages/Landing";
// import Profile from "./pages/Profile";
// import EditProfile from "./pages/EditProfile";
import { Toaster } from "react-hot-toast";
import Password from "./pages/Password";
// import ChangePassword from "./pages/ChangePassword";
import GithubCallback from "./pages/GithubCallback";
// import FacebookCallback from "./pages/FacebookCallback";
// import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import MainLayout from "./pages/MainLayout";
import Search from "./pages/Search";
import ChangePassword from "./pages/ChangePassword";
import ChatHistory from "./pages/chatHistory";
import ForgotPassword from "./pages/ForgotPassword";
import Chats from "./pages/Chats";
import ChatPage from "./pages/ChatPage";


function App() {
  return (
    <>

      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          success: {
            style: {
              background: "#4ade80",
              color: "white",
            },
          },
          error: {
            style: {
              background: "#f87171",
              color: "white",
            },
          },
          duration: 3000,
        }}
      />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/github-callback" element={<GithubCallback />} />
          {/* <Route path="/facebook-callback" element={<FacebookCallback />} /> */}
          {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}
          <Route path="/forgot-password" element={<ForgotPassword />} />

        </Route>

        {/* Private routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/home" element={<Home />} />
          <Route element={<MainLayout />}>
            {/* <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} /> */}

            <Route path="/search" element={<Search />} />
            <Route path="/profile/:user_id" element={<Profile />} />
            {/* <Route path="/add" element={<AddTodo />} />
          <Route path="/edit/:id" element={<Edittodo />} />
          <Route path="/password" element={<Password />} />
          <Route path="/change-password" element={< ChangePassword />} /> */}
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/chats" element={<ChatHistory />} />
            <Route path="/password" element={<Password />} />
            <Route path="/chats" element={<Chats />} />
            <Route path="/chat/:chatId" element={<ChatPage />} />
          </Route>


        </Route>
      </Routes>
    </>
  );
}

export default App;
