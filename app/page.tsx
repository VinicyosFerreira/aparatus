import Image from "next/image";
import Header from "./_components/header";
import SearchInput from "./_components/search-input";
import banner from "../public/banner.png";
import BookingItem from "./_components/booking-item";
import BarbershopItem from "./_components/barbershop-item";
import { prisma } from "../lib/prisma";
import Footer from "./_components/footer";
import {
  PageContainer,
  PageSection,
  PageSectionScroller,
  PageSectionTitle,
} from "./_components/ui/page";

export default async function Home() {
  const recommendedBarbershops = await prisma.barbershop.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const popularBarbershops = await prisma.barbershop.findMany({
    orderBy: {
      name: "desc",
    },
  });

  return (
    <main>
      <Header />
      <PageContainer>
        <SearchInput />
        <Image
          src={banner}
          sizes="100vw"
          alt="Agende agora"
          className="h-auto w-full"
        />
        {/* <PageSection>
          <PageSectionTitle>Agendamentos</PageSectionTitle>
          <BookingItem
            serviceName="Corte de cabelo"
            barbershopName="Barbearia Aparatus"
            barbershopImage="https://utfs.io/f/5832df58-cfd7-4b3f-b102-42b7e150ced2-16r.png"
            date={new Date()}
          />
        </PageSection> */}

        <PageSection>
          <PageSectionTitle>Recomendadas</PageSectionTitle>
          <PageSectionScroller>
            {recommendedBarbershops.map((barbershop) => (
              <BarbershopItem key={barbershop.id} barbershop={barbershop} />
            ))}
          </PageSectionScroller>
        </PageSection>

        <PageSection>
          <PageSectionTitle>Populares</PageSectionTitle>
          <PageSectionScroller>
            {popularBarbershops.map((barbershop) => (
              <BarbershopItem key={barbershop.id} barbershop={barbershop} />
            ))}
          </PageSectionScroller>
        </PageSection>
      </PageContainer>
      <Footer />
    </main>
  );
}
