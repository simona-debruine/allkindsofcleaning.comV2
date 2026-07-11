import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import EstimatePage from "../pages/estimate/page";

const Home = lazy(() => import("../pages/home/page"));
const ServicesPage = lazy(() => import("../pages/services/page"));
const SchedulePage = lazy(() => import("../pages/schedule/page"));
const BookingConfirmationPage = lazy(() => import("../pages/booking-confirmation/page"));

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/services",
    element: <ServicesPage />,
  },
  {
    path: "/schedule",
    element: <SchedulePage />,
  },
  {
    path: "/estimate",
    element: <EstimatePage />,
  },
  {
    path: "/booking-confirmation",
    element: <BookingConfirmationPage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
