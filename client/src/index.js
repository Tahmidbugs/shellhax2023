import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomeComponent from "./JobSeeker/Home.tsx";
import Auth from "./JobSeeker/auth.tsx";
import Recauth from "./JobSeeker/recauth.tsx";
import RecLogin from "./JobSeeker/login.tsx";
import "bootstrap/dist/css/bootstrap.css";


const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeComponent />,
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/recauth",
    element: <Recauth />,
  },
  {
    path: "/login",
    element: <RecLogin />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
