import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';
import { Package } from "../models/package.model";

export const Packages = new MongoObservable.Collection<Package>("packages");
