"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarTrigger,
  SidebarMenuButton,
  SidebarMenu,
  SidebarMenuItem,
  SidebarInset,
} from "@/app/_components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/app/_components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/_components/ui/tabs";
import {
  SquareKanban,
  Scissors,
  PlusCircleIcon,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { Prisma } from "@/app/generated/prisma/client";
import EditBarbershopTab from "@/app/admin/_components/edit-barbershop-tab";
import ServicesTab from "@/app/admin/_components/services-tab";
import BookingsTab from "@/app/admin/_components/bookings-tab";
import FormAddBarbershop from "@/app/_components/form-add-barbershop";
import { Card, CardContent } from "@/app/_components/ui/card";

type BarbershopWithServices = Prisma.BarbershopGetPayload<{
  include: { services: true };
}>;

const AdminSidebar = ({
  barbershops,
}: {
  barbershops: BarbershopWithServices[];
}) => {
  const [optionSelected, setOptionSelected] = useState("dashboard");
  const [barbershopSelectedId, setBarbershopSelectedId] = useState<
    string | null
  >(null);

  const handleBarbershopSelect = (barbershop: BarbershopWithServices) => {
    setBarbershopSelectedId(barbershop.id);
    setOptionSelected("barbershops");
  };

  const barbershopSelected = barbershops.find(
    (barbershop) => barbershop.id === barbershopSelectedId,
  );

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="group-data-[collapsible=icon]:hidden">
          <h2 className="p-3 text-lg font-bold">Aparatus - Admin</h2>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem
                className={
                  optionSelected === "dashboard"
                    ? "bg-primary/75 rounded-md"
                    : "bg-transparent"
                }
              >
                <SidebarMenuButton
                  className="flex items-center"
                  onClick={() => setOptionSelected("dashboard")}
                >
                  <SquareKanban />
                  <span className="font-semibold">Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem
                className={
                  optionSelected === "barbershops"
                    ? "bg-primary/75 rounded-md"
                    : "bg-transparent"
                }
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="flex items-center">
                      <Scissors />
                      <span className="font-semibold">Barbearias</span>
                      <ChevronDown className="ml-auto" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {barbershops.map((barbershop) => (
                      <DropdownMenuItem
                        key={barbershop.id}
                        onClick={() => handleBarbershopSelect(barbershop)}
                      >
                        {barbershop.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
              <SidebarMenuItem
                className={
                  optionSelected === "create-barbershop"
                    ? "bg-primary/75 rounded-md"
                    : "bg-transparent"
                }
              >
                <SidebarMenuButton
                  className="flex items-center"
                  onClick={() => setOptionSelected("create-barbershop")}
                >
                  <PlusCircleIcon />
                  <span className="font-semibold">Criar barbearia</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <SidebarTrigger />
        <div className="mt-5">
          {optionSelected === "dashboard" && <div>Dashboard</div>}

          {optionSelected === "barbershops" && barbershopSelected && (
            <Tabs defaultValue="resume" className="mx-5">
              <TabsList className="w-full">
                <TabsTrigger value="babershop">Barbearia</TabsTrigger>
                <TabsTrigger value="services">Serviços</TabsTrigger>
                <TabsTrigger value="bookings">Agendamentos</TabsTrigger>
              </TabsList>
              <TabsContent value="babershop">
                <EditBarbershopTab barbershop={barbershopSelected} />
              </TabsContent>
              <TabsContent value="services">
                <ServicesTab
                  barbershop={barbershopSelected}
                  barbershopServices={barbershopSelected.services}
                />
              </TabsContent>
              <TabsContent value="bookings">
                <BookingsTab barbershop={barbershopSelected} />
              </TabsContent>
            </Tabs>
          )}

          {optionSelected === "create-barbershop" && (
            <div className="mx-5 my-3">
              <Card>
                <CardContent>
                  <FormAddBarbershop />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </SidebarInset>
    </>
  );
};

export default AdminSidebar;
