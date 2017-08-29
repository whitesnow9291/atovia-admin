import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';
import { Email } from "../models/email.model";

export const Emails = new MongoObservable.Collection<Email>("emails");
