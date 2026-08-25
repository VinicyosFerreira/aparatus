"use client";
import { Calendar } from "@/app/_components/ui/calendar";
import { useState } from "react";
import { ptBR } from "date-fns/locale";
import { BarbershopWithRelations } from "@/app/admin/_components/admin-sidebar";
import { isSameDay } from "date-fns";
import { Badge } from "@/app/_components/ui/badge";
import { Separator } from "@/app/_components/ui/separator";

interface BookingsTabProps {
  barbershop: BarbershopWithRelations;
  bookings: BarbershopWithRelations["bookings"];
}

const BookingsTab = ({ barbershop, bookings }: BookingsTabProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const bookingsForSelectedDate = bookings.filter((booking) => {
    return isSameDay(new Date(booking.date), date || new Date());
  });

  return (
    <div className="mt-3 flex flex-col gap-6 lg:flex-row">
      <div className="flex-1">
        <h2 className="mb-4 text-xl font-bold">
          Agendamentos - {barbershop.name}
        </h2>
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
        <h3 className="mb-4 text-xl font-bold">Reservas do dia</h3>
        <div className="text-muted-foreground text-sm">
          {bookingsForSelectedDate.length > 0 ? (
            <ul className="space-y-3">
              {bookingsForSelectedDate.map((booking) => (
                <li key={booking.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{booking.user.name}</p>
                      <p className="text-muted-foreground text-sm">
                        {booking.service.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm font-semibold">
                        {new Date(booking.date).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {booking.cancelled ? (
                        <Badge
                          variant="destructive"
                          className="py-0 tracking-wide"
                        >
                          Cancelado
                        </Badge>
                      ) : (
                        <Badge className="py-0 tracking-wide">
                          {booking.date > new Date()
                            ? "Agendado"
                            : "Finalizado"}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Separator className="my-2" />
                </li>
              ))}
            </ul>
          ) : (
            <p>
              Nenhum agendamento para o dia {date?.toLocaleDateString("pt-BR")}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingsTab;
