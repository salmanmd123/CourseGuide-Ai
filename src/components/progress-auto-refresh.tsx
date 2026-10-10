"use client";

/*
 * =========================================================
 * PROGRESS AUTO REFRESH
 * =========================================================
 *
 * Progress is now updated locally while watching a lesson
 * and saved to the database periodically.
 *
 * We intentionally DO NOT call router.refresh() every few
 * seconds because that causes unnecessary server/database
 * requests and increases Neon network usage.
 *
 * The component is kept so existing imports in:
 *
 * - Dashboard
 * - My Learning
 *
 * continue to work without changing those pages.
 */

export default function ProgressAutoRefresh() {
  return null;
}