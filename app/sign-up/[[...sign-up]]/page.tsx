import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-stone-200 dark:bg-zinc-900">
      <SignUp />
    </div>
  );
}
