"use server";
import { actionClient } from "@/lib/safe-action";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { returnValidationErrors } from "next-safe-action";
import { deactivateBarbershopSchema } from "@/schemas/barbershop";
import { revalidatePath } from "next/cache";

const inputSchema = deactivateBarbershopSchema;

export const deactivateBarbershop = actionClient
  .inputSchema(inputSchema)
  .action(async ({ parsedInput: { barbershopId } }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      returnValidationErrors(inputSchema, {
        _errors: ["Unauthorized"],
      });
    }

    const barbershop = await prisma.barbershop.findUnique({
      where: {
        id: barbershopId,
        ownerId: session.user.id,
      },
    });

    if (!barbershop) {
      returnValidationErrors(inputSchema, {
        _errors: ["Barbershop not found"],
      });
    }

    const deactivateBarbershop = await prisma.barbershop.update({
      where: {
        id: barbershopId,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    revalidatePath("/admin");
    return deactivateBarbershop;
  });
