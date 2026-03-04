/**
 * useSentinel.ts
 *
 * Shared utility for storing arbitrary JSON data in the backend canister
 * using special "sentinel" job records. This lets data like employees, stock,
 * and expenses sync across devices via the canister instead of being stuck in
 * per-device localStorage.
 *
 * Sentinel records use a special billNo prefix (__KEY__) so they can be
 * identified and filtered out of the real job records list.
 */

import type { backendInterface } from "../backend.d";
import { JobType, Material } from "../backend.d";

export const SENTINEL_EMPLOYEES = "__EMPLOYEES_DATA__";
export const SENTINEL_STOCK = "__STOCK_DATA__";
export const SENTINEL_EXPENSES = "__EXPENSES_DATA__";
export const SENTINEL_JOB_EXTRAS = "__JOB_EXTRAS__";
export const SENTINEL_EXCHANGE_SCRAP = "__EXCHANGE_SCRAP_DATA__";

export function isSentinelRecord(billNo: string): boolean {
  return billNo.startsWith("__") && billNo.endsWith("__");
}

/**
 * Read a sentinel record's JSON payload from the backend.
 * Returns null if not found or on error.
 */
export async function readSentinel<T>(
  actor: backendInterface,
  key: string,
): Promise<T | null> {
  try {
    const all = await actor.getAllJobRecords();
    const sentinel = all.find((r) => r.billNo === key);
    if (!sentinel) return null;
    const raw = sentinel.workDescription;
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Write a sentinel record to the backend.
 * Deletes any existing sentinel with the same key first, then creates a new one.
 * Fire-and-forget: errors are caught and ignored so the UI is never blocked.
 */
export async function writeSentinel<T>(
  actor: backendInterface,
  key: string,
  data: T,
): Promise<void> {
  try {
    // Find and delete existing sentinel
    const all = await actor.getAllJobRecords();
    const existing = all.find((r) => r.billNo === key);
    if (existing) {
      await actor.deleteJobRecord(existing.id);
    }

    // Create new sentinel record
    const json = JSON.stringify(data);
    await actor.createJobRecord(
      "1970-01-01", // placeholder date
      key, // billNo = sentinel key
      Material.gold, // placeholder material
      JobType.new_, // placeholder job type
      null, // itemName
      null, // givenMaterialWeight
      null, // workReceivedDate
      null, // receivedItemWeight
      null, // returnScrapWeight
      null, // lossWeight
      null, // otherCharge
      null, // makingChargeCustomer
      null, // makingChargeKarigar
      json, // workDescription — stores the JSON payload
      null, // remarks
    );
  } catch {
    // Backend unavailable — localStorage cache still works
  }
}
