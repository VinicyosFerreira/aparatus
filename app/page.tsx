import Image from "next/image";
import Header from "./_components/header";
import SearchInput from "./_components/search-input";
import banner from "../public/banner.png";
import BookingItem from "./_components/booking-item";

export default function Home() {
  return (
    <main>
      <Header />
      <div className="space-y-4 px-5">
        <SearchInput />
        <Image
          src={banner}
          sizes="100vw"
          alt="Agende agora"
          className="h-auto w-full"
        />
        <h2 className="text-foreground text-xs font-semibold">Agendamentos</h2>
        <BookingItem
          serviceName="Corte de cabelo"
          barbershopName="Barbearia Aparatus"
          barbershopImage="https://utfs.io/f/5832df58-cfd7-4b3f-b102-42b7e150ced2-16r.png"
          date={new Date()}
        />
      </div>
    </main>
  );
}
