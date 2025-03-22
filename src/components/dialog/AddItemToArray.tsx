import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CirclePlus } from "lucide-react";

type AddItemToArrayProps = {
  title: string;
  array: string[];
};

const AddItemToArray = ({ title, array }: AddItemToArrayProps) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  console.log(array);

  const handleAddItem = () => {
    if (inputValue.trim().length < 2) {
      toast.error("Item must be at least 2 characters.");
      return;
    }
    if (array.includes(inputValue.trim())) {
      toast.error("Item already exists in the list.");
      return;
    }
    array.push(inputValue.trim());
    setOpen(false);
    setInputValue("");
    toast.success("Item Added");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"default"} size={"icon"}>
          <CirclePlus />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Enter the item you want to add to the list.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Enter item"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Button onClick={handleAddItem} className="w-full">
            Add Item
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemToArray;
