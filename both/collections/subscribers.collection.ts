import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';
import { Subscriber } from "../models/subscriber.model";

export const Subscribers = new MongoObservable.Collection<Subscriber>("subscriber");
