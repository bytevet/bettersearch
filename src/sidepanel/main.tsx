import { createRoot } from "react-dom/client";
import { TooltipProvider } from "@/components/ui/tooltip";
import { App } from "./App";
import "../index.css";

const root = document.getElementById("root")!;
createRoot(root).render(
  <TooltipProvider>
    <App />
  </TooltipProvider>,
);
