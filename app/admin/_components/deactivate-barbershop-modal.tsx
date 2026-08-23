"use client";
import { Button } from "@/app/_components/ui/button";
import {
  DialogTrigger,
  DialogContent,
  Dialog,
} from "@/app/_components/ui/dialog";
import { toast } from "sonner";
import { deactivateBarbershop } from "@/app/_actions/deactivate-barbershop";
import { useAction } from "next-safe-action/hooks";

interface DeactivateBarbershopModalProps {
  open: boolean;
  setIsOpen: (open: boolean) => void;
  barbershop: {
    id: string;
    deletedAt: Date | null;
  };
}

const DeactivateBarbershopModal = ({
  open,
  setIsOpen,
  barbershop,
}: DeactivateBarbershopModalProps) => {
  const { execute: executeDeactivateBarbershop, isExecuting } = useAction(
    deactivateBarbershop,
    {
      onSuccess: () => {
        setIsOpen(!open);
        toast.success("Barbearia desativada com sucesso!");
      },
      onError: ({ error }) => {
        toast.error(
          error.serverError || "Erro ao desativar barbearia. Tente novamente.",
        );
      },
    },
  );

  const deactivateBarbershopConfirmed = (barbershopId: string) => {
    executeDeactivateBarbershop({ barbershopId });
  };

  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="mt-3 w-[270px] cursor-pointer" disabled={!!barbershop.deletedAt}>
          Desativar Barbearia
        </Button>
      </DialogTrigger>
      <DialogContent>
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Desativar Barbearia</h2>
          <p className="text-muted-foreground text-sm">
            Tem certeza que deseja desativar essa barbearia?
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="destructive"
              disabled={isExecuting}
              onClick={() => deactivateBarbershopConfirmed(barbershop.id)}
            >
              Desativar Barbearia
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeactivateBarbershopModal;
