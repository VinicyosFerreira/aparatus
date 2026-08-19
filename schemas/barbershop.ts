import { z } from "zod";
export const barbershopFormSchema = z.object({
  name: z.string().min(1, { error: "O nome é obrigatório." }),
  address: z.string().min(1, { error: "O endereço é obrigatório." }),
  description: z.string().min(1, { error: "A descrição é obrigatória." }),
  phone: z
    .string()
    .min(1, { error: "O telefone é obrigatório." })
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, {
      error: "Formato de telefone inválido.",
    }),
  style: z
    .string({
      error: "O estilo é obrigatório.",
    })
    .min(1, { error: "O estilo é obrigatório." }),
});

// id deve ser obrigatorio e o resto opcional
export const updateBarbershopFormSchema = barbershopFormSchema
  .extend({
    id: z.uuid(),
  })
  .omit({ style: true })
  .partial()
  .required({ id: true });
