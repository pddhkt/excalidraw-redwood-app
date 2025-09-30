"use client";

import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Badge } from "@/app/components/ui/badge";
import type { User } from "@/db";
import type { UserTier } from "@generated/prisma";

interface UserMenuProps {
  user: User;
}

const tierColors: Record<UserTier, string> = {
  GUEST: "bg-gray-500",
  REGISTERED: "bg-blue-500",
  PREMIUM: "bg-purple-500",
  TEAM: "bg-green-500",
};

export function UserMenu({ user }: UserMenuProps) {
  const userInitial = user.username.charAt(0).toUpperCase();

  const handleLogout = () => {
    window.location.href = "/logout";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer focus:outline-none">
        <Avatar>
          <AvatarFallback className="bg-primary text-primary-foreground">
            {userInitial}
          </AvatarFallback>
        </Avatar>
        <div className="hidden md:flex flex-col items-start">
          <span className="text-sm font-medium">{user.username}</span>
          <Badge className={`${tierColors[user.tier]} text-xs`}>
            {user.tier}
          </Badge>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user.username}</p>
            <p className="text-xs text-muted-foreground">
              Account tier: {user.tier}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}