import { CollectionObject } from "./collection-object.model";

export interface Package extends CollectionObject {
    title: string;
    code: string;
    summary: string;
    maxDevices: number;
    maxPatients: number;
    pricePerPatient: number;
    pricePerDevice: number;
    durationInMonths: number;
    durationInDays: number;
    active: boolean;
    deleted: boolean;
    createdAt: Date;
    modifiedAt: Date;
}
