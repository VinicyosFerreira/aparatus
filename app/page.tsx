import Image from "next/image";
import Header from "./_components/header";
import SearchInput from "./_components/search-input";
import banner from "../public/banner.png";

export default function Home() {
  return (
    <main>
      <Header />
      <div className="space-y-4 px-5">
        <SearchInput />
          <Image
            src={banner}
            sizes="100vw"
            alt="Agende agora"
            className= "w-full h-auto"
          />
      </div>
    </main>
  );
}
