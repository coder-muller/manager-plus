"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LayoutDashboard, LogOut, Menu, Moon, Settings, Sun, User, Users, CreditCard } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { toast } from "sonner";
export default function ProfileLayout({ children }: { children: React.ReactNode }) {

    const { theme, setTheme } = useTheme();
    const isMobile = useIsMobile();
    const pathname = usePathname();
    const [devEmail, setDevEmail] = useState<string>("");
    const [userEmail, setUserEmail] = useState<string>("");
    const [userName, setUserName] = useState<string>("");

    const routes = [
        {
            icon: <LayoutDashboard className="w-4 h-4" />,
            label: "Dashboard",
            href: "/profile/dashboard",
            tooltip: "Visualize de uma forma geral o que está acontecendo na sua empresa",
        },
        {
            icon: <Users className="w-4 h-4" />,
            label: "Membros",
            href: "/profile/members",
            tooltip: "Visualize e gerencie todos os membros da sua empresa",
        },
        {
            icon: <CreditCard className="w-4 h-4" />,
            label: "Pagamentos",
            href: "/profile/payments",
            tooltip: "Visualize e gerencie todos os pagamentos da sua empresa",
        },
    ]

    useEffect(() => {
        const email = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
        if (!email) {
            toast.error("Não foi possível encontrar o email do administrador. Por favor, contate o suporte.");
        }
        setDevEmail(email || "");
        setUserEmail("guilhermemullerxx@gmail.com");
        setUserName("Guilherme Müller");
    }, []);

    return (
        <div className="flex flex-col items-center w-screen h-screen overflow-y-auto">
            <div className="flex items-center justify-between w-full p-2 border-b absolute top-0 left-0 backdrop-blur-2xl z-10">
                {isMobile ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <Menu className="w-4 h-4" />
                                {routes.find((route) => route.href === pathname)?.label}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {routes.map((route) => (
                                <DropdownMenuItem key={route.href}>
                                    <Link href={route.href} className="flex items-center gap-2">
                                        {route.icon}
                                        {route.label}
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <div className="flex items-center gap-2">
                        {routes.map((route) => (
                            <Tooltip key={route.href} delayDuration={1000}>
                                <TooltipTrigger asChild>
                                    <Link href={route.href}>
                                        <Button variant="ghost" className="font-semibold flex items-center gap-2">
                                            {route.icon}
                                            {route.label}
                                        </Button>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{route.tooltip}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </div>
                )}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            <User className="w-4 h-4" />
                            {isMobile ? (
                                <span className="hidden">Guilherme Müller</span>
                            ) : (
                                <>
                                    <span>{userName}</span>
                                    {userEmail === devEmail && (
                                        <Badge variant="default">Dev</Badge>
                                    )}
                                </>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/profile/settings">
                                <Settings className="w-4 h-4" />
                                Configurações
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="border-t">
                            <LogOut className="w-4 h-4" />
                            Sair
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            {children}
        </div>
    );
}