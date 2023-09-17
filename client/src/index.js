import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomeComponent from "./JobSeeker/Home.tsx";
import Auth from "./JobSeeker/auth.tsx";
import Recauth from "./JobSeeker/recauth.tsx";
import RecLogin from "./JobSeeker/login.tsx";
import "bootstrap/dist/css/bootstrap.css";
import HomeSeeker from "./JobSeeker/Homeseeker.tsx";
import Result from "./JobSeeker/result.tsx";
import Landing from "./JobSeeker/Landing.js";
import Feed from "./JobSeeker/Feed.js";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/seekerhome",
    element: <Feed />,
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
  {
    path: "/result",
    element: <Result />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
