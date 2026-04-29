import { SignUp } from "@clerk/nextjs";
import { Logo } from "@/components/layout/logo";

export default function SignUpPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo />
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            Create your family space
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A private home for the photos that matter most.
          </p>
        </div>
        <div className="flex justify-center">
          <SignUp
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "glass-strong rounded-2xl shadow-[0_30px_80px_-24px_rgba(0,0,0,0.35)]",
                footer: "hidden",
                footerAction: "hidden",
              },
            }}
          />
        </div>
      </div>
    </main>
  );
}
