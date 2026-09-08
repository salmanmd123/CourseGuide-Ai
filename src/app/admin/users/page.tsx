"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Check,
    ChevronDown,
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

    async function changeRole(
        user: User
    ) {
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
                `${user.name} is now ${newRole === "ADMIN" ? "an admin" : "a learner"}.`
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

    async function deleteUser(
        user: User
    ) {
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

    function formatDate(
        date: string
    ) {
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

    function getInitials(
        name: string
    ) {
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
        <main className="min-h-screen bg-zinc-50 text-zinc-950 transition-colors dark:bg-zinc-950 dark:text-zinc-50">
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

            <div className="mx-auto max-w-7xl px-6 py-10">
                {/* HEADER */}

                <div className="mb-8">
                    <Link
                        href="/admin"
                        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Admin Dashboard
                    </Link>

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
                                ADMINISTRATION
                            </p>

                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                Manage Users
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                                Manage learner accounts,
                                administrator access,
                                and user permissions.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                            <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />

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
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                        <X className="mt-0.5 h-4 w-4 shrink-0" />

                        <span className="flex-1">
                            {error}
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                setError(null)
                            }
                            className="rounded-md p-1 transition hover:bg-red-100 dark:hover:bg-red-900/40"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {success && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
                        <Check className="mt-0.5 h-4 w-4 shrink-0" />

                        <span className="flex-1">
                            {success}
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                setSuccess(null)
                            }
                            className="rounded-md p-1 transition hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* =================================================
                    STATS
                ================================================= */}

                <div className="mb-8 grid gap-4 sm:grid-cols-3">
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

                <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        {/* SEARCH */}

                        <div className="relative w-full lg:max-w-md">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                            <input
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target
                                            .value
                                    )
                                }
                                placeholder="Search by name or email..."
                                className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-11 pr-4 text-sm outline-none transition placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-zinc-700 dark:bg-zinc-950"
                            />
                        </div>

                        {/* FILTERS */}

                        <div className="flex flex-wrap gap-2">
                            <FilterButton
                                active={
                                    filter ===
                                    "ALL"
                                }
                                onClick={() =>
                                    setFilter(
                                        "ALL"
                                    )
                                }
                            >
                                All
                            </FilterButton>

                            <FilterButton
                                active={
                                    filter ===
                                    "USER"
                                }
                                onClick={() =>
                                    setFilter(
                                        "USER"
                                    )
                                }
                            >
                                Learners
                            </FilterButton>

                            <FilterButton
                                active={
                                    filter ===
                                    "ADMIN"
                                }
                                onClick={() =>
                                    setFilter(
                                        "ADMIN"
                                    )
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
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Showing{" "}
                        <span className="font-semibold text-zinc-900 dark:text-white">
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
                    <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
                            <Loader2 className="h-5 w-5 animate-spin" />

                            Loading users...
                        </div>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-16 text-center dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                            <Users className="h-6 w-6 text-zinc-400" />
                        </div>

                        <h2 className="text-lg font-semibold">
                            No users found
                        </h2>

                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                            Try changing your search
                            or filter.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        {/* DESKTOP TABLE */}

                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
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
                                                key={
                                                    user.id
                                                }
                                                className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/70 dark:border-zinc-800/70 dark:hover:bg-zinc-800/30"
                                            >
                                                {/* USER */}

                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                                                            {getInitials(
                                                                user.name
                                                            )}
                                                        </div>

                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <p className="truncate font-semibold text-zinc-900 dark:text-white">
                                                                    {
                                                                        user.name
                                                                    }
                                                                </p>

                                                                {user.id ===
                                                                    currentUser?.id && (
                                                                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                                                                        YOU
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <p className="mt-0.5 truncate text-sm text-zinc-500 dark:text-zinc-400">
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

                                                <td className="px-6 py-5 text-sm text-zinc-500 dark:text-zinc-400">
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
                                                            className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300"
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
                                                            className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 bg-white px-3 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/60 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-red-950/30"
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

                        <div className="divide-y divide-zinc-100 md:hidden dark:divide-zinc-800">
                            {filteredUsers.map(
                                (user) => (
                                    <div
                                        key={
                                            user.id
                                        }
                                        className="p-5"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                                                {getInitials(
                                                    user.name
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="truncate font-semibold">
                                                        {
                                                            user.name
                                                        }
                                                    </p>

                                                    {user.id ===
                                                        currentUser?.id && (
                                                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                                                            YOU
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="mt-0.5 break-all text-sm text-zinc-500 dark:text-zinc-400">
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

                                                    <span className="text-xs text-zinc-400">
                                                        Joined{" "}
                                                        {formatDate(
                                                            user.createdAt
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 grid grid-cols-2 gap-2">
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
                                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
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
                                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/60 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-red-950/30"
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
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {label}
                    </p>

                    <p className="mt-2 text-3xl font-bold tracking-tight">
                        {value}
                    </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
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
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                active
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
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
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            <Users className="h-3.5 w-3.5" />
            Learner
        </span>
    );
}