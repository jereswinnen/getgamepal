import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { GAME_STATUS_OPTIONS, OWNERSHIP_TYPE_OPTIONS } from "@/lib/constants";
import { Game } from "@/types/game";

interface AddToLibrarySheetProps {
  game: Game;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: {
    platform: string;
    status: string;
    ownershipType: string;
  }) => void;
}

export default function AddToLibrarySheet({
  game,
  isOpen,
  onOpenChange,
  onConfirm,
}: AddToLibrarySheetProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("Not Started");
  const [selectedOwnership, setSelectedOwnership] =
    useState<string>("Not Owned");

  const handleConfirm = () => {
    onConfirm({
      platform: selectedPlatform,
      status: selectedStatus,
      ownershipType: selectedOwnership,
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add Game</SheetTitle>
          <SheetDescription>
            Configure how you want to add {game.name} to your library
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="platform" className="text-sm font-medium">
              Platform
            </label>
            <Select
              value={selectedPlatform}
              onValueChange={setSelectedPlatform}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a platform" />
              </SelectTrigger>
              <SelectContent>
                {game.platforms?.map((platform) => (
                  <SelectItem key={platform.id} value={platform.name}>
                    {platform.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label htmlFor="status" className="text-sm font-medium">
              Status
            </label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                {GAME_STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label htmlFor="ownership" className="text-sm font-medium">
              Ownership
            </label>
            <Select
              value={selectedOwnership}
              onValueChange={setSelectedOwnership}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select ownership type" />
              </SelectTrigger>
              <SelectContent>
                {OWNERSHIP_TYPE_OPTIONS.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter>
          <Button onClick={handleConfirm} disabled={!selectedPlatform}>
            Add Game
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
