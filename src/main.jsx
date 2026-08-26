import React from "react";
import { createRoot } from "react-dom/client";
import FliiSite from "./FliiSite.jsx";
import InternshipInternational from "./InternshipInternational.jsx";

const path = window.location.pathname.replace(/\/+$/, "");
const isInternship = path === "/p/internship/international";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {isInternship ? <InternshipInternational /> : <FliiSite />}
  </React.StrictMode>
);
