import { Features } from "@/components/features";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MouseIcon } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <main className=" flex flex-col justify-center px-6 md:px-20 flex-grow min-h-[90vh]">
        <h1 className=" text-6xl font-black pb-4">CertiSend</h1>
        <p className=" text-2xl font-medium pb-12">Automate the creation and sending of customized emails with certificates/images.</p>
        <Link href="/send" className={cn(buttonVariants({
          variant: "outline"
        }), " text-2xl py-8 px-6 font-semibold bg-transparent hover:bg-foreground hover:text-background")}>Try it out!</Link>
        <div className="h-full w-full justify-center items-center flex pt-24">
          <a href="#features" className={cn(buttonVariants({ variant: "default" }), "opacity-30 rounded-full animate-pulse cursor-pointer")}>Scroll for features
            <span>
              <MouseIcon size={20} />
            </span>
          </a>
        </div>
      </main>
      <Features />
    </>

  );
}
