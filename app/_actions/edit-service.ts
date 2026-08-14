"use server";
import { actionClient } from "@/lib/safe-action";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { returnValidationErrors } from "next-safe-action";
import { serviceFormSchema } from "@/schemas/service";
import { revalidatePath } from "next/cache";

const inputSchema = serviceFormSchema;

export const editBarbershopService = actionClient
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

    const service = await prisma.barbershopService.findUnique({
      where: {
        id: data.id,
      },
    });

    if (!service) {
      returnValidationErrors(inputSchema, {
        _errors: ["Service not found"],
      });
    }

    const barbershop = await prisma.barbershop.findFirst({
      where: {
        id: service.barbershopId,
        ownerId: session.user.id,
      },
    });

    if (!barbershop) {
      returnValidationErrors(inputSchema, {
        _errors: [
          "You don't have a barbershop or not permitted to edit this service",
        ],
      });
    }

    if (barbershop.ownerId !== session.user.id) {
      returnValidationErrors(inputSchema, {
        _errors: ["You don't have permission to edit this service"],
      });
    }

    // transformar o price em centavos
    data.price = data.price * 100;

    const updatedService = await prisma.barbershopService.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        description: data.description,
        priceInCents: data.price,
        imageUrl: data.imageUrl,
      },
    });

    revalidatePath("/admin");
    return updatedService;
  });
