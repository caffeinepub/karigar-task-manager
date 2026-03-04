import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type JobRecord, JobType, Material } from "../backend.d";
import { useActor } from "./useActor";
import {
  SENTINEL_JOB_EXTRAS,
  isSentinelRecord,
  readSentinel,
  writeSentinel,
} from "./useSentinel";

export type { JobRecord };
export { JobType, Material };

const LS_KEY = "karigar_records";
const LS_EXTRAS_KEY = "karigar_job_extras";

export interface LocalJobRecord extends JobRecord {
  assignTo?: string;
  deliveryDate?: string;
  status?: "pending" | "delivered";
}

// Map of jobId (string) -> extras
type JobExtrasMap = Record<
  string,
  { assignTo?: string; deliveryDate?: string; status?: "pending" | "delivered" }
>;

function serializeBigInt(_key: string, value: unknown): unknown {
  return typeof value === "bigint" ? value.toString() : value;
}

function saveLocalRecords(records: LocalJobRecord[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(records, serializeBigInt));
  } catch {
    // ignore
  }
}

function loadLocalRecords(): LocalJobRecord[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed
      .filter(
        (r: LocalJobRecord & { billNo: string }) => !isSentinelRecord(r.billNo),
      )
      .map(
        (
          r: LocalJobRecord & {
            id: string | bigint;
            createdAt: string | bigint;
          },
        ) => ({
          ...r,
          id: BigInt(r.id),
          createdAt: BigInt(r.createdAt),
        }),
      );
  } catch {
    return [];
  }
}

function sameId(a: bigint | unknown, b: bigint | unknown): boolean {
  try {
    return BigInt(String(a)) === BigInt(String(b));
  } catch {
    return a === b;
  }
}

// ---- Job extras (cross-device sync for assignTo / deliveryDate / status) ----

function loadLocalExtras(): JobExtrasMap {
  try {
    const raw = localStorage.getItem(LS_EXTRAS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as JobExtrasMap;
  } catch {
    return {};
  }
}

function saveLocalExtras(map: JobExtrasMap): void {
  try {
    localStorage.setItem(LS_EXTRAS_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

function mergeExtras(
  records: LocalJobRecord[],
  extras: JobExtrasMap,
): LocalJobRecord[] {
  return records.map((r) => {
    const key = r.id.toString();
    const ex = extras[key];
    if (!ex) return r;
    return {
      ...r,
      assignTo: ex.assignTo ?? r.assignTo,
      deliveryDate: ex.deliveryDate ?? r.deliveryDate,
      status: ex.status ?? r.status,
    };
  });
}

// ---- Queries ----

export function useGetAllJobRecords() {
  const { actor, isFetching } = useActor();

  return useQuery<JobRecord[]>({
    queryKey: ["jobRecords"],
    queryFn: async () => {
      // Local storage is always the source of truth for immediate load
      const localRecords = loadLocalRecords();
      const localExtras = loadLocalExtras();

      if (!actor) return mergeExtras(localRecords, localExtras);

      try {
        const backendRecords = await actor.getAllJobRecords();

        // Filter out sentinel records from backend results
        const realBackendRecords = backendRecords.filter(
          (br) => !isSentinelRecord(br.billNo),
        );

        // Normalise backend IDs to BigInt
        const normalised: LocalJobRecord[] = realBackendRecords.map((br) => ({
          ...(br as LocalJobRecord),
          id: BigInt(String(br.id)),
          createdAt: BigInt(String((br as LocalJobRecord).createdAt ?? 0)),
        }));

        // Fetch extras sentinel from backend (cross-device assignTo/deliveryDate/status)
        let backendExtras: JobExtrasMap = {};
        const extrasData = await readSentinel<JobExtrasMap>(
          actor,
          SENTINEL_JOB_EXTRAS,
        );
        if (extrasData && typeof extrasData === "object") {
          backendExtras = extrasData;
        }

        // Merge extras: backend extras win (cross-device source of truth)
        const mergedExtras: JobExtrasMap = { ...localExtras, ...backendExtras };
        saveLocalExtras(mergedExtras);

        // For each backend record, prefer the local version for extras
        const merged: LocalJobRecord[] = normalised.map((br) => {
          const local = localRecords.find((lr) => sameId(lr.id, br.id));
          const base = local ? { ...br, ...local, id: br.id } : br;
          return base;
        });

        // Include local-only records (saved when backend was unreachable)
        const localOnly = localRecords.filter(
          (lr) => !normalised.some((br) => sameId(br.id, lr.id)),
        );

        const finalRecords = [...localOnly, ...merged];

        // Apply merged extras
        const withExtras = mergeExtras(finalRecords, mergedExtras);

        // Only update localStorage if we got a non-empty response from backend
        if (finalRecords.length >= localRecords.length) {
          saveLocalRecords(withExtras);
        }
        return finalRecords.length >= localRecords.length
          ? withExtras
          : mergeExtras(localRecords, mergedExtras);
      } catch {
        // Backend unreachable — return what we have locally with local extras
        return mergeExtras(localRecords, localExtras);
      }
    },
    // Always start with localStorage data immediately, don't wait for actor
    initialData: () => mergeExtras(loadLocalRecords(), loadLocalExtras()),
    initialDataUpdatedAt: 0, // treat as stale so it re-fetches when actor is ready
    enabled: !isFetching,
    staleTime: 30_000,
  });
}

export interface CreateJobPayload {
  date: string;
  billNo: string;
  material: Material;
  jobType: JobType;
  assignTo?: string;
  itemName?: string;
  givenMaterialWeight?: number;
  workReceivedDate?: string;
  receivedItemWeight?: number;
  returnScrapWeight?: number;
  lossWeight?: number;
  otherCharge?: number;
  makingChargeCustomer?: number;
  makingChargeKarigar?: number;
  workDescription?: string;
  remarks?: string;
  deliveryDate?: string;
  status?: "pending" | "delivered";
}

function buildLocalRecord(
  payload: CreateJobPayload,
  id: bigint,
): LocalJobRecord {
  return {
    id,
    createdAt: BigInt(Date.now()),
    date: payload.date,
    billNo: payload.billNo,
    material: payload.material,
    jobType: payload.jobType,
    assignTo: payload.assignTo,
    itemName: payload.itemName,
    givenMaterialWeight: payload.givenMaterialWeight,
    workReceivedDate: payload.workReceivedDate,
    receivedItemWeight: payload.receivedItemWeight,
    returnScrapWeight: payload.returnScrapWeight,
    lossWeight: payload.lossWeight,
    otherCharge: payload.otherCharge,
    makingChargeCustomer: payload.makingChargeCustomer,
    makingChargeKarigar: payload.makingChargeKarigar,
    workDescription: payload.workDescription,
    remarks: payload.remarks,
    deliveryDate: payload.deliveryDate,
    status: payload.status ?? "pending",
  };
}

function saveJobLocally(payload: CreateJobPayload): bigint {
  const records = loadLocalRecords();
  const newId = BigInt(Date.now());
  records.unshift(buildLocalRecord(payload, newId));
  saveLocalRecords(records);
  return newId;
}

function saveExtrasForJob(
  id: bigint,
  payload: Pick<CreateJobPayload, "assignTo" | "deliveryDate" | "status">,
): void {
  const extras = loadLocalExtras();
  extras[id.toString()] = {
    assignTo: payload.assignTo,
    deliveryDate: payload.deliveryDate,
    status: payload.status ?? "pending",
  };
  saveLocalExtras(extras);
}

function removeExtrasForJob(id: bigint): void {
  const extras = loadLocalExtras();
  delete extras[id.toString()];
  saveLocalExtras(extras);
}

export function useCreateJobRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: CreateJobPayload,
    ): Promise<{ id: bigint; record: LocalJobRecord }> => {
      // Always save locally first so data is never lost
      const localId = saveJobLocally(payload);
      const localRecord = buildLocalRecord(payload, localId);
      saveExtrasForJob(localId, payload);

      try {
        if (!actor) {
          return { id: localId, record: localRecord };
        }
        const backendId = await actor.createJobRecord(
          payload.date,
          payload.billNo,
          payload.material,
          payload.jobType,
          payload.itemName ?? null,
          payload.givenMaterialWeight ?? null,
          payload.workReceivedDate ?? null,
          payload.receivedItemWeight ?? null,
          payload.returnScrapWeight ?? null,
          payload.lossWeight ?? null,
          payload.otherCharge ?? null,
          payload.makingChargeCustomer ?? null,
          payload.makingChargeKarigar ?? null,
          payload.workDescription ?? null,
          payload.remarks ?? null,
        );
        // Replace temp local record with backend-assigned id
        const record = buildLocalRecord(payload, backendId);
        const records = loadLocalRecords();
        const updated = records.filter((r) => r.id !== localId);
        updated.unshift(record);
        saveLocalRecords(updated);

        // Update extras with the real backend id
        removeExtrasForJob(localId);
        saveExtrasForJob(backendId, payload);

        // Sync extras to backend sentinel (fire-and-forget)
        const allExtras = loadLocalExtras();
        writeSentinel(actor, SENTINEL_JOB_EXTRAS, allExtras);

        return { id: backendId, record };
      } catch {
        // Backend unavailable — local record already saved above
        return { id: localId, record: localRecord };
      }
    },
    onSuccess: ({ record }) => {
      // Immediately add the new record to the cache so it shows in the list
      queryClient.setQueryData<LocalJobRecord[]>(["jobRecords"], (old) => {
        const existing = old ?? [];
        if (existing.find((r) => sameId(r.id, record.id))) return existing;
        return [record, ...existing];
      });
      // Invalidate so the next background fetch picks up any backend changes
      queryClient.invalidateQueries({
        queryKey: ["jobRecords"],
        refetchType: "none",
      });
    },
  });
}

export interface UpdateJobPayload extends Partial<CreateJobPayload> {
  id: bigint;
}

function updateJobLocally(
  id: bigint,
  patch: Partial<CreateJobPayload>,
): LocalJobRecord {
  const records = loadLocalRecords();
  const idx = records.findIndex((r) => sameId(r.id, id));
  if (idx === -1) throw new Error("Record not found");

  const existing = records[idx];
  const merged: LocalJobRecord = {
    ...existing,
    ...patch,
    id: existing.id,
    createdAt: existing.createdAt,
  };

  // Recalculate lossWeight if weight fields changed
  const given =
    merged.givenMaterialWeight !== undefined
      ? Number(merged.givenMaterialWeight)
      : 0;
  const received =
    merged.receivedItemWeight !== undefined
      ? Number(merged.receivedItemWeight)
      : 0;
  const scrap =
    merged.returnScrapWeight !== undefined
      ? Number(merged.returnScrapWeight)
      : 0;
  merged.lossWeight = Math.max(0, given - received - scrap);

  records[idx] = merged;
  saveLocalRecords(records);
  return merged;
}

export function useUpdateJobRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...patch
    }: UpdateJobPayload): Promise<LocalJobRecord> => {
      const updated = updateJobLocally(id, patch);

      // Update extras locally
      saveExtrasForJob(id, {
        assignTo: patch.assignTo ?? updated.assignTo,
        deliveryDate: patch.deliveryDate ?? updated.deliveryDate,
        status: patch.status ?? updated.status,
      });

      // Best-effort backend sync for extras
      if (actor) {
        const allExtras = loadLocalExtras();
        writeSentinel(actor, SENTINEL_JOB_EXTRAS, allExtras);

        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const backendActor = actor as any;
          if (typeof backendActor.updateJobRecord === "function") {
            await backendActor.updateJobRecord(id, patch);
          }
        } catch {
          // Backend update failed — local already updated
        }
      }
      return updated;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<LocalJobRecord[]>(["jobRecords"], (old) => {
        if (!old) return [updated];
        return old.map((r) => (sameId(r.id, updated.id) ? updated : r));
      });
      queryClient.invalidateQueries({
        queryKey: ["jobRecords"],
        refetchType: "none",
      });
    },
  });
}

export function useDeleteJobRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: bigint) => {
      // Always remove from localStorage first so it doesn't reappear on refresh
      const records = loadLocalRecords();
      saveLocalRecords(records.filter((r) => !sameId(r.id, jobId)));

      // Remove extras for this job
      removeExtrasForJob(jobId);

      // Sync updated extras to backend sentinel (fire-and-forget)
      if (actor) {
        const allExtras = loadLocalExtras();
        writeSentinel(actor, SENTINEL_JOB_EXTRAS, allExtras);
      }

      // Attempt backend delete if actor is available (best-effort)
      if (actor) {
        try {
          await actor.deleteJobRecord(jobId);
        } catch {
          // Ignore backend errors — local delete already done
        }
      }
    },
    onMutate: async (jobId) => {
      await queryClient.cancelQueries({ queryKey: ["jobRecords"] });
      const prev = queryClient.getQueryData<JobRecord[]>(["jobRecords"]);
      queryClient.setQueryData<JobRecord[]>(
        ["jobRecords"],
        (old) => old?.filter((r) => !sameId(r.id, jobId)) ?? [],
      );
      return { prev };
    },
    onError: (_err, _jobId, context) => {
      if (context?.prev) {
        queryClient.setQueryData(["jobRecords"], context.prev);
      }
    },
  });
}
