import Navbar from "@/components/navbar";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import InterviewsClient from "./interviews-client";

export const metadata = { title: "AI Interview Preparation | CourseGuide AI" };

export default async function InterviewsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "ADMIN") redirect("/admin");
  return <><Navbar /><InterviewsClient userName={user.name} userId={Number(user.id)} /></>;
}
