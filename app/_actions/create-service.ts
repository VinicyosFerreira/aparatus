"use server";
import { actionClient } from "@/lib/safe-action";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { returnValidationErrors } from "next-safe-action";
import { serviceFormSchema } from "@/schemas/service";
import { revalidatePath } from "next/cache";

const inputSchema = serviceFormSchema;

export const createBarbershopService = actionClient
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
        id: data.barbershopId,
        ownerId: session.user.id,
      },
    });

    if (!barbershop) {
      returnValidationErrors(inputSchema, {
        _errors: [
          "You don't have a barbershop or not permitted to create a service for this barbershop",
        ],
      });
    }

    if (barbershop.ownerId !== session.user.id) {
      returnValidationErrors(inputSchema, {
        _errors: ["You are not the owner of this barbershop"],
      });
    }

    // transformar o price em centavos
    data.price = data.price * 100;

    const createdBarbershopService = await prisma.barbershopService.create({
      data: {
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        priceInCents: data.price,
        barbershopId: data.barbershopId,
      },
    });


    revalidatePath("/admin");
    return createdBarbershopService;
  });
