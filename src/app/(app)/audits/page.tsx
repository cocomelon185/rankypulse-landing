import { redirect } from "next/navigation";
// Redirect old /audits route to the new /app/audit
export default function OldAuditsRedirect() {
  redirect("/app/audit");
}
