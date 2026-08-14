"use client";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/app/_components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { Textarea } from "@/app/_components/ui/textarea";
import { z } from "zod";
import { barbershopFormSchema } from "@/schemas/barbershop";
import { Barbershop } from "@/app/generated/prisma/client";
import { Card, CardContent } from "@/app/_components/ui/card";
import { toast } from "sonner";

type useFormType = z.infer<typeof barbershopFormSchema>;

interface EditBarbershopTabProps {
  barbershop: Barbershop;
}

const EditBarbershopTab = ({ barbershop }: EditBarbershopTabProps) => {
  const form = useForm<useFormType>({
    resolver: zodResolver(barbershopFormSchema),
    defaultValues: {
      name: barbershop.name || "",
      address: barbershop.address || "",
      description: barbershop.description || "",
      phone: barbershop.phones?.[0] || "",
      style: "",
    },
  });

  const handleSubmit = (data: useFormType) => {
    // Apenas simulação de envio conforme regra do projeto
    console.log("Submit Edit Barbershop Data:", data);
    toast.success("Barbearia atualizada com sucesso (Simulação)!");
  };

  return (
    <div className="flex my-3 flex-col gap-4">
      <h2 className="text-xl font-bold">Editar {barbershop.name}</h2>
      <Card>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col space-y-3"
          >
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Nome: </FieldLabel>
                    <FieldContent>
                      <Input
                        {...field}
                        placeholder="Digite o nome de barbearia"
                        className="border-border w-full"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </FieldContent>
                  </Field>
                )}
              />
            </FieldGroup>
            <FieldGroup>
              <Controller
                name="address"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Endereço: </FieldLabel>
                    <FieldContent>
                      <Input
                        {...field}
                        placeholder="Digite o endereço"
                        className="border-border w-full"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </FieldContent>
                  </Field>
                )}
              />
            </FieldGroup>
            <FieldGroup>
              <Controller
                name="phone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Telefone: </FieldLabel>
                    <FieldContent>
                      <Input
                        {...field}
                        placeholder="Digite o telefone"
                        className="border-border w-full"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </FieldContent>
                  </Field>
                )}
              />
            </FieldGroup>
            <FieldGroup>
              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Descrição: </FieldLabel>
                    <FieldContent>
                      <Textarea
                        {...field}
                        placeholder="Digite a descrição"
                        className="border-border w-full"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </FieldContent>
                  </Field>
                )}
              />
            </FieldGroup>
            <FieldGroup>
              <Controller
                name="style"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Estilo: </FieldLabel>
                    <FieldContent>
                      <Select
                        name={field.name}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="border-border w-full">
                          <SelectValue placeholder="Selecione um estilo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="classic">Clássico</SelectItem>
                          <SelectItem value="urban">Urbano</SelectItem>
                          <SelectItem value="modern">Moderno</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </FieldContent>
                  </Field>
                )}
              />
            </FieldGroup>

            <Button type="submit" className="mt-3 w-[270px] ml-auto cursor-pointer">
              Salvar Alterações
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditBarbershopTab;
