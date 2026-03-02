import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type JobId = bigint;
export type Time = bigint;
export interface JobRecord {
    id: JobId;
    lossWeight?: number;
    jobType: JobType;
    date: string;
    createdAt: Time;
    workReceivedDate?: string;
    workDescription?: string;
    makingChargeKarigar?: number;
    itemName?: string;
    makingChargeCustomer?: number;
    otherCharge?: number;
    givenMaterialWeight?: number;
    receivedItemWeight?: number;
    returnScrapWeight?: number;
    remarks?: string;
    billNo: string;
    material: Material;
}
export enum JobType {
    new_ = "new",
    repair = "repair"
}
export enum Material {
    other = "other",
    gold = "gold",
    silver = "silver"
}
export interface backendInterface {
    createJobRecord(date: string, billNo: string, material: Material, jobType: JobType, itemName: string | null, givenMaterialWeight: number | null, workReceivedDate: string | null, receivedItemWeight: number | null, returnScrapWeight: number | null, lossWeight: number | null, otherCharge: number | null, makingChargeCustomer: number | null, makingChargeKarigar: number | null, workDescription: string | null, remarks: string | null): Promise<JobId>;
    deleteJobRecord(jobId: JobId): Promise<void>;
    getAllJobRecords(): Promise<Array<JobRecord>>;
    getJobRecord(jobId: JobId): Promise<JobRecord>;
}
