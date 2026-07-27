import { auth } from "../../lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Header from "../_components/header";
import Footer from "../_components/footer";
import { prisma } from "@/lib/prisma";
import EmptyBarbershopState from "../_components/empty-barbershop-state";

const Admin = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user.id;

  if (!userId) {
    redirect("/");
  }

  const myBarbershops = await prisma.barbershop.findMany({
    where: {
      ownerId: userId,
    },
  });

  return (
    <main className="flex h-screen flex-col">
      <Header />
      {myBarbershops.length === 0 ? (
        <div className="flex-1">
          <EmptyBarbershopState />
        </div>
      ) : (
        <div className="flex-1">Admin</div>
      )}
      <Footer />
    </main>
  );
};

export default Admin;
