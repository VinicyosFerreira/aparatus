import { auth } from "../../lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Header from "../_components/header";
import { prisma } from "@/lib/prisma";
import EmptyBarbershopState from "../_components/empty-barbershop-state";
import { SidebarProvider } from "@/app/_components/ui/sidebar";
import AdminSidebar from "./_components/admin-sidebar";

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
    include: {
      services: true,
    },
  });

  return (
    <main className="flex h-screen flex-col overflow-hidden">
      <Header />
      {myBarbershops.length === 0 ? (
        <div className="flex-1">
          <EmptyBarbershopState />
        </div>
      ) : (
        <div className="flex h-full">
          <SidebarProvider>
            <AdminSidebar barbershops={myBarbershops} />
          </SidebarProvider>
        </div>
      )}
    </main>
  );
};

export default Admin;
