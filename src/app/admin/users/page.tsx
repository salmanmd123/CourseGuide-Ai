"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Check,
    Loader2,
    Search,
    Shield,
    ShieldCheck,
    Trash2,
    Users,
    X,
} from "lucide-react";

import AdminNavbar from "@/components/admin-navbar";

type UserRole = "USER" | "ADMIN";

type User = {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    createdAt: string;
};

type CurrentUser = {
    id: number;
    name: string;
    email: string;
    role: UserRole;
};

type Filter = "ALL" | "USER" | "ADMIN";

/* =========================================================
   PAGE
========================================================= */

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] =
        useState<CurrentUser | null>(null);

    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] =
        useState<Filter>("ALL");

    const [updatingId, setUpdatingId] =
        useState<number | null>(null);

    const [deletingId, setDeletingId] =
        useState<number | null>(null);

    const [error, setError] =
        useState<string | null>(null);

    const [success, setSuccess] =
        useState<string | null>(null);

    /* =====================================================
       LOAD DATA
    ===================================================== */

    async function loadUsers() {
        try {
            setLoading(true);
            setError(null);

            const [usersResponse, meResponse] =
                await Promise.all([
                    fetch("/api/admin/users", {
                        cache: "no-store",
                    }),
                    fetch("/api/auth/me", {
                        cache: "no-store",
                    }),
                ]);

            const usersData =
                await usersResponse.json();

            const meData =
                await meResponse.json();

            if (!usersResponse.ok) {
                throw new Error(
                    usersData.error ||
                        "Failed to load users"
                );
            }

            setUsers(usersData.users || []);
            setCurrentUser(meData.user || null);
        } catch (err) {
            console.error(err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load users"
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadUsers();
    }, []);

    /* =====================================================
       FILTER USERS
    ===================================================== */

    const filteredUsers = useMemo(() => {
        const query = search
            .trim()
            .toLowerCase();

        return users.filter((user) => {
            const matchesSearch =
                !query ||
                user.name
                    .toLowerCase()
                    .includes(query) ||
                user.email
                    .toLowerCase()
                    .includes(query);

            const matchesFilter =
                filter === "ALL" ||
                user.role === filter;

            return (
                matchesSearch &&
                matchesFilter
            );
        });
    }, [users, search, filter]);

    /* =====================================================
       STATS
    ===================================================== */

    const totalUsers = users.length;

    const totalAdmins = users.filter(
        (user) => user.role === "ADMIN"
    ).length;

    const totalLearners = users.filter(
        (user) => user.role === "USER"
    ).length;

    /* =====================================================
       CHANGE ROLE
    ===================================================== */

    async function changeRole(user: User) {
        const newRole =
            user.role === "ADMIN"
                ? "USER"
                : "ADMIN";

        if (
            user.id === currentUser?.id &&
            newRole === "USER"
        ) {
            setError(
                "You cannot remove your own admin access."
            );

            return;
        }

        const confirmed = window.confirm(
            `Change ${user.name}'s role to ${newRole}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setUpdatingId(user.id);
            setError(null);
            setSuccess(null);

            const response = await fetch(
                "/api/admin/users",
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        id: user.id,
                        role: newRole,
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                        "Failed to update role"
                );
            }

            setUsers((current) =>
                current.map((item) =>
                    item.id === user.id
                        ? {
                              ...item,
                              role: newRole,
                          }
                        : item
                )
            );

            setSuccess(
                `${user.name} is now ${
                    newRole === "ADMIN"
                        ? "an admin"
                        : "a learner"
                }.`
            );
        } catch (err) {
            console.error(err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to update role"
            );
        } finally {
            setUpdatingId(null);
        }
    }

    /* =====================================================
       DELETE USER
    ===================================================== */

    async function deleteUser(user: User) {
        if (user.id === currentUser?.id) {
            setError(
                "You cannot delete your own account."
            );

            return;
        }

        const confirmed = window.confirm(
            `Delete ${user.name}?\n\nThis action cannot be undone.`
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(user.id);
            setError(null);
            setSuccess(null);

            const response = await fetch(
                "/api/admin/users",
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        id: user.id,
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                        "Failed to delete user"
                );
            }

            setUsers((current) =>
                current.filter(
                    (item) =>
                        item.id !== user.id
                )
            );

            setSuccess(
                `${user.name} has been deleted.`
            );
        } catch (err) {
            console.error(err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to delete user"
            );
        } finally {
            setDeletingId(null);
        }
    }

    /* =====================================================
       DATE FORMAT
    ===================================================== */

    function formatDate(date: string) {
        try {
            return new Date(
                date
            ).toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                }
            );
        } catch {
            return "—";
        }
    }

    /* =====================================================
       INITIALS
    ===================================================== */

    function getInitials(name: string) {
        return name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) =>
                part.charAt(0).toUpperCase()
            )
            .join("");
    }

    return (
        <main className="min-h-screen bg-[#e0e5ec] text-black transition-colors dark:bg-[#1a1d23] dark:text-[#f5f7fa]">
            {/* =================================================
                NAVBAR
            ================================================= */}

            <AdminNavbar
                name={
                    currentUser?.name ||
                    "Administrator"
                }
                email={
                    currentUser?.email || ""
                }
            />

            {/* =================================================
                MAIN
            ================================================= */}

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
                {/* HEADER */}

                <div className="mb-8">
                    <Link
                        href="/admin"
                        className="mb-5 inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-[#3f3e3e] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-200 hover:text-orangered hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:text-[#a8adb7] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)] dark:hover:text-[orangered] dark:hover:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.55),inset_-3px_-3px_6px_rgba(43,48,58,0.55)]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Admin Dashboard
                    </Link>

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[orangered]">
                                ADMINISTRATION
                            </p>

                            <h1 className="text-3xl font-bold tracking-tight text-black dark:text-[#f5f7fa] sm:text-4xl">
                                Manage Users
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#3f3e3e] dark:text-[#a8adb7]">
                                Manage learner accounts,
                                administrator access,
                                and user permissions.
                            </p>
                        </div>

                        <div className="inline-flex items-center gap-2 self-start rounded-full bg-[#e0e5ec] px-5 py-3 text-sm font-medium text-[#3f3e3e] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:text-[#a8adb7] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)] lg:self-auto">
                            <Users className="h-4 w-4 text-[orangered]" />

                            <span>
                                {totalUsers} total users
                            </span>
                        </div>
                    </div>
                </div>

                {/* =================================================
                    ALERTS
                ================================================= */}

                {error && (
                    <div className="mb-6 flex items-start gap-3 rounded-[20px] bg-[#e0e5ec] px-4 py-3 text-sm text-red-600 shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:text-red-400 dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]">
                        <X className="mt-0.5 h-4 w-4 shrink-0" />

                        <span className="flex-1">
                            {error}
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                setError(null)
                            }
                            className="rounded-full p-1 text-red-600 transition-all duration-200 hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:text-red-400 dark:hover:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.55),inset_-3px_-3px_6px_rgba(43,48,58,0.55)]"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {success && (
                    <div className="mb-6 flex items-start gap-3 rounded-[20px] bg-[#e0e5ec] px-4 py-3 text-sm text-emerald-700 shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:text-emerald-400 dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]">
                        <Check className="mt-0.5 h-4 w-4 shrink-0" />

                        <span className="flex-1">
                            {success}
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                setSuccess(null)
                            }
                            className="rounded-full p-1 text-emerald-700 transition-all duration-200 hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:text-emerald-400 dark:hover:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.55),inset_-3px_-3px_6px_rgba(43,48,58,0.55)]"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* =================================================
                    STATS
                ================================================= */}

                <div className="mb-8 grid gap-5 sm:grid-cols-3">
                    <StatCard
                        label="Total Users"
                        value={totalUsers}
                        icon={
                            <Users className="h-5 w-5" />
                        }
                    />

                    <StatCard
                        label="Learners"
                        value={totalLearners}
                        icon={
                            <Users className="h-5 w-5" />
                        }
                    />

                    <StatCard
                        label="Administrators"
                        value={totalAdmins}
                        icon={
                            <ShieldCheck className="h-5 w-5" />
                        }
                    />
                </div>

                {/* =================================================
                    CONTROLS
                ================================================= */}

                <div className="mb-6 rounded-[30px] bg-[#e0e5ec] p-4 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[9px_9px_16px_rgba(5,7,10,0.75),-9px_-9px_16px_rgba(43,48,58,0.75)] sm:p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        {/* SEARCH */}

                        <div className="relative w-full lg:max-w-md">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3f3e3e] dark:text-[#a8adb7]" />

                            <input
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                placeholder="Search by name or email..."
                                className="h-11 w-full rounded-[20px] border-0 bg-[#e0e5ec] pl-11 pr-4 text-sm text-black outline-none transition-all duration-200 placeholder:text-[#3f3e3e] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] focus:shadow-[inset_6px_6px_10px_rgba(163,177,198,0.7),inset_-6px_-6px_10px_rgba(255,255,255,0.9)] dark:bg-[#1e2229] dark:text-[#f5f7fa] dark:placeholder:text-[#a8adb7] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)] dark:focus:shadow-[inset_6px_6px_10px_rgba(5,7,10,0.75),inset_-6px_-6px_10px_rgba(43,48,58,0.75)]"
                            />
                        </div>

                        {/* FILTERS */}

                        <div className="flex flex-wrap gap-2">
                            <FilterButton
                                active={
                                    filter === "ALL"
                                }
                                onClick={() =>
                                    setFilter("ALL")
                                }
                            >
                                All
                            </FilterButton>

                            <FilterButton
                                active={
                                    filter === "USER"
                                }
                                onClick={() =>
                                    setFilter("USER")
                                }
                            >
                                Learners
                            </FilterButton>

                            <FilterButton
                                active={
                                    filter === "ADMIN"
                                }
                                onClick={() =>
                                    setFilter("ADMIN")
                                }
                            >
                                Admins
                            </FilterButton>
                        </div>
                    </div>
                </div>

                {/* =================================================
                    RESULTS INFO
                ================================================= */}

                <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-[#3f3e3e] dark:text-[#a8adb7]">
                        Showing{" "}
                        <span className="font-semibold text-black dark:text-[#f5f7fa]">
                            {filteredUsers.length}
                        </span>{" "}
                        {filteredUsers.length === 1
                            ? "user"
                            : "users"}
                    </p>
                </div>

                {/* =================================================
                    USERS
                ================================================= */}

                {loading ? (
                    <div className="flex min-h-[300px] items-center justify-center rounded-[30px] bg-[#e0e5ec] shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[9px_9px_16px_rgba(5,7,10,0.75),-9px_-9px_16px_rgba(43,48,58,0.75)]">
                        <div className="flex items-center gap-3 text-sm text-[#3f3e3e] dark:text-[#a8adb7]">
                            <Loader2 className="h-5 w-5 animate-spin text-[orangered]" />

                            Loading users...
                        </div>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="rounded-[30px] bg-[#e0e5ec] px-6 py-16 text-center shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[9px_9px_16px_rgba(5,7,10,0.75),-9px_-9px_16px_rgba(43,48,58,0.75)]">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#e0e5ec] text-[#3f3e3e] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:text-[#a8adb7] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]">
                            <Users className="h-6 w-6" />
                        </div>

                        <h2 className="text-lg font-semibold text-black dark:text-[#f5f7fa]">
                            No users found
                        </h2>

                        <p className="mt-1 text-sm text-[#3f3e3e] dark:text-[#a8adb7]">
                            Try changing your search
                            or filter.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-[30px] bg-[#e0e5ec] shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[9px_9px_16px_rgba(5,7,10,0.75),-9px_-9px_16px_rgba(43,48,58,0.75)]">
                        {/* DESKTOP TABLE */}

                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-[#e0e5ec] text-xs font-semibold uppercase tracking-wider text-[#3f3e3e] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:text-[#a8adb7] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]">
                                        <th className="px-6 py-4">
                                            User
                                        </th>

                                        <th className="px-6 py-4">
                                            Role
                                        </th>

                                        <th className="px-6 py-4">
                                            Joined
                                        </th>

                                        <th className="px-6 py-4 text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredUsers.map(
                                        (user) => (
                                            <tr
                                                key={user.id}
                                                className="border-b border-[#d2d8e1] last:border-0 transition-all duration-200 hover:bg-[#dce1e8] dark:border-[#30353e] dark:hover:bg-[#20252c]"
                                            >
                                                {/* USER */}

                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e0e5ec] text-sm font-bold text-[orangered] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)]">
                                                            {getInitials(
                                                                user.name
                                                            )}
                                                        </div>

                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <p className="truncate font-semibold text-black dark:text-[#f5f7fa]">
                                                                    {
                                                                        user.name
                                                                    }
                                                                </p>

                                                                {user.id ===
                                                                    currentUser?.id && (
                                                                    <span className="rounded-full bg-[#e0e5ec] px-2 py-0.5 text-[10px] font-semibold text-[#3f3e3e] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:text-[#a8adb7] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]">
                                                                        YOU
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <p className="mt-0.5 truncate text-sm text-[#3f3e3e] dark:text-[#a8adb7]">
                                                                {
                                                                    user.email
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* ROLE */}

                                                <td className="px-6 py-5">
                                                    <RoleBadge
                                                        role={
                                                            user.role
                                                        }
                                                    />
                                                </td>

                                                {/* DATE */}

                                                <td className="px-6 py-5 text-sm text-[#3f3e3e] dark:text-[#a8adb7]">
                                                    {formatDate(
                                                        user.createdAt
                                                    )}
                                                </td>

                                                {/* ACTIONS */}

                                                <td className="px-6 py-5">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                updatingId ===
                                                                    user.id ||
                                                                user.id ===
                                                                    currentUser?.id
                                                            }
                                                            onClick={() =>
                                                                changeRole(
                                                                    user
                                                                )
                                                            }
                                                            className="inline-flex h-9 items-center gap-2 rounded-full bg-[#e0e5ec] px-3 text-xs font-semibold text-[#3f3e3e] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-200 hover:text-[orangered] hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#1e2229] dark:text-[#a8adb7] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)] dark:hover:text-[orangered] dark:hover:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.55),inset_-3px_-3px_6px_rgba(43,48,58,0.55)]"
                                                        >
                                                            {updatingId ===
                                                            user.id ? (
                                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                            ) : user.role ===
                                                              "ADMIN" ? (
                                                                <Users className="h-3.5 w-3.5" />
                                                            ) : (
                                                                <Shield className="h-3.5 w-3.5" />
                                                            )}

                                                            {user.role ===
                                                            "ADMIN"
                                                                ? "Make Learner"
                                                                : "Make Admin"}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            disabled={
                                                                deletingId ===
                                                                    user.id ||
                                                                user.id ===
                                                                    currentUser?.id
                                                            }
                                                            onClick={() =>
                                                                deleteUser(
                                                                    user
                                                                )
                                                            }
                                                            className="inline-flex h-9 items-center gap-2 rounded-full bg-[#e0e5ec] px-3 text-xs font-semibold text-red-600 shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-200 hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#1e2229] dark:text-red-400 dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)] dark:hover:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.55),inset_-3px_-3px_6px_rgba(43,48,58,0.55)]"
                                                        >
                                                            {deletingId ===
                                                            user.id ? (
                                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            )}

                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* MOBILE CARDS */}

                        <div className="divide-y divide-[#d2d8e1] dark:divide-[#30353e] md:hidden">
                            {filteredUsers.map(
                                (user) => (
                                    <div
                                        key={user.id}
                                        className="p-5"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e0e5ec] text-sm font-bold text-[orangered] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)]">
                                                {getInitials(
                                                    user.name
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="truncate font-semibold text-black dark:text-[#f5f7fa]">
                                                        {
                                                            user.name
                                                        }
                                                    </p>

                                                    {user.id ===
                                                        currentUser?.id && (
                                                        <span className="rounded-full bg-[#e0e5ec] px-2 py-0.5 text-[10px] font-semibold text-[#3f3e3e] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:text-[#a8adb7] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]">
                                                            YOU
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="mt-0.5 break-all text-sm text-[#3f3e3e] dark:text-[#a8adb7]">
                                                    {
                                                        user.email
                                                    }
                                                </p>

                                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                                    <RoleBadge
                                                        role={
                                                            user.role
                                                        }
                                                    />

                                                    <span className="text-xs text-[#3f3e3e] dark:text-[#a8adb7]">
                                                        Joined{" "}
                                                        {formatDate(
                                                            user.createdAt
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                disabled={
                                                    updatingId ===
                                                        user.id ||
                                                    user.id ===
                                                        currentUser?.id
                                                }
                                                onClick={() =>
                                                    changeRole(
                                                        user
                                                    )
                                                }
                                                className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#e0e5ec] text-xs font-semibold text-[#3f3e3e] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-200 hover:text-[orangered] hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#1e2229] dark:text-[#a8adb7] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)] dark:hover:text-[orangered] dark:hover:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.55),inset_-3px_-3px_6px_rgba(43,48,58,0.55)]"
                                            >
                                                {updatingId ===
                                                user.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Shield className="h-4 w-4" />
                                                )}

                                                {user.role ===
                                                "ADMIN"
                                                    ? "Make Learner"
                                                    : "Make Admin"}
                                            </button>

                                            <button
                                                type="button"
                                                disabled={
                                                    deletingId ===
                                                        user.id ||
                                                    user.id ===
                                                        currentUser?.id
                                                }
                                                onClick={() =>
                                                    deleteUser(
                                                        user
                                                    )
                                                }
                                                className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#e0e5ec] text-xs font-semibold text-red-600 shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-200 hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#1e2229] dark:text-red-400 dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)] dark:hover:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.55),inset_-3px_-3px_6px_rgba(43,48,58,0.55)]"
                                            >
                                                {deletingId ===
                                                user.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}

                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: number;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-[30px] bg-[#e0e5ec] p-5 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] transition-all duration-300 dark:bg-[#1e2229] dark:shadow-[9px_9px_16px_rgba(5,7,10,0.75),-9px_-9px_16px_rgba(43,48,58,0.75)]">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-[#3f3e3e] dark:text-[#a8adb7]">
                        {label}
                    </p>

                    <p className="mt-2 text-3xl font-bold tracking-tight text-black dark:text-[#f5f7fa]">
                        {value}
                    </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e0e5ec] text-[orangered] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)]">
                    {icon}
                </div>
            </div>
        </div>
    );
}

/* =========================================================
   FILTER BUTTON
========================================================= */

function FilterButton({
    children,
    active,
    onClick,
}: {
    children: React.ReactNode;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                active
                    ? "bg-[orangered] text-white shadow-[inset_3px_3px_6px_rgba(180,45,0,0.35),inset_-3px_-3px_6px_rgba(255,165,120,0.45)] hover:bg-[red]"
                    : "bg-[#e0e5ec] text-[#3f3e3e] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] hover:text-[orangered] hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:text-[#a8adb7] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)] dark:hover:text-[orangered] dark:hover:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.55),inset_-3px_-3px_6px_rgba(43,48,58,0.55)]"
            }`}
        >
            {children}
        </button>
    );
}

/* =========================================================
   ROLE BADGE
========================================================= */

function RoleBadge({
    role,
}: {
    role: UserRole;
}) {
    if (role === "ADMIN") {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e0e5ec] px-3 py-1.5 text-xs font-semibold text-[orangered] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e0e5ec] px-3 py-1.5 text-xs font-semibold text-[#3f3e3e] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:text-[#a8adb7] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]">
            <Users className="h-3.5 w-3.5" />
            Learner
        </span>
    );
}