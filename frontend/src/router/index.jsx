// src/router/index.jsx
import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import MasterLayout from "@/layout/MasterLayout";
import RoleRoute from "./RoleRoute";

// Public pages
import Homepage from "../pages/PublicPages/homepage";
import Login from "../pages/PublicPages/login";
import Signup from "../pages/PublicPages/signup";
import Contact from "../pages/PublicPages/contact";

// Shared dashboard shell
import MainDashboard from "@/pages/Dashboards/MainDashboard";
import NotFound from "../pages/PublicPages/notFound";

// Admin
import BookingManager from "@/pages/Admin/Bookings/BookingManager";
import ServiceManager from "@/pages/Admin/Services/ServicesManager";
import ApplicationManager from "@/pages/Admin/Applications/ApplicationsManager";

// General / shared
import UserInfo from "@/pages/SharedComponents/UserInfo";

// Client
import Booking from "@/pages/Client/Booking/Booking";
import AddressManager from "@/pages/Client/Address/AddressManager";
import BookingHistory from "@/pages/Client/BookingHistory/BookingHistory";
import SweepstarApply from "@/pages/Client/SweepstarRequest/SweepstarApply";

import { useUser } from "@/Hooks/useAuth";

import UsersManager from "@/pages/Admin/Users/UsersManager";
import MissionsHistory from "@/pages/Sweepstar/MissionsHistory/MissionsHistory";
import AvailableMissions from "@/pages/Sweepstar/AvailableMissions/AvailableMissions";
import CurrentMissions from "@/pages/Sweepstar/CurrentMissions/CurrentMissions";
import NotificationsPage from "@/pages/SharedComponents/NotificationsPage";
import PointTransactions from "@/pages/Sweepstar/PointTransactions/PointTransactions";
import TopUpPoints from "@/pages/Sweepstar/TopUpPoints/TopUpPoints";
import PaymentVerifications from "@/pages/Admin/PaymentVerifications/PaymentVerifications";
import Settings from "@/pages/Admin/Settings/Settings";
import { ContentLoader } from "@/components/ui/PageLoader";

// GuestOnly: redirect logged-in users away from login/signup
const GuestOnly = ({ children }) => {
    const { data: user, isLoading } = useUser();
    if (isLoading) return <ContentLoader />;
    return user ? <Navigate to="/dashboard" replace /> : children;
};

export const AppRouter = createBrowserRouter([
    {
        path: "/",
        element: <MasterLayout />,
        children: [
            // PUBLIC
            { path: "/", element: <Homepage /> },
            { path: "contact", element: <Contact /> },

            // GUEST ONLY
            {
                path: "login",
                element: (
                    <GuestOnly>
                        <Login />
                    </GuestOnly>
                ),
            },
            {
                path: "signup",
                element: (
                    <GuestOnly>
                        <Signup />
                    </GuestOnly>
                ),
            },

            // SHARED DASHBOARD ENTRY (any logged-in user)
            {
                element: <RoleRoute />, // just requires auth
                children: [
                    { path: "dashboard", element: <MainDashboard /> },
                    {
                        path: "dashboard/my_informations",
                        element: <UserInfo />,
                    },
                    {
                        path: "dashboard/notifications",
                        element: <NotificationsPage />,
                    },
                ],
            },

            // ADMIN ONLY ROUTES
            {
                element: <RoleRoute requiredRole="admin" />,
                children: [
                    { path: "dashboard/users_list", element: <UsersManager /> },

                    {
                        path: "dashboard/bookings_list",
                        element: <BookingManager />,
                    },
                    { path: "dashboard/services", element: <ServiceManager /> },
                    {
                        path: "dashboard/sweepstar_requests",
                        element: <ApplicationManager />,
                    },
                    {
                        path: "dashboard/payment-verifications",
                        element: <PaymentVerifications />,
                    },
                    {
                        path: "dashboard/settings",
                        element: <Settings />,
                    },
                ],
            },

            // CLIENT ONLY ROUTES
            {
                element: <RoleRoute requiredRole="client" />,
                children: [
                    { path: "dashboard/booking_service", element: <Booking /> },

                    {
                        path: "dashboard/bookings_history",
                        element: <BookingHistory />,
                    },
                    {
                        path: "dashboard/my_addresses",
                        element: <AddressManager />,
                    },
                    {
                        path: "dashboard/become_sweepstar",
                        element: <SweepstarApply />,
                    },
                ],
            },

            // SWEEPSTAR ONLY ROUTES
            {
                element: <RoleRoute requiredRole="sweepstar" />,
                children: [
                    {
                        path: "dashboard/available_missions",
                        element: <AvailableMissions />,
                    },
                    {
                        path: "dashboard/current_missions",
                        element: <CurrentMissions />,
                    },
                    {
                        path: "dashboard/missions_history",
                        element: <MissionsHistory />,
                    },
                    {
                        path: "dashboard/top-up-points",
                        element: <TopUpPoints />,
                    },
                    {
                        path: "dashboard/point-transactions",
                        element: <PointTransactions />,
                    },
                ],
            },

            // 404
            { path: "*", element: <NotFound /> },
        ],
    },
]);
