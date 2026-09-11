"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  Search,
  Sparkles,
  Target,
} from "lucide-react";

import Navbar from "@/components/navbar";

const features = [
  {
    icon: BookOpen,
    title: "Best courses",
    description:
      "Discover carefully selected courses instead of wasting time searching.",
  },
  {
    icon: Brain,
    title: "AI-powered notes",
    description:
      "Turn lessons into simple notes that are easier to understand and revise.",
  },
  {
    icon: Target,
    title: "Smart quizzes",
    description:
      "Practice what you learned and identify the topics that need more attention.",
  },
  {
    icon: Sparkles,
    title: "AI Tutor",
    description:
      "Ask questions whenever you get stuck and get explanations in simple language.",
  },
];

export default function Home() {
  const [search, setSearch] = useState("");

  // =========================================================
  // SEARCH
  // =========================================================

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = search.trim();

    if (!query) {
      return;
    }

    window.location.href = `/courses?q=${encodeURIComponent(query)}`;
  }

  // =========================================================
  // POPULAR TOPIC SEARCH
  // =========================================================

  function searchTopic(topic: string) {
    setSearch(topic);

    window.location.href = `/courses?q=${encodeURIComponent(topic)}`;
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#e0e5ec] text-black transition-colors duration-300 dark:bg-[#1a1d23] dark:text-[#f5f7fa]">

      {/* =========================================================
          NAVBAR
      ========================================================= */}

      <Navbar />

      {/* =========================================================
          HERO SECTION
      ========================================================= */}

      <section className="bg-[#e0e5ec] dark:bg-[#1a1d23]">

        <div className="mx-auto max-w-[1200px] px-8 pb-28 pt-16">

          <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">

            {/* =====================================================
                HERO LEFT
            ===================================================== */}

            <div className="max-w-[650px]">

              {/* EYEBROW */}

              <div
                className="
                  mb-7
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  bg-[#e0e5ec]
                  px-5
                  py-2
                  text-[13px]
                  font-semibold
                  text-[orangered]
                  shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)]
                  transition-all
                  duration-200
                  hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]

                  dark:bg-[#1e2229]
                  dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)]
                  dark:hover:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]
                "
              >
                <Sparkles
                  size={14}
                  strokeWidth={2}
                />

                <span>
                  A better way to learn
                </span>
              </div>

              {/* HEADING */}

              <h1
                className="
                  max-w-[680px]
                  text-[3.5rem]
                  font-extrabold
                  leading-[1.15]
                  tracking-[-1px]
                  text-black
                  sm:text-[3.8rem]
                  lg:text-[4rem]
                  dark:text-[#f5f7fa]
                "
              >
                <span className="text-[orangered]">
                  Stop
                </span>{" "}
                searching.
                <br />
                Start{" "}
                <span className="text-[orangered]">
                  learning.
                </span>
              </h1>

              {/* DESCRIPTION */}

              <p
                className="
                  mt-5
                  max-w-[500px]
                  text-[16px]
                  leading-7
                  text-[#3f3e3e]
                  sm:text-[17px]
                  dark:text-[#a8adb7]
                "
              >
                CourseGuide AI helps you find the right courses, understand
                difficult topics, practice what you learn, and stay on track.
              </p>

              {/* SEARCH */}

              <form
                onSubmit={handleSearch}
                className="
                  mt-7
                  flex
                  h-[58px]
                  max-w-[520px]
                  items-center
                  rounded-full
                  bg-[#e0e5ec]
                  p-1.5
                  shadow-[inset_6px_6px_10px_rgba(163,177,198,0.7),inset_-6px_-6px_10px_rgba(255,255,255,0.9)]
                  dark:bg-[#1e2229]
                  dark:shadow-[inset_6px_6px_10px_rgba(5,7,10,0.75),inset_-6px_-6px_10px_rgba(43,48,58,0.75)]
                "
              >
                <Search
                  size={18}
                  strokeWidth={1.8}
                  className="ml-4 shrink-0 text-[#3f3e3e] dark:text-[#a8adb7]"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="What do you want to learn?"
                  className="
                    min-w-0
                    flex-1
                    bg-transparent
                    px-3
                    text-[13px]
                    font-medium
                    text-black
                    outline-none
                    placeholder:text-[#3f3e3e]
                    dark:text-[#f5f7fa]
                    dark:placeholder:text-[#a8adb7]
                  "
                />

                <button
                  type="submit"
                  className="
                    h-[46px]
                    rounded-full
                    bg-[orangered]
                    px-7
                    text-[13px]
                    font-semibold
                    text-white
                    shadow-[5px_5px_12px_rgba(255,69,0,0.28),-5px_-5px_12px_rgba(255,255,255,0.8)]
                    transition-all
                    duration-200
                    hover:-translate-y-[1px]
                    hover:bg-[red]
                    active:translate-y-[1px]

                    dark:shadow-[5px_5px_12px_rgba(255,90,31,0.3),-5px_-5px_12px_rgba(43,48,58,0.7)]
                  "
                >
                  Search
                </button>
              </form>

              {/* TOPICS */}

              <div className="mt-5 flex flex-wrap gap-3">

                {[
                  "Python",
                  "Data Structures",
                  "Machine Learning",
                  "DBMS",
                ].map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => searchTopic(topic)}
                    className="
                      rounded-[12px]
                      bg-[#e0e5ec]
                      px-4
                      py-2
                      text-[12px]
                      font-semibold
                      text-[#3f3e3e]
                      shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)]
                      transition-all
                      duration-200
                      hover:text-[orangered]
                      hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]
                      active:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]

                      dark:bg-[#1e2229]
                      dark:text-[#a8adb7]
                      dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)]
                      dark:hover:text-[orangered]
                      dark:hover:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]
                      dark:active:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]
                    "
                  >
                    {topic}
                  </button>
                ))}

              </div>

            </div>

            {/* =====================================================
                HERO RIGHT
            ===================================================== */}

            <div className="relative flex justify-center">

              {/* DASHBOARD */}

              <div
                className="
                  flex
                  w-full
                  max-w-[420px]
                  flex-col
                  gap-6
                  rounded-[30px]
                  bg-[#e0e5ec]
                  p-8
                  shadow-[14px_14px_28px_rgba(163,177,198,0.6),-14px_-14px_28px_rgba(255,255,255,0.8)]

                  dark:bg-[#1e2229]
                  dark:shadow-[14px_14px_28px_rgba(5,7,10,0.8),-14px_-14px_28px_rgba(43,48,58,0.8)]
                "
              >

                {/* DASHBOARD HEADER */}

                <div className="flex items-center justify-between">

                  <div>

                    <p
                      className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[1px]
                        text-[#3f3e3e]
                        dark:text-[#a8adb7]
                      "
                    >
                      Continue learning
                    </p>

                    <h3
                      className="
                        mt-1
                        text-[17px]
                        font-bold
                        text-black
                        dark:text-[#f5f7fa]
                      "
                    >
                      Python Fundamentals
                    </h3>

                  </div>

                  <div
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-[12px]
                      bg-[#e0e5ec]
                      text-[orangered]
                      shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)]

                      dark:bg-[#1a1d23]
                      dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)]
                    "
                  >
                    <BookOpen
                      size={18}
                      strokeWidth={1.8}
                    />
                  </div>

                </div>

                {/* LESSON */}

                <div
                  className="
                    flex
                    flex-col
                    gap-2
                    rounded-[20px]
                    bg-[#e0e5ec]
                    p-5
                    shadow-[inset_6px_6px_10px_rgba(163,177,198,0.7),inset_-6px_-6px_10px_rgba(255,255,255,0.9)]

                    dark:bg-[#1a1d23]
                    dark:shadow-[inset_6px_6px_10px_rgba(5,7,10,0.75),inset_-6px_-6px_10px_rgba(43,48,58,0.75)]
                  "
                >

                  <p
                    className="
                      text-[10px]
                      font-extrabold
                      uppercase
                      tracking-[1px]
                      text-[orangered]
                    "
                  >
                    Current lesson
                  </p>

                  <h3
                    className="
                      text-[15px]
                      font-bold
                      text-black
                      dark:text-[#f5f7fa]
                    "
                  >
                    Conditional Statements
                  </h3>

                  {/* PROGRESS */}

                  <div
                    className="
                      my-2
                      h-[10px]
                      w-full
                      overflow-hidden
                      rounded-full
                      bg-[#e0e5ec]
                      p-[2px]
                      shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]

                      dark:bg-[#1a1d23]
                      dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]
                    "
                  >
                    <div
                      className="
                        h-full
                        w-[72%]
                        rounded-full
                        bg-[orangered]
                        shadow-[2px_2px_5px_rgba(255,69,0,0.25)]
                      "
                    />
                  </div>

                  <div
                    className="
                      flex
                      justify-between
                      text-[10px]
                      font-semibold
                      text-[#3f3e3e]
                      dark:text-[#a8adb7]
                    "
                  >
                    <span>
                      72% complete
                    </span>

                    <span>
                      8:42 remaining
                    </span>
                  </div>

                </div>

                {/* MINI CARDS */}

                <div className="grid grid-cols-2 gap-4">

                  {/* AI NOTES */}

                  <div
                    className="
                      flex
                      flex-col
                      items-start
                      gap-1
                      rounded-[20px]
                      bg-[#e0e5ec]
                      p-4
                      shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)]
                      transition-all
                      duration-200
                      hover:-translate-y-[2px]

                      dark:bg-[#1a1d23]
                      dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)]
                    "
                  >

                    <div
                      className="
                        mb-1
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-full
                        bg-[#e0e5ec]
                        text-[orangered]
                        shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]

                        dark:bg-[#1a1d23]
                        dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]
                      "
                    >
                      <CheckCircle2
                        size={15}
                        strokeWidth={1.8}
                      />
                    </div>

                    <strong
                      className="
                        text-[13px]
                        font-bold
                        text-black
                        dark:text-[#f5f7fa]
                      "
                    >
                      AI Notes
                    </strong>

                    <small
                      className="
                        text-[10px]
                        text-[#3f3e3e]
                        dark:text-[#a8adb7]
                      "
                    >
                      Ready to review
                    </small>

                  </div>

                  {/* QUIZ */}

                  <div
                    className="
                      flex
                      flex-col
                      items-start
                      gap-1
                      rounded-[20px]
                      bg-[#e0e5ec]
                      p-4
                      shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)]
                      transition-all
                      duration-200
                      hover:-translate-y-[2px]

                      dark:bg-[#1a1d23]
                      dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)]
                    "
                  >

                    <div
                      className="
                        mb-1
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-full
                        bg-[#e0e5ec]
                        text-[orangered]
                        shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]

                        dark:bg-[#1a1d23]
                        dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]
                      "
                    >
                      <Target
                        size={15}
                        strokeWidth={1.8}
                      />
                    </div>

                    <strong
                      className="
                        text-[13px]
                        font-bold
                        text-black
                        dark:text-[#f5f7fa]
                      "
                    >
                      Quiz
                    </strong>

                    <small
                      className="
                        text-[10px]
                        text-[#3f3e3e]
                        dark:text-[#a8adb7]
                      "
                    >
                      8 questions
                    </small>

                  </div>

                </div>

              </div>

              {/* STREAK */}

              <div
                className="
                  absolute
                  -bottom-5
                  -left-3
                  hidden
                  items-center
                  gap-3
                  rounded-[20px]
                  bg-[#e0e5ec]
                  px-5
                  py-3
                  shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)]
                  sm:flex

                  dark:bg-[#1e2229]
                  dark:shadow-[9px_9px_16px_rgba(5,7,10,0.75),-9px_-9px_16px_rgba(43,48,58,0.75)]
                "
              >

                <div
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-full
                    bg-[#e0e5ec]
                    text-[orangered]
                    shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]

                    dark:bg-[#1a1d23]
                    dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]
                  "
                >
                  <CheckCircle2
                    size={15}
                    strokeWidth={1.8}
                  />
                </div>

                <div>

                  <strong
                    className="
                      block
                      text-[12px]
                      font-bold
                      leading-tight
                      text-black
                      dark:text-[#f5f7fa]
                    "
                  >
                    Learning streak
                  </strong>

                  <small
                    className="
                      text-[10px]
                      font-bold
                      text-[orangered]
                    "
                  >
                    7 days 🔥
                  </small>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =========================================================
          FEATURES SECTION
      ========================================================= */}

      <section
        id="features"
        className="bg-[#e0e5ec] dark:bg-[#1a1d23] px-8 py-24"
      >

        <div className="mx-auto max-w-[1200px]">

          {/* HEADING */}

          <div className="mx-auto mb-16 max-w-[650px] text-center">

            <span
              className="
                mb-2
                block
                text-[11px]
                font-extrabold
                uppercase
                tracking-[1.5px]
                text-[orangered]
              "
            >
              Everything you need
            </span>

            <h2
              className="
                text-[2.5rem]
                font-extrabold
                leading-[1.2]
                tracking-[-0.5px]
                text-black
                dark:text-[#f5f7fa]
              "
            >
              Learning should feel simple.
            </h2>

            <p
              className="
                mt-3
                text-[16px]
                text-[#3f3e3e]
                dark:text-[#a8adb7]
              "
            >
              One place to discover, learn, practice, and improve.
            </p>

          </div>

          {/* FEATURE CARDS */}

          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">

            {features.map((feature) => {

              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="
                    flex
                    min-h-[250px]
                    flex-col
                    items-start
                    rounded-[30px]
                    bg-[#e0e5ec]
                    p-7
                    shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)]
                    transition-all
                    duration-300
                    hover:-translate-y-[5px]

                    dark:bg-[#1e2229]
                    dark:shadow-[9px_9px_16px_rgba(5,7,10,0.75),-9px_-9px_16px_rgba(43,48,58,0.75)]
                  "
                >

                  {/* ICON */}

                  <div
                    className="
                      flex
                      h-[54px]
                      w-[54px]
                      items-center
                      justify-center
                      rounded-[20px]
                      bg-[#e0e5ec]
                      text-[orangered]
                      shadow-[inset_6px_6px_10px_rgba(163,177,198,0.7),inset_-6px_-6px_10px_rgba(255,255,255,0.9)]

                      dark:bg-[#1a1d23]
                      dark:shadow-[inset_6px_6px_10px_rgba(5,7,10,0.75),inset_-6px_-6px_10px_rgba(43,48,58,0.75)]
                    "
                  >
                    <Icon
                      size={21}
                      strokeWidth={1.8}
                    />
                  </div>

                  {/* TITLE */}

                  <h3
                    className="
                      mt-6
                      text-[17px]
                      font-bold
                      text-black
                      dark:text-[#f5f7fa]
                    "
                  >
                    {feature.title}
                  </h3>

                  {/* DESCRIPTION */}

                  <p
                    className="
                      mt-3
                      text-[13px]
                      leading-6
                      text-[#3f3e3e]
                      dark:text-[#a8adb7]
                    "
                  >
                    {feature.description}
                  </p>

                </div>
              );

            })}

          </div>

        </div>

      </section>

      {/* =========================================================
          HOW IT WORKS
      ========================================================= */}

      <section
        id="how-it-works"
        className="bg-[#e0e5ec] dark:bg-[#1a1d23] px-8 py-24"
      >

        <div className="mx-auto max-w-[1200px]">

          {/* HEADING */}

          <div className="mx-auto mb-16 max-w-[650px] text-center">

            <span
              className="
                mb-2
                block
                text-[11px]
                font-extrabold
                uppercase
                tracking-[1.5px]
                text-[orangered]
              "
            >
              How it works
            </span>

            <h2
              className="
                text-[2.5rem]
                font-extrabold
                leading-[1.2]
                tracking-[-0.5px]
                text-black
                dark:text-[#f5f7fa]
              "
            >
              From search to understanding.
            </h2>

          </div>

          {/* STEPS */}

          <div className="mb-20 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">

            {[
              [
                "01",
                "Search",
                "Tell us what you want to learn.",
              ],
              [
                "02",
                "Choose",
                "Pick from the best available courses.",
              ],
              [
                "03",
                "Learn",
                "Watch, take notes, and ask questions.",
              ],
              [
                "04",
                "Improve",
                "Practice and track your progress.",
              ],
            ].map(([number, title, description]) => (

              <div
                key={number}
                className="
                  rounded-[30px]
                  bg-[#e0e5ec]
                  p-7
                  shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)]
                  transition-all
                  duration-200
                  hover:shadow-[inset_6px_6px_10px_rgba(163,177,198,0.7),inset_-6px_-6px_10px_rgba(255,255,255,0.9)]

                  dark:bg-[#1e2229]
                  dark:shadow-[9px_9px_16px_rgba(5,7,10,0.75),-9px_-9px_16px_rgba(43,48,58,0.75)]
                  dark:hover:shadow-[inset_6px_6px_10px_rgba(5,7,10,0.75),inset_-6px_-6px_10px_rgba(43,48,58,0.75)]
                "
              >

                {/* NUMBER */}

                <span
                  className="
                    block
                    text-[2rem]
                    font-extrabold
                    leading-none
                    text-[orangered]
                    opacity-80
                  "
                >
                  {number}
                </span>

                {/* TITLE */}

                <h3
                  className="
                    mt-5
                    text-[17px]
                    font-bold
                    text-black
                    dark:text-[#f5f7fa]
                  "
                >
                  {title}
                </h3>

                {/* DESCRIPTION */}

                <p
                  className="
                    mt-2
                    text-[13px]
                    leading-6
                    text-[#3f3e3e]
                    dark:text-[#a8adb7]
                  "
                >
                  {description}
                </p>

              </div>

            ))}

          </div>

          {/* =====================================================
              CTA
          ===================================================== */}

          <div
            className="
              flex
              flex-col
              items-start
              justify-between
              gap-8
              rounded-[30px]
              bg-[#e0e5ec]
              p-8
              shadow-[14px_14px_28px_rgba(163,177,198,0.6),-14px_-14px_28px_rgba(255,255,255,0.8)]
              sm:p-12
              md:flex-row
              md:items-center

              dark:bg-[#1e2229]
              dark:shadow-[14px_14px_28px_rgba(5,7,10,0.8),-14px_-14px_28px_rgba(43,48,58,0.8)]
            "
          >

            <div>

              <h2
                className="
                  text-[2rem]
                  font-extrabold
                  text-black
                  dark:text-[#f5f7fa]
                "
              >
                Ready to learn better?
              </h2>

              <p
                className="
                  mt-2
                  text-[15px]
                  text-[#3f3e3e]
                  dark:text-[#a8adb7]
                "
              >
                Find your next course and start building your skills today.
              </p>

            </div>

            <Link
              href="/courses"
              className="
                flex
                shrink-0
                items-center
                gap-3
                rounded-full
                bg-[orangered]
                px-7
                py-4
                text-[14px]
                font-bold
                text-white
                shadow-[5px_5px_12px_rgba(255,69,0,0.3),-5px_-5px_12px_rgba(255,255,255,0.8)]
                transition-all
                duration-200
                hover:-translate-y-[2px]
                hover:bg-[red]
                active:translate-y-[1px]

                dark:shadow-[5px_5px_12px_rgba(255,90,31,0.3),-5px_-5px_12px_rgba(43,48,58,0.7)]
              "
            >
              <span>
                Explore courses
              </span>

              <ArrowRight
                size={18}
                strokeWidth={2}
                className="transition-transform duration-200"
              />
            </Link>

          </div>

        </div>

      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}

      <footer
        className="
          border-t
          border-white/40
          bg-[#e0e5ec]
          px-8
          py-10
          dark:border-[#3b414c]
          dark:bg-[#1a1d23]
        "
      >

        <div
          className="
            mx-auto
            flex
            max-w-[1200px]
            flex-col
            items-center
            justify-between
            gap-4
            text-[12px]
            font-semibold
            text-[#3f3e3e]
            sm:flex-row
            dark:text-[#a8adb7]
          "
        >

          <p>
            © 2026 CourseGuide AI
          </p>

          <p>
            Learn smarter. Achieve more.
          </p>

        </div>

      </footer>

    </main>
  );
}