import React from "react";
import { createRoot } from "react-dom/client";
import FliiSite from "./FliiSite.jsx";
import InternshipInternational from "./InternshipInternational.jsx";

// Internship form is bereikbaar via het nette pad (vereist SPA-rewrite in vercel.json)
// EN via de hash-variant (werkt altijd, zonder server-config):
//   pad : /p/internship/international
//   hash: /#/p/internship/international
const clean = (s) => (s || "").replace(/^#/, "").replace(/\/+$/, "");
const TARGET = "/p/internship/international";
const isInternship =
  clean(window.location.pathname) === TARGET ||
  clean(window.location.hash) === TARGET;

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {isInternship ? <InternshipInternational /> : <FliiSite />}
  </React.StrictMode>
);
