import LogoLoader from "@/components/LogoLoader";

export default function Loading() {
    return (
        <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <div className="flex min-h-screen items-center justify-center px-4">
                <LogoLoader />
            </div>
        </main>
    );
}