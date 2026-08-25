"use server";
import { actionClient } from "@/lib/safe-action";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { returnValidationErrors } from "next-safe-action";
import { barbershopFormSchema } from "@/schemas/barbershop";
import { revalidatePath } from "next/cache";
import { barbershopListImages } from "@/constants/barbershop-list-images";

const inputSchema = barbershopFormSchema;

const chooseAnImageBasedStyle = (
  chooseStyle: string,
  listOfImages: string[],
) => {
  const styles = ["classic", "urban", "modern", "premium"];

  if (styles.includes(chooseStyle)) {
    const randomIndex = Math.floor(Math.random() * listOfImages.length);
    return listOfImages[randomIndex];
  }

  return null;
};

export const createBarbershop = actionClient
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

    // validar o estilo da barbearia para seleção da imagem
    const imageStyle = data.style;
    const randomImage = chooseAnImageBasedStyle(
      imageStyle,
      barbershopListImages,
    );

    // validar se um estilo foi selecionado
    if (!randomImage) {
      returnValidationErrors(inputSchema, {
        _errors: ["Style not selected"],
      });
    }

    const barbershop = await prisma.barbershop.create({
      data: {
        name: data.name,
        address: data.address,
        description: data.description,
        phones: data.phone.split(","),
        imageUrl: randomImage,
        ownerId: session.user.id,
      },
    });

    revalidatePath("/admin");
    return barbershop;
  });
