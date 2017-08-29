import { CollectionObject } from "./collection-object.model";

export interface Currency extends CollectionObject {
  from: string;
  to: string;
  value: number;
  createdAt: Date;
}
