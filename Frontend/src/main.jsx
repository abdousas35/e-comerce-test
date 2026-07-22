import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { HelmetProvider } from "react-helmet-async";
import axios from "axios";
import "./index.css";
import "./i18n";
import App from "./App.jsx";
import { store } from "./app/store";
import { CONFIG } from "../src/config/config.js";

axios.defaults.baseURL = import.meta.env.VITE_API_URL || "";
axios.defaults.withCredentials = true;

document.documentElement.style.setProperty(
  "--primary-main",
  CONFIG.primaryColor
);

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </Provider>
);
