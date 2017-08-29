import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';
import { Currency } from "../models/currency.model";

export const Currencies = new MongoObservable.Collection<Currency>("currencies");
