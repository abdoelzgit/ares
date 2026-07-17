import { redirect } from "next/navigation";
import { verifyAdmin } from "./actions";
import UsersSection from "./user-section";
export default async function Page() {
  const result = await verifyAdmin();

  if (!result.authorized) {
    redirect("/unauthorized");
  }

  return <UsersSection />;
}