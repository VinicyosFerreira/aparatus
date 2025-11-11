"use server";

import { prisma } from "@/lib/prisma";
import { actionClient } from "@/lib/safe-action";
import { returnValidationErrors } from "next-safe-action";
import z from "zod";
import { startOfDay, endOfDay, format } from "date-fns";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

const inputSchema = z.object({
  barbershopId: z.string(),
  date: z.coerce.date(),
});

const TIME_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
];

export const getDateAvailableTimeSlots = actionClient
  .inputSchema(inputSchema)
  .action(async ({ parsedInput: { barbershopId, date } }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      returnValidationErrors(inputSchema, {
        _errors: ["Usuário não autenticado"],
      });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        barbershopId,
        date: {
          gte: startOfDay(date),
          lte: endOfDay(date),
        },
      },
    });

    const occupiedSlots = bookings.map((booking) =>
      format(booking.date, "HH:mm"),
    );

    const availbleTimeSlots = TIME_SLOTS.filter((timeSlot) => {
      return !occupiedSlots.includes(timeSlot);
    });

    return availbleTimeSlots;
  });
