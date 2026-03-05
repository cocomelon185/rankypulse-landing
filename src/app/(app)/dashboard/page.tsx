import { redirect } from "next/navigation";
// Redirect old /dashboard route to the new /app/dashboard
export default function OldDashboardRedirect() {
  redirect("/app/dashboard");
}
