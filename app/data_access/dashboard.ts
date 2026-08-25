import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { startOfMonth, endOfMonth } from "date-fns";

export const getInformationsToDashboard = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    const dateNow = new Date();
    const monthAgoFirstDay = startOfMonth(dateNow);
    const monthAgoLastDay = endOfMonth(dateNow);

    const montlyRevenue = await prisma.booking.findMany({
      where: {
        barbershop: {
          ownerId: session.user.id,
        },
        date: {
          gte: monthAgoFirstDay,
          lte: monthAgoLastDay,
        },
      },
      include: {
        service: true,
      },
    });

    const montlyRevenueReduce = montlyRevenue.reduce((acc, item) => {
      return acc + item.service.priceInCents;
    }, 0);

    const countCustomerMonth = await prisma.booking.groupBy({
      by: ["userId"],
      _count: {
        userId: true,
      },
      where: {
        barbershop: {
          ownerId: session.user.id,
        },
        date: {
          gte: monthAgoFirstDay,
          lte: monthAgoLastDay,
        },
      },
    });

    const mostBookedServiceOnMonth = await prisma.booking.groupBy({
      by: ["serviceId"],
      _count: {
        serviceId: true,
      },
      orderBy: {
        _count: {
          serviceId: "desc",
        },
      },
      take: 1,
      where: {
        barbershop: {
          ownerId: session.user.id,
        },
        date: {
          gte: monthAgoFirstDay,
          lte: monthAgoLastDay,
        },
      },
    });


    if (mostBookedServiceOnMonth.length === 0) {
      return resultDashboard(
        montlyRevenueReduce / 100,
        countCustomerMonth.length,
        "Não há serviços agendados",
      );
    }

    const mostBookedService = await prisma.barbershopService.findFirst({
      where: {
        id: mostBookedServiceOnMonth[0].serviceId,
      },
    });

    const result = resultDashboard(
      montlyRevenueReduce / 100,
      countCustomerMonth.length,
      mostBookedService?.name || "Não há serviços agendados",
    );

    return result;
  } catch (error) {
    console.error("Error fetching montlyRevenue:", error);
  }
};

const resultDashboard = (
  montlyRevenue: number,
  countCustomerMonth: number,
  mostBookedService: string,
) => {
  return {
    montlyRevenue,
    countCustomerMonth,
    mostBookedService,
  };
};
