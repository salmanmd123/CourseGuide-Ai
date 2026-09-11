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
    <main className="min-h-screen bg-[#e0e5ec] text-black dark:bg-[#1a1d23] dark:text-[#f5f7fa]">
      <Navbar />

      <div className="mx-auto max-w-5xl px-6 py-10">

        {/* Back */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-[12px] bg-[#e0e5ec] px-3 py-2 text-sm text-[#3f3e3e] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-200 hover:text-[orangered] hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:text-[#a8adb7] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)] dark:hover:text-[orangered] dark:hover:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.6),inset_-3px_-3px_6px_rgba(43,48,58,0.6)]"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        {/* Header */}
        <div className="mt-8">
          <p className="text-sm font-medium text-[orangered]">
            ACCOUNT
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-black dark:text-[#f5f7fa] sm:text-4xl">
            Your Profile
          </h1>

          <p className="mt-2 text-[#3f3e3e] dark:text-[#a8adb7]">
            Manage your account and view your learning information.
          </p>
        </div>

        {/* Profile card */}
        <div className="mt-8 overflow-hidden rounded-[30px] bg-[#e0e5ec] shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[9px_9px_16px_rgba(5,7,10,0.75),-9px_-9px_16px_rgba(43,48,58,0.75)]">

          {/* Profile top */}
          <div className="border-b border-[#c8ced7] p-6 dark:border-[#30353e] sm:p-8">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

              {/* Avatar */}
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[20px] bg-[orangered] text-3xl font-bold text-white shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)]">
                {initial}
              </div>

              {/* User */}
              <div>
                <h2 className="text-2xl font-bold text-black dark:text-[#f5f7fa]">
                  {user.name}
                </h2>

                <p className="mt-1 flex items-center gap-2 text-sm text-[#3f3e3e] dark:text-[#a8adb7]">
                  <Mail size={15} />
                  {user.email}
                </p>
              </div>

            </div>

          </div>

          {/* Account information */}
          <div className="p-6 sm:p-8">

            <h2 className="text-lg font-bold text-black dark:text-[#f5f7fa]">
              Account information
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">

              {/* Name */}
              <div className="rounded-[20px] bg-[#e0e5ec] p-4 shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#e0e5ec] text-[orangered] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)]">
                    <User size={17} />
                  </div>

                  <div>
                    <p className="text-xs text-[#777] dark:text-[#7f8793]">
                      Full name
                    </p>

                    <p className="mt-1 text-sm font-semibold text-black dark:text-[#f5f7fa]">
                      {user.name}
                    </p>
                  </div>

                </div>

              </div>

              {/* Email */}
              <div className="rounded-[20px] bg-[#e0e5ec] p-4 shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#e0e5ec] text-[orangered] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)]">
                    <Mail size={17} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-[#777] dark:text-[#7f8793]">
                      Email address
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold text-black dark:text-[#f5f7fa]">
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
          <div className="rounded-[20px] bg-[#e0e5ec] p-6 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[9px_9px_16px_rgba(5,7,10,0.75),-9px_-9px_16px_rgba(43,48,58,0.75)]">

            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#e0e5ec] text-[orangered] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]">
              <BookOpen size={19} />
            </div>

            <p className="mt-5 text-sm text-[#3f3e3e] dark:text-[#a8adb7]">
              Courses enrolled
            </p>

            <p className="mt-1 text-3xl font-bold text-black dark:text-[#f5f7fa]">
              4
            </p>

          </div>

          {/* Learning time */}
          <div className="rounded-[20px] bg-[#e0e5ec] p-6 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[9px_9px_16px_rgba(5,7,10,0.75),-9px_-9px_16px_rgba(43,48,58,0.75)]">

            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#e0e5ec] text-[orangered] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]">
              <Clock3 size={19} />
            </div>

            <p className="mt-5 text-sm text-[#3f3e3e] dark:text-[#a8adb7]">
              Learning time
            </p>

            <p className="mt-1 text-3xl font-bold text-black dark:text-[#f5f7fa]">
              18.5h
            </p>

          </div>

        </div>

        {/* My learning */}
        <div className="mt-6 rounded-[20px] bg-[#e0e5ec] p-6 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[9px_9px_16px_rgba(5,7,10,0.75),-9px_-9px_16px_rgba(43,48,58,0.75)]">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>
              <h2 className="font-bold text-black dark:text-[#f5f7fa]">
                Continue your learning
              </h2>

              <p className="mt-1 text-sm text-[#3f3e3e] dark:text-[#a8adb7]">
                Continue where you left off.
              </p>
            </div>

            <Link
              href="/my-learning"
              className="flex w-fit items-center justify-center rounded-[12px] bg-[orangered] px-4 py-2.5 text-sm font-semibold text-white shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-200 hover:bg-[red] hover:shadow-[inset_3px_3px_6px_rgba(120,40,0,0.35),inset_-3px_-3px_6px_rgba(255,255,255,0.3)] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)] dark:hover:bg-[red] dark:hover:shadow-[inset_2px_2px_5px_rgba(120,20,0,0.35),inset_-2px_-2px_5px_rgba(255,120,80,0.16)]"
            >
              My Learning
            </Link>

          </div>

        </div>

      </div>
    </main>
  );
}