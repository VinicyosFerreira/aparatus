import { z } from "zod";

export const serviceFormSchema = z.object({
  name: z.string().min(1, { error: "O nome é obrigatório." }),
  description: z.string().min(1, { error: "A descrição é obrigatória." }),
  imageUrl: z.url({ error: "URL da imagem inválida." }),
  price: z.coerce
    .number({ error: "O preço é obrigatório." })
    .positive({ error: "O preço deve ser um número positivo." }),
  barbershopId: z.uuid({ error: "O ID da barbearia é obrigatório." }),
});
