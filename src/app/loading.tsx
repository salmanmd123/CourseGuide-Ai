import LogoLoader from "@/components/LogoLoader";

export default function Loading() {
  return (
    <div
      className="
        fixed inset-0 z-[9999]
        flex min-h-screen
        items-center justify-center
        bg-[#e0e5ec]
        dark:bg-[#1a1d23]
      "
    >
      <div className="w-full max-w-md px-6">
        <LogoLoader />
      </div>
    </div>
  );
}