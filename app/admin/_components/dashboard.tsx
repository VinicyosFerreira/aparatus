import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { getInformationsToDashboard } from "@/app/data_access/dashboard";

const Dashboard = async () => {
  const result = await getInformationsToDashboard();

  return (
    <div className="mx-4 flex h-full justify-center items-center flex-col gap-4">
      <h2 className="text-2xl font-bold">Visão Geral</h2>
      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(250px,1fr))] mx-auto w-full max-w-7xl">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Faturamento mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-primary text-2xl font-bold">
              {result?.montlyRevenue.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clientes agendados no mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-primary text-2xl font-bold">
              {result?.countCustomerMonth}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Serviços mais agendado do mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-primary text-2xl font-bold">
              {result?.mostBookedService}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
