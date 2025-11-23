// import { StrictMode } from "react";
// import { createRoot } from "react-dom/client";
// import "./index.css";

// import App from "./App";
// import ManageCategories from "./pages/ManageCategories";

// // בדיקת הנתיב הנוכחי
// const path = window.location.pathname;

// let Page = App;
// if (path === "/categories") {
//   Page = ManageCategories;
// }

// createRoot(document.getElementById("root")).render(
//   <StrictMode>
//     <Page />
//   </StrictMode>
// );
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import App from "./App";
import ManageCategories from "./pages/ManageCategories";
import ImportPage from "./pages/ImportPage";

// בדיקת הנתיב הנוכחי
const path = window.location.pathname;

let Page = App;

if (path === "/categories") {
  Page = ManageCategories;
}

if (path === "/import") {
  Page = ImportPage;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Page />
  </StrictMode>
);

