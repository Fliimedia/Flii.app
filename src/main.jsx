import React from "react";
import { createRoot } from "react-dom/client";
import FliiSite from "./FliiSite.jsx";
import InternshipInternational from "./InternshipInternational.jsx";

const strip = (s) => s.replace(/\/+$/, "");
const TARGET = "/p/internship/international";
const path = strip(window.location.pathname);
const hash = strip(window.location.hash.replace(/^#/, ""));
const isInternship = path === TARGET || hash === TARGET;

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {isInternship ? <InternshipInternational /> : <FliiSite />}
  </React.StrictMode>
);
