import { CollectionObject } from "./collection-object.model";

export interface Subscriber extends CollectionObject {
    email: string;
    group: string;
    active?: boolean;
    deleted?: boolean;
    createdAt: Date;
    modifiedAt?: Date;
}
