import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';
import { FAQ, FAQCategory } from "../models/faq.model";

export const FAQs = new MongoObservable.Collection<FAQ>("faqs");
export const FAQCategories = new MongoObservable.Collection<FAQCategory>("faqcategories");
