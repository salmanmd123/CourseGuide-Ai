
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
import { db } from "@/db";
import { progress, lessons } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const initial = user.name?.trim().charAt(0).toUpperCase() || "U";

  const userProgress = await db
    .select({
      lessonId: progress.lessonId,
      watchedSeconds: progress.watchedSeconds,
      completed: progress.completed,
      courseId: lessons.courseId,
    })
    .from(progress)
    .innerJoin(lessons, eq(progress.lessonId, lessons.id))
    .where(eq(progress.userId, user.id));

  const totalWatchedSeconds = userProgress.reduce(
    (total, item) =>
      total + Math.max(0, item.watchedSeconds ?? 0),
    0
  );

  const learningHours = (totalWatchedSeconds / 3600).toFixed(1);

  const coursesStarted = new Set(
    userProgress
      .filter(
        (item) =>
          (item.watchedSeconds ?? 0) > 0 || item.completed
      )
      .map((item) => item.courseId)
  ).size;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#e0e5ec] text-black dark:bg-[#1a1d23] dark:text-[#f5f7fa]">
      <Navbar />

      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Back */}
        <Link
          href="/dashboard"
          className="inline-flex min-h-10 items-center gap-2 rounded-[12px] bg-[#e0e5ec] px-3 py-2 text-sm text-[#3f3e3e] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-200 hover:text-[orangered] dark:bg-[#1e2229] dark:text-[#a8adb7] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)] dark:hover:text-[orangered]"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        {/* Page heading */}
        <header className="mt-7 sm:mt-8">
          <p className="text-xs font-semibold tracking-[0.14em] text-[orangered] sm:text-sm">
            ACCOUNT
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-black dark:text-[#f5f7fa] sm:text-4xl">
            Your Profile
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-[#3f3e3e] dark:text-[#a8adb7] sm:text-base">
            View your account and learning information.
          </p>
        </header>

        {/* Profile card */}
        <section className="mt-6 overflow-hidden rounded-[24px] bg-[#e0e5ec] shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[9px_9px_16px_rgba(5,7,10,0.75),-9px_-9px_16px_rgba(43,48,58,0.75)] sm:mt-8 sm:rounded-[30px]">
          {/* Profile header */}
          <div className="border-b border-[#c8ced7] px-4 py-6 dark:border-[#30353e] sm:px-8 sm:py-8">
            <div className="flex min-w-0 flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:gap-5 sm:text-left">
              {/* Avatar */}
              <div className="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-[22px] bg-[orangered] text-3xl font-bold text-white shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)] sm:h-20 sm:w-20 sm:rounded-[24px]">
                {initial}
              </div>

              {/* User identity */}
              <div className="w-full min-w-0 sm:flex-1">
                <h2 className="break-words text-xl font-bold leading-tight text-black dark:text-[#f5f7fa] sm:text-2xl">
                  {user.name}
                </h2>

                <div className="mx-auto mt-2 flex min-w-0 max-w-full items-start justify-center gap-2 text-[#3f3e3e] dark:text-[#a8adb7] sm:mx-0 sm:justify-start">
                  <Mail
                    size={16}
                    className="mt-0.5 shrink-0"
                  />
                  <p className="min-w-0 break-all text-sm leading-5 sm:break-words">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Account information */}
          <div className="px-4 py-5 sm:p-8">
            <h2 className="text-base font-bold text-black dark:text-[#f5f7fa] sm:text-lg">
              Account information
            </h2>

            <div className="mt-4 grid min-w-0 gap-3 sm:mt-5 sm:grid-cols-2 sm:gap-4">
              {/* Name */}
              <div className="min-w-0 rounded-[18px] bg-[#e0e5ec] p-4 shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)] sm:rounded-[20px]">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#e0e5ec] text-[orangered] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)]">
                    <User size={17} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-[#777] dark:text-[#7f8793]">
                      Full name
                    </p>
                    <p className="mt-1 break-words text-sm font-semibold text-black dark:text-[#f5f7fa]">
                      {user.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="min-w-0 rounded-[18px] bg-[#e0e5ec] p-4 shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)] sm:rounded-[20px]">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#e0e5ec] text-[orangered] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)]">
                    <Mail size={17} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-[#777] dark:text-[#7f8793]">
                      Email address
                    </p>
                    <p className="mt-1 break-all text-sm font-semibold text-black dark:text-[#f5f7fa] sm:break-words">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Learning overview */}
        <section className="mt-5 grid grid-cols-1 gap-4 sm:mt-6 sm:grid-cols-2">
          {/* Courses */}
          <div className="rounded-[20px] bg-[#e0e5ec] p-5 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[9px_9px_16px_rgba(5,7,10,0.75),-9px_-9px_16px_rgba(43,48,58,0.75)] sm:p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#e0e5ec] text-[orangered] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]">
              <BookOpen size={19} />
            </div>

            <p className="mt-4 text-sm text-[#3f3e3e] dark:text-[#a8adb7] sm:mt-5">
              Courses started
            </p>
            <p className="mt-1 text-3xl font-bold text-black dark:text-[#f5f7fa]">
              {coursesStarted}
            </p>
          </div>

          {/* Learning time */}
          <div className="rounded-[20px] bg-[#e0e5ec] p-5 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[9px_9px_16px_rgba(5,7,10,0.75),-9px_-9px_16px_rgba(43,48,58,0.75)] sm:p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#e0e5ec] text-[orangered] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]">
              <Clock3 size={19} />
            </div>

            <p className="mt-4 text-sm text-[#3f3e3e] dark:text-[#a8adb7] sm:mt-5">
              Learning time
            </p>
            <p className="mt-1 text-3xl font-bold text-black dark:text-[#f5f7fa]">
              {learningHours}h
            </p>
          </div>
        </section>

        {/* Continue learning */}
        <section className="mt-5 rounded-[20px] bg-[#e0e5ec] p-4 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[9px_9px_16px_rgba(5,7,10,0.75),-9px_-9px_16px_rgba(43,48,58,0.75)] sm:mt-6 sm:p-6">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div className="min-w-0 text-center sm:text-left">
              <h2 className="text-lg font-bold leading-snug text-black dark:text-[#f5f7fa]">
                Continue your learning
              </h2>
              <p className="mt-1 text-sm leading-6 text-[#3f3e3e] dark:text-[#a8adb7]">
                Continue where you left off.
              </p>
            </div>

            <Link
              href="/my-learning"
              className="flex min-h-11 w-full shrink-0 items-center justify-center rounded-[12px] bg-[orangered] px-5 py-3 text-sm font-semibold text-white shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-200 hover:bg-[red] hover:shadow-[inset_3px_3px_6px_rgba(120,40,0,0.35),inset_-3px_-3px_6px_rgba(255,255,255,0.3)] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)] dark:hover:bg-[red] sm:w-auto"
            >
              My Learning
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
