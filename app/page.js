import { auth } from "@/auth";
import Home from "@/components/HomePage";
import { redirect } from "next/navigation";

const page = async () => {
  const session = await auth();

  
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div>
      <Home />
    </div>
  );
};

export default page;
