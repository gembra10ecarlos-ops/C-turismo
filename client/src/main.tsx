import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

function Analytics() {
  useEffect(() => {
    const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
    const websiteId = import.meta.env.VITE_ANALYTICS_WEBSITE_ID;

    if (endpoint && websiteId) {
      const script = document.createElement("script");
      script.async = true;
      script.defer = true;
      script.src = `${endpoint}/umami`;
      script.setAttribute("data-website-id", websiteId);
      document.body.appendChild(script);
    }
  }, []);

  return null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Analytics />
    <App />
  </StrictMode>
);
