import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Clock3,
  Mail,
  User,
} from "lucide-react";
import Navbar from "@/components/navbar";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  // Protect profile page
  if (!user) {
    redirect("/login");
  }

  const initial = user.name.charAt(0).toUpperCase();

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <Navbar />

      <div className="mx-auto max-w-5xl px-6 py-10">

        {/* Back */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        {/* Header */}
        <div className="mt-8">
          <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
            ACCOUNT
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Your Profile
          </h1>

          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            Manage your account and view your learning information.
          </p>
        </div>

        {/* Profile card */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">

          {/* Profile top */}
          <div className="border-b border-zinc-200 p-6 dark:border-zinc-800 sm:p-8">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

              {/* Avatar */}
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-3xl font-bold text-white">
                {initial}
              </div>

              {/* User */}
              <div>
                <h2 className="text-2xl font-bold text-zinc-950 dark:text-white">
                  {user.name}
                </h2>

                <p className="mt-1 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                  <Mail size={15} />
                  {user.email}
                </p>
              </div>

            </div>

          </div>

          {/* Account information */}
          <div className="p-6 sm:p-8">

            <h2 className="text-lg font-bold">
              Account information
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">

              {/* Name */}
              <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                    <User size={17} />
                  </div>

                  <div>
                    <p className="text-xs text-zinc-400">
                      Full name
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {user.name}
                    </p>
                  </div>

                </div>

              </div>

              {/* Email */}
              <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                    <Mail size={17} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-zinc-400">
                      Email address
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold">
                      {user.email}
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </div>
        </div>

        {/* Learning overview */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">

          {/* Courses */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <BookOpen size={19} />
            </div>

            <p className="mt-5 text-sm text-zinc-500 dark:text-zinc-400">
              Courses enrolled
            </p>

            <p className="mt-1 text-3xl font-bold">
              4
            </p>

          </div>

          {/* Learning time */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Clock3 size={19} />
            </div>

            <p className="mt-5 text-sm text-zinc-500 dark:text-zinc-400">
              Learning time
            </p>

            <p className="mt-1 text-3xl font-bold">
              18.5h
            </p>

          </div>

        </div>

        {/* My learning */}
        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>
              <h2 className="font-bold">
                Continue your learning
              </h2>

              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Continue where you left off.
              </p>
            </div>

            <Link
              href="/my-learning"
              className="flex w-fit items-center justify-center rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              My Learning
            </Link>

          </div>

        </div>

      </div>
    </main>
  );
}