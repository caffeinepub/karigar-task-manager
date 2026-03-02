import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays, Tag, User, Weight } from "lucide-react";
import { Material } from "../../hooks/useQueries";
import type { FormData } from "../JobForm";
import { FormCard, FormField, SectionHeading } from "./FormHelpers";

interface Props {
  data: FormData;
  errors: Partial<Record<keyof FormData, string>>;
  onChange: (patch: Partial<FormData>) => void;
}

export default function Step1JobDetails({ data, errors, onChange }: Props) {
  return (
    <FormCard>
      <SectionHeading
        icon={<Tag />}
        title="Job Details"
        subtitle="Enter the basic job information"
      />

      <div className="space-y-5">
        {/* Date */}
        <FormField label="Date" error={errors.date}>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="date"
              value={data.date}
              onChange={(e) => onChange({ date: e.target.value })}
              className={`pl-9 ${errors.date ? "border-destructive ring-destructive/20" : ""}`}
              aria-invalid={!!errors.date}
            />
          </div>
        </FormField>

        {/* Assign To */}
        <FormField label="Assign To" error={errors.assignTo}>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              value={data.assignTo}
              onChange={(e) => onChange({ assignTo: e.target.value })}
              placeholder="Karigar name or ID"
              className={`pl-9 ${errors.assignTo ? "border-destructive ring-destructive/20" : ""}`}
              aria-invalid={!!errors.assignTo}
            />
          </div>
        </FormField>

        {/* Bill No */}
        <FormField label="Bill No" error={errors.billNo}>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
              #
            </span>
            <Input
              value={data.billNo}
              onChange={(e) => onChange({ billNo: e.target.value })}
              placeholder="e.g. 2024-001"
              className={`pl-7 ${errors.billNo ? "border-destructive ring-destructive/20" : ""}`}
              aria-invalid={!!errors.billNo}
            />
          </div>
        </FormField>

        {/* Material */}
        <FormField label="Material">
          <Select
            value={data.material}
            onValueChange={(v) => onChange({ material: v as Material })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select material" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Material.gold}>
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: "oklch(0.75 0.148 65)" }}
                  />
                  Gold
                </div>
              </SelectItem>
              <SelectItem value={Material.silver}>
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: "oklch(0.75 0.02 240)" }}
                  />
                  Silver
                </div>
              </SelectItem>
              <SelectItem value={Material.other}>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-muted-foreground/50" />
                  Other
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <NewJobFields data={data} errors={errors} onChange={onChange} />
      </div>
    </FormCard>
  );
}

function NewJobFields({
  data,
  errors,
  onChange,
}: {
  data: FormData;
  errors: Partial<Record<keyof FormData, string>>;
  onChange: (patch: Partial<FormData>) => void;
}) {
  return (
    <>
      <FormField label="Item Name / Description" error={errors.itemName}>
        <div className="relative">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            value={data.itemName}
            onChange={(e) => onChange({ itemName: e.target.value })}
            placeholder="e.g. Necklace, Ring, Bangles..."
            className={`pl-9 ${errors.itemName ? "border-destructive ring-destructive/20" : ""}`}
            aria-invalid={!!errors.itemName}
          />
        </div>
      </FormField>

      <FormField
        label="Given Raw Material Weight"
        error={errors.givenMaterialWeight}
      >
        <div className="relative">
          <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="number"
            min="0"
            step="0.01"
            value={data.givenMaterialWeight}
            onChange={(e) => onChange({ givenMaterialWeight: e.target.value })}
            placeholder="0.00"
            className={`pl-9 pr-10 ${errors.givenMaterialWeight ? "border-destructive ring-destructive/20" : ""}`}
            aria-invalid={!!errors.givenMaterialWeight}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
            g
          </span>
        </div>
      </FormField>
    </>
  );
}
