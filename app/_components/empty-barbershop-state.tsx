import {
  CalendarClockIcon,
  PlusIcon,
  ScissorsIcon,
  StoreIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from "./ui/card";
import { Dialog, DialogTrigger, DialogContent } from "../_components/ui/dialog";
import FormAddBarbershop from "./form-add-barbershop";

const EmptyBarbershopState = () => {
  const benefits = [
    {
      icon: ScissorsIcon,
      title: "Serviços e preços",
      description: "Cadastre cortes, barba e outros serviços.",
    },
    {
      icon: CalendarClockIcon,
      title: "Agenda centralizada",
      description: "Acompanhe reservas em um único painel.",
    },
    {
      icon: StoreIcon,
      title: "Perfil da barbearia",
      description: "Atualize dados, contatos e apresentação.",
    },
  ];

  return (
    <Card className="mx-auto my-8 w-10/12">
      <CardHeader className="items-center text-center">
        <div className="bg-primary/10 text-primary mb-2 flex size-12 items-center justify-center rounded-full">
          <StoreIcon className="size-6" />
        </div>
        <CardTitle className="text-xl">
          Comece a gerenciar sua barbearia
        </CardTitle>
        <CardDescription>
          Cadastre seus serviços, agende clientes e acompanhe suas reservas em
          um painel centralizado.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-6">
        <div className="grid w-full gap-3 md:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <div
                key={benefit.title}
                className="border-border bg-muted/40 flex flex-col gap-2 rounded-lg border p-4"
              >
                <Icon className="text-primary size-5" />
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {benefit.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="ml-auto px-6">
              <PlusIcon className="mr-2 size-5" />
              Cadastrar barbearia
            </Button>
          </DialogTrigger>
          <DialogContent>
            <FormAddBarbershop />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default EmptyBarbershopState;
