import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { SearchIcon } from "lucide-react";

const SearchInput = () => {
  return (
    <div className="flex items-center gap-2">
      <Input type="text" placeholder="Pesquise serviços ou barbearia "  className="rounded-full border-border"/>
      <Button size="icon">
        <SearchIcon />
      </Button>
    </div>
  );
};

export default SearchInput;
