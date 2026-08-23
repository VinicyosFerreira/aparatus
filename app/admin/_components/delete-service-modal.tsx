"use client";
import { Button } from "@/app/_components/ui/button";
import {
  DialogTrigger,
  DialogContent,
  Dialog,
} from "@/app/_components/ui/dialog";
import { TrashIcon } from "lucide-react";
import { deactivateService } from "@/app/_actions/deactivate-service";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

interface DeleteServiceModalProps {
  open: boolean;
  setIsOpen: (open: boolean) => void;
  service: {
    id: string;
    isActive: boolean;
  };
  barbershop: {
    deletedAt: Date | null;
  }
}

const DeleteServiceModal = ({
  open,
  setIsOpen,
  service,
  barbershop,
}: DeleteServiceModalProps) => {
  const { execute: deleteService, isExecuting } = useAction(deactivateService, {
    onSuccess: () => {
      setIsOpen(!open);
      toast.success("Serviço deletado com sucesso!");
    },
    onError: ({ error }) => {
      toast.error(
        error.serverError || "Erro ao deletar serviço. Tente novamente.",
      );
    },
  });
  const handleDeleteService = () => {
    setIsOpen(!open);
  };

  const deleteServiceConfirmed = (serviceId: string) => {
    deleteService({ serviceId });
  };

  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          disabled={!service.isActive || !!barbershop.deletedAt}
          className="bg-destructive hover:bg-destructive/90 flex cursor-pointer items-center justify-center"
          onClick={() => handleDeleteService()}
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Excluir Serviço</h2>
          <p className="text-muted-foreground text-sm">
            Tem certeza que deseja excluir esse serviço?
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="destructive"
              disabled={isExecuting}
              onClick={() => deleteServiceConfirmed(service.id)}
            >
              Deletar serviço
            </Button>
            <Button variant="outline">Cancelar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteServiceModal;
