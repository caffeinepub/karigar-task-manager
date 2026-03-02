import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Gem } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
  type CreateJobPayload,
  JobType,
  Material,
  useCreateJobRecord,
  useUpdateJobRecord,
} from "../hooks/useQueries";
import Step1JobDetails from "./form-steps/Step1JobDetails";
import Step2WorkDetails from "./form-steps/Step2WorkDetails";
import Step3Charges from "./form-steps/Step3Charges";
import SuccessSummary from "./form-steps/SuccessSummary";

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: FormData;
  recordId?: bigint;
}

export interface FormData {
  // Step 1
  date: string;
  assignTo: string;
  jobType: JobType;
  billNo: string;
  material: Material;
  // New only
  itemName: string;
  givenMaterialWeight: string;
  // Repair only
  workDescription: string;
  // Step 2 (New only)
  workReceivedDate: string;
  receivedItemWeight: string;
  returnScrapWeight: string;
  // Step 3 / Repair charges
  otherCharge: string;
  makingChargeCustomer: string;
  makingChargeKarigar: string;
  deliveryDate: string;
  status: "pending" | "delivered";
  remarks: string;
}

const initialFormData: FormData = {
  date: new Date().toISOString().split("T")[0],
  assignTo: "",
  jobType: JobType.new_,
  billNo: "",
  material: Material.gold,
  itemName: "",
  givenMaterialWeight: "",
  workDescription: "",
  workReceivedDate: new Date().toISOString().split("T")[0],
  receivedItemWeight: "",
  returnScrapWeight: "",
  otherCharge: "",
  makingChargeCustomer: "",
  makingChargeKarigar: "",
  deliveryDate: "",
  status: "pending",
  remarks: "",
};

type StepName = "Job Details" | "Work Details" | "Charges";
const ALL_STEPS: StepName[] = ["Job Details", "Work Details", "Charges"];

export default function JobForm({
  onSuccess,
  onCancel,
  initialData,
  recordId,
}: Props) {
  const isEditMode = recordId !== undefined;
  const [formData, setFormData] = useState<FormData>(
    initialData ?? initialFormData,
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [submittedId, setSubmittedId] = useState<bigint | null>(null);

  const createMutation = useCreateJobRecord();
  const updateMutation = useUpdateJobRecord();
  const steps = ALL_STEPS;
  const totalSteps = steps.length;
  const isLastStep = currentStep === totalSteps - 1;

  const update = useCallback((patch: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  }, []);

  function handleNext() {
    setDirection("forward");
    setCurrentStep((s) => s + 1);
  }

  function handleBack() {
    setDirection("backward");
    setCurrentStep((s) => s - 1);
  }

  function lossWeight(): number {
    const given = Number(formData.givenMaterialWeight) || 0;
    const received = Number(formData.receivedItemWeight) || 0;
    const scrap = Number(formData.returnScrapWeight) || 0;
    return Math.max(0, given - received - scrap);
  }

  async function handleSubmit() {
    const payload: CreateJobPayload = {
      date: formData.date,
      billNo: formData.billNo,
      material: formData.material,
      jobType: formData.jobType,
      assignTo: formData.assignTo || undefined,
      remarks: formData.remarks || undefined,
      deliveryDate: formData.deliveryDate || undefined,
      status: formData.status,
      makingChargeCustomer: formData.makingChargeCustomer
        ? Number(formData.makingChargeCustomer)
        : undefined,
      makingChargeKarigar: formData.makingChargeKarigar
        ? Number(formData.makingChargeKarigar)
        : undefined,
      itemName: formData.itemName,
      givenMaterialWeight: Number(formData.givenMaterialWeight),
      workReceivedDate: formData.workReceivedDate,
      receivedItemWeight: Number(formData.receivedItemWeight),
      returnScrapWeight: Number(formData.returnScrapWeight),
      lossWeight: lossWeight(),
      otherCharge: formData.otherCharge
        ? Number(formData.otherCharge)
        : undefined,
    };

    if (isEditMode && recordId !== undefined) {
      try {
        await updateMutation.mutateAsync({ id: recordId, ...payload });
        onSuccess();
      } catch (_err) {
        toast.error("Failed to update job record. Please try again.");
      }
      return;
    }

    try {
      const { id } = await createMutation.mutateAsync(payload);
      setSubmittedId(id);
    } catch (_err) {
      toast.error("Failed to save job record. Please try again.");
    }
  }

  // Success state
  if (submittedId !== null) {
    return (
      <SuccessSummary
        formData={formData}
        lossWeight={lossWeight()}
        onBackToList={onSuccess}
        onNewJob={() => {
          setFormData(initialFormData);
          setCurrentStep(0);
          setSubmittedId(null);
        }}
      />
    );
  }

  const variants = {
    enter: (dir: string) => ({
      opacity: 0,
      x: dir === "forward" ? 40 : -40,
    }),
    center: { opacity: 1, x: 0 },
    exit: (dir: string) => ({
      opacity: 0,
      x: dir === "forward" ? -40 : 40,
    }),
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0.5 z-40 bg-card/95 backdrop-blur-md border-b border-border shadow-warm">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="shrink-0 hover:bg-accent/50"
            aria-label="Back to records"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.72 0.148 60), oklch(0.62 0.14 50))",
              }}
            >
              <Gem className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1
                className="font-display text-lg font-bold leading-tight"
                style={{ color: "oklch(0.22 0.04 50)" }}
              >
                {isEditMode ? "Edit Job Record" : "New Job Record"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {isEditMode
                  ? "Update the job details below"
                  : "Fill in the job details below"}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Progress Stepper */}
        <Stepper steps={steps} currentStep={currentStep} />

        {/* Form Steps */}
        <div className="mt-8 relative overflow-hidden">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={currentStep}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              {currentStep === 0 && (
                <Step1JobDetails
                  data={formData}
                  errors={{}}
                  onChange={update}
                />
              )}
              {currentStep === 1 && (
                <Step2WorkDetails
                  data={formData}
                  errors={{}}
                  lossWeight={lossWeight()}
                  onChange={update}
                />
              )}
              {currentStep === 2 && (
                <Step3Charges data={formData} errors={{}} onChange={update} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={currentStep === 0 ? onCancel : handleBack}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            {currentStep === 0 ? "Cancel" : "Back"}
          </Button>

          {isLastStep ? (
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="gap-2 min-w-28 font-medium shadow-gold-sm"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.75 0.148 65), oklch(0.65 0.14 52))",
                color: "oklch(0.12 0.025 45)",
                border: "1px solid oklch(0.68 0.14 58)",
              }}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  {isEditMode ? "Updating..." : "Saving..."}
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {isEditMode ? "Update Job" : "Submit Job"}
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="gap-2 font-medium shadow-gold-sm"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.75 0.148 65), oklch(0.65 0.14 52))",
                color: "oklch(0.12 0.025 45)",
                border: "1px solid oklch(0.68 0.14 58)",
              }}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}

// ── Stepper component ──────────────────────────────────────────────────────────

interface StepperProps {
  steps: string[];
  currentStep: number;
}

function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-0">
        {steps.map((stepName, i) => {
          const isComplete = i < currentStep;
          const isActive = i === currentStep;
          const isLast = i === steps.length - 1;

          return (
            <div key={stepName} className="flex items-center">
              {/* Step circle */}
              <div className="flex flex-col items-center gap-1.5">
                <motion.div
                  className="relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                  animate={{
                    scale: isActive ? 1.1 : 1,
                  }}
                  style={{
                    background: isComplete
                      ? "linear-gradient(135deg, oklch(0.72 0.148 60), oklch(0.62 0.14 50))"
                      : isActive
                        ? "linear-gradient(135deg, oklch(0.75 0.148 65), oklch(0.65 0.14 52))"
                        : "oklch(var(--muted))",
                    color:
                      isComplete || isActive
                        ? "oklch(0.12 0.025 45)"
                        : "oklch(var(--muted-foreground))",
                    boxShadow: isActive
                      ? "0 0 0 3px oklch(0.72 0.148 60 / 0.3)"
                      : isComplete
                        ? "0 2px 8px oklch(0.72 0.148 60 / 0.3)"
                        : "none",
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {isComplete ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </motion.div>
                <span
                  className="text-xs font-medium whitespace-nowrap"
                  style={{
                    color: isActive
                      ? "oklch(0.62 0.14 50)"
                      : isComplete
                        ? "oklch(0.72 0.148 60)"
                        : "oklch(var(--muted-foreground))",
                  }}
                >
                  {stepName}
                </span>
              </div>

              {/* Connector */}
              {!isLast && (
                <div className="w-16 sm:w-24 h-0.5 mb-5 mx-2">
                  <div
                    className="h-full transition-all duration-500 rounded-full"
                    style={{
                      background: isComplete
                        ? "linear-gradient(to right, oklch(0.72 0.148 60), oklch(0.78 0.138 65))"
                        : "oklch(var(--border))",
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
