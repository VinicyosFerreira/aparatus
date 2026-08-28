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

    const montlyRevenue = await prisma.booking.aggregate({
      _sum: {
        priceAtBookingInCents: true,
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

    if (!montlyRevenue._sum.priceAtBookingInCents) {
      return resultDashboard(
        0,
        countCustomerMonth.length,
        "Nenhuma reserva agendada",
      );
    }

    if (mostBookedServiceOnMonth.length === 0) {
      return resultDashboard(
        montlyRevenue._sum.priceAtBookingInCents / 100,
        countCustomerMonth.length,
        "Nenhuma reserva agendada",
      );
    }

    const mostBookedService = await prisma.barbershopService.findFirst({
      where: {
        id: mostBookedServiceOnMonth[0].serviceId,
      },
    });

    const result = resultDashboard(
      montlyRevenue._sum.priceAtBookingInCents / 100,
      countCustomerMonth.length,
      mostBookedService?.name || "Nenhuma reserva agendada",
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
