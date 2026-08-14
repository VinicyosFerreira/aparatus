"use client";
import { Barbershop } from "@/app/generated/prisma/client";
import { Calendar } from "@/app/_components/ui/calendar";
import { useState } from "react";
import { ptBR } from "date-fns/locale";

interface BookingsTabProps {
  barbershop: Barbershop;
}

const BookingsTab = ({ barbershop }: BookingsTabProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="flex flex-col mt-3 gap-6 lg:flex-row">
      <div className="flex-1">
        <h2 className="text-xl font-bold mb-4">Agendamentos - {barbershop.name}</h2>
        <div className="flex justify-center md:justify-start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border shadow"
            locale={ptBR}
          />
        </div>
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-bold mb-4">Reservas do dia</h3>
        <div className="text-muted-foreground text-sm">
          {date ? (
            <p>Os agendamentos para o dia {date.toLocaleDateString("pt-BR")} aparecerão aqui.</p>
          ) : (
            <p>Selecione uma data para ver os agendamentos.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingsTab;
