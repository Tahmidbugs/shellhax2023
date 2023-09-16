import ReactDOM from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomeComponent from './JobSeeker/Home.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeComponent />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
    <RouterProvider router={router} />
);
