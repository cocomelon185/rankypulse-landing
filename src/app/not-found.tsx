import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
          <FileQuestion className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-bold text-[#1B2559]">Page not found</h1>
        <p className="mt-2 text-gray-600">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/" className="mt-8">
          <Button size="lg">Back to home</Button>
        </Link>
      </div>
    </div>
  );
}
