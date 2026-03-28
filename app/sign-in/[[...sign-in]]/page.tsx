import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-stone-200 dark:bg-zinc-900">
      <SignIn />
    </div>
  );
}
