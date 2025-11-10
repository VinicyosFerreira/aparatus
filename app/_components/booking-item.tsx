import Image from "next/image";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Avatar, AvatarImage } from "./ui/avatar";

interface BookingItemProps {
  serviceName: string;
  barbershopName: string;
  barbershopImage: string;
  date: Date;
}

const BookingItem = ({
  serviceName,
  barbershopName,
  barbershopImage,
  date,
}: BookingItemProps) => {
  return (
    <Card className="flex h-full w-full flex-row items-center justify-between p-0">
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Badge>Confirmado</Badge>
        <div className="flex flex-col gap-2">
          <p className="font-bold">{serviceName}</p>
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={barbershopImage} />
            </Avatar>
            <p className="text-muted-foreground text-sm">{barbershopName}</p>
          </div>
        </div>
      </div>

      <div className="flex h-full flex-col items-center justify-center border-l p-4 py-3">
        <p className="text-xs capitalize">
          {date.toLocaleDateString("pt-BR", { month: "long" })}
        </p>
        <p className="text-xs">
          {date.toLocaleDateString("pt-BR", { day: "2-digit" })}
        </p>
        <p className="text-xs">
          {date.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </Card>
  );
};

export default BookingItem;
