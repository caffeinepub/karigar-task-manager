import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Phone, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useEmployees } from "../hooks/useEmployees";
import { FormField } from "./form-steps/FormHelpers";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EmployeeForm({ open, onOpenChange }: Props) {
  const { addEmployee } = useEmployees();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  function handleSave() {
    addEmployee(name, phone);
    toast.success("Employee added successfully");
    setName("");
    setPhone("");
    onOpenChange(false);
  }

  function handleCancel() {
    setName("");
    setPhone("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.72 0.148 60), oklch(0.62 0.14 50))",
              }}
            >
              <UserPlus className="w-4 h-4 text-primary-foreground" />
            </div>
            Add Employee
          </DialogTitle>
          <DialogDescription>
            Add a karigar or employee to assign jobs to them.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <FormField label="Name">
            <div className="relative">
              <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Employee name"
                className="pl-9"
              />
            </div>
          </FormField>

          <FormField label="Phone Number">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                className="pl-9"
              />
            </div>
          </FormField>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="gap-2"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.75 0.148 65), oklch(0.65 0.14 52))",
              color: "oklch(0.12 0.025 45)",
              border: "1px solid oklch(0.68 0.14 58)",
            }}
          >
            <UserPlus className="w-4 h-4" />
            Save Employee
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
