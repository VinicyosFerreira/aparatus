"use server";
import { actionClient } from "@/lib/safe-action";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { returnValidationErrors } from "next-safe-action";
import { deactivateServiceSchema } from "@/schemas/service";
import { revalidatePath } from "next/cache";

const inputSchema = deactivateServiceSchema;

export const deactivateService = actionClient
  .inputSchema(inputSchema)
  .action(async ({ parsedInput: {serviceId} }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      returnValidationErrors(inputSchema, {
        _errors: ["Unauthorized"],
      });
    }

    const service = await prisma.barbershopService.findUnique({
      where: {
        id: serviceId,
      },
    });

    if (!service) {
      returnValidationErrors(inputSchema, {
        _errors: ["Service not found"],
      });
    }

    if (!service.isActive) {
      returnValidationErrors(inputSchema, {
        _errors: ["Service is already inactive"],
      });
    }

    const barbershop = await prisma.barbershop.findFirst({
      where: {
        id: service.barbershopId,
        ownerId: session.user.id,
        deletedAt: null,
      },
    });

    if (!barbershop) {
      returnValidationErrors(inputSchema, {
        _errors: [
          "You don't have a barbershop or not permitted to create a service for this barbershop",
        ],
      });
    }

    const deactivatedService = await prisma.barbershopService.update({
      where: {
        id: serviceId,
      },
      data: {
        isActive: false,
      },
    });

    revalidatePath("/", "layout");
    return deactivatedService;
  });
