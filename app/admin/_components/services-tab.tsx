"use client";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/app/_components/ui/field";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { Textarea } from "@/app/_components/ui/textarea";
import { z } from "zod";
import { serviceFormSchema } from "@/schemas/service";
import { Barbershop } from "@/app/generated/prisma/client";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import { createBarbershopService } from "@/app/_actions/create-service";
import { editBarbershopService } from "@/app/_actions/edit-service";
import { BarbershopService } from "@/app/generated/prisma/client";
import DeleteServiceModal from "./delete-service-modal";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { NumericFormat } from "react-number-format";
import { PencilIcon } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/app/_components/ui/badge";

type FormInput = z.input<typeof serviceFormSchema>;
type FormOutput = z.output<typeof serviceFormSchema>;

interface ServicesTabProps {
  barbershop: Barbershop;
  barbershopServices: BarbershopService[];
}

const ServicesTab = ({ barbershop, barbershopServices }: ServicesTabProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [open, setIsOpen] = useState(false);
  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
      price: 0,
      barbershopId: barbershop.id,
    },
    disabled: !!barbershop.deletedAt,
  });

  const { execute: executeCreateService, isExecuting } = useAction(
    createBarbershopService,
    {
      onSuccess: () => {
        toast.success("Serviço cadastrado com sucesso!");
        form.reset();
      },
      onError: ({ error }) => {
        toast.error(
          error.serverError || "Erro ao cadastrar serviço. Tente novamente.",
        );
      },
    },
  );

  const { execute: executeEditService } = useAction(editBarbershopService, {
    onSuccess: () => {
      toast.success("Serviço editado com sucesso!");
      setIsEditing(false);
      form.reset();
    },
    onError: ({ error }) => {
      toast.error(
        error.serverError || "Erro ao editar serviço. Tente novamente.",
      );
    },
  });

  const handleSubmit = (data: FormInput) => {
    if (!isEditing) {
      executeCreateService(data);
    } else {
      executeEditService(data);
    }
  };

  const convertPriceToReais = (service: BarbershopService) => {
    const priceInReais = (service.priceInCents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    return priceInReais;
  };

  const handleEditService = (service: BarbershopService) => {
    setIsEditing(true);
    form.setValue("name", service.name);
    form.setValue("description", service.description);
    form.setValue("imageUrl", service.imageUrl);
    form.setValue("price", convertPriceToReais(service));
    form.setValue("id", service.id);
    form.setValue("barbershopId", service.barbershopId);
  };


  return (
    <div className="mt-3 flex flex-col gap-6">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="mb-4 text-xl font-bold">
            Serviços da {barbershop.name}
          </h2>
          {!!barbershop.deletedAt && (
            <Badge variant="destructive">
              Barbearia desativada
            </Badge>
          )}
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Adicionar / Editar Serviço
            </CardTitle>
          </CardHeader>
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
                          placeholder="Nome do serviço (ex: Corte degradê)"
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
                          placeholder="Descrição detalhada do serviço"
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
                  name="imageUrl"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>URL da Imagem: </FieldLabel>
                      <FieldContent>
                        <Input
                          {...field}
                          placeholder="https://..."
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
                  name="price"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Preço </FieldLabel>
                      <FieldContent>
                        <NumericFormat
                          placeholder="R$50,00"
                          customInput={Input}
                          className="border-border w-full"
                          aria-invalid={fieldState.invalid}
                          decimalScale={2}
                          fixedDecimalScale={true}
                          decimalSeparator=","
                          thousandSeparator="."
                          allowNegative={false}
                          prefix={"R$ "}
                          {...field}
                          value={field.value as number | undefined}
                          onChange={() => {}}
                          onValueChange={(values) => {
                            field.onChange(values.floatValue);
                          }}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </FieldContent>
                    </Field>
                  )}
                />
              </FieldGroup>

              <Button
                type="submit"
                className="mt-3 ml-auto w-[270px] cursor-pointer"
                disabled={isExecuting || !!barbershop.deletedAt}
              >
                {isEditing ? "Atualizar Serviço" : "Cadastrar Serviço"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="mb-4 text-xl font-bold">Serviços Cadastrados</h3>
        <div className="text-muted-foreground text-sm">
          {barbershopServices.length === 0 ? (
            <p>Nenhum serviço cadastrado.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {barbershopServices.map((service) => (
                <li
                  key={service.id}
                  className={`flex rounded-md border p-3 ${!service.isActive || !!barbershop.deletedAt ? "bg-muted/50" : ""}`}
                >
                  <div className="flex w-full flex-col gap-1">
                    <h4 className="font-bold">{service.name}</h4>
                    <p className="text-muted-foreground text-sm">
                      {service.description}
                    </p>
                    <p className="font-bold">{convertPriceToReais(service)}</p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <Button
                      type="button"
                      disabled={!service.isActive || !!barbershop.deletedAt}
                      className="flex cursor-pointer items-center justify-center"
                      onClick={() => handleEditService(service)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <DeleteServiceModal
                      open={open}
                      setIsOpen={setIsOpen}
                      service={{
                        id: service.id,
                        isActive: service.isActive,
                      }}
                      barbershop={{
                        deletedAt: barbershop.deletedAt,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServicesTab;
