import { Barbershop } from "@/app/generated/prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";

interface DashboardProps {
  barbershop: Barbershop;
}

const Dashboard = ({ barbershop }: DashboardProps) => {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Visão Geral - {barbershop.name}</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Agendamentos Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 0,00</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
