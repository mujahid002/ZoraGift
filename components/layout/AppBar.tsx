"use client";
import { Menubar, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
import AccountMenu from "@/components/account/AccountMenu";
import { Logo } from "@/components/layout/logo";

export default function AppBar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-10 bg-white border-b h-20 flex items-center">
      <Menubar className="w-full rounded-none border-none px-6 lg:px-8">
        <MenubarMenu>
          <MenubarTrigger>
            <Logo />
          </MenubarTrigger>
        </MenubarMenu>
        <div className="grow" />
        <section className="mr-6">
          <AccountMenu /> {/* Increase account menu size */}
        </section>
      </Menubar>
    </div>
  );
}
