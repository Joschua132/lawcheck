import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { UploadPage } from "@/features/upload/UploadPage";
import { ErgebnisPage } from "@/features/ergebnis/ErgebnisPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: UploadPage },
      { path: "ergebnis/:id", Component: ErgebnisPage },
      { path: "dashboard", Component: DashboardPage },
    ],
  },
]);
