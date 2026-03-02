import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type JobRecord, JobType, Material } from "../backend.d";
import { useActor } from "./useActor";

export type { JobRecord };
export { JobType, Material };

const LS_KEY = "karigar_records";

export interface LocalJobRecord extends JobRecord {
  assignTo?: string;
}

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
    return parsed.map(
      (
        r: LocalJobRecord & { id: string | bigint; createdAt: string | bigint },
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

export function useGetAllJobRecords() {
  const { actor, isFetching } = useActor();

  return useQuery<JobRecord[]>({
    queryKey: ["jobRecords"],
    queryFn: async () => {
      // Always load local records first — they are the source of truth
      const localRecords = loadLocalRecords();
      try {
        if (!actor) return localRecords;
        const backendRecords = await actor.getAllJobRecords();
        // Merge: for each backend record, keep local version if it has extra fields (assignTo)
        const merged: LocalJobRecord[] = backendRecords.map((br) => {
          const local = localRecords.find((lr) => lr.id === br.id);
          return local
            ? { ...br, assignTo: local.assignTo }
            : (br as LocalJobRecord);
        });
        // Also include any local-only records not yet synced to backend
        const backendIds = new Set(backendRecords.map((r) => r.id));
        const localOnly = localRecords.filter((lr) => !backendIds.has(lr.id));
        const finalRecords = [...localOnly, ...merged];
        saveLocalRecords(finalRecords);
        return finalRecords;
      } catch {
        return localRecords;
      }
    },
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
  };
}

function saveJobLocally(payload: CreateJobPayload): bigint {
  const records = loadLocalRecords();
  const newId = BigInt(Date.now());
  records.unshift(buildLocalRecord(payload, newId));
  saveLocalRecords(records);
  return newId;
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
        return { id: backendId, record };
      } catch {
        // Backend unavailable — local record already saved above
        return { id: localId, record: localRecord };
      }
    },
    onSuccess: ({ record }) => {
      // Immediately add the new record to the cache so it shows in the list
      // without waiting for a re-fetch that might overwrite it
      queryClient.setQueryData<LocalJobRecord[]>(["jobRecords"], (old) => {
        const existing = old ?? [];
        if (existing.find((r) => r.id === record.id)) return existing;
        return [record, ...existing];
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
      saveLocalRecords(records.filter((r) => r.id !== jobId));
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
        (old) => old?.filter((r) => r.id !== jobId) ?? [],
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
