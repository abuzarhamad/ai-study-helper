import { auth } from "@/auth";

export async function getAuthenticatedUserId() {
  const session = await auth();
  const userId = session?.user?.id;

  return typeof userId === "string" && userId ? userId : null;
}
