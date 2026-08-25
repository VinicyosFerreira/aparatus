"use server";
import { actionClient } from "@/lib/safe-action";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { returnValidationErrors } from "next-safe-action";
import { updateBarbershopFormSchema } from "@/schemas/barbershop";
import { revalidatePath } from "next/cache";

const inputSchema = updateBarbershopFormSchema;

export const editBarbershop = actionClient
  .inputSchema(inputSchema)
  .action(async ({ parsedInput: { ...data } }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // validar se o usuário está logado
    if (!session?.user) {
      returnValidationErrors(inputSchema, {
        _errors: ["Unauthorized"],
      });
    }

    const barbershop = await prisma.barbershop.findFirst({
      where: {
        id: data.id,
        ownerId: session.user.id,
        deletedAt: null,
      },
    });

    if (!barbershop) {
      returnValidationErrors(inputSchema, {
        _errors: [
          "You don't have a barbershop or not permitted to edit this barbershop",
        ],
      });
    }

    const updatedBarbershop = await prisma.barbershop.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        description: data.description,
        address: data.address,
        phones: data.phone?.split(","),
      },
    });

    revalidatePath("/admin");
    return updatedBarbershop;
  });
