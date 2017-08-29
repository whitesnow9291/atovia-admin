import { Meteor } from "meteor/meteor";
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import { check } from "meteor/check";
import { FAQs, FAQCategories } from "../../both/collections/faqs.collection";
import { FAQ, FAQCategory } from "../../both/models/faq.model";
import { isValidFirstName, isValidSlug } from "../../both/validators";
import { isLoggedIn, userIsInRole } from "../imports/services/auth";

interface Options {
    [key: string]: any;
}

Meteor.methods({
    /* FAQs */
    /* insert new faq */
    "faqs.insert": (formData: FAQ) => {
        userIsInRole(["super-admin", "sub-admin"]);

        try {
            validateFAQData(formData);
        } catch (err) {
            let errMesg = err.reason || `Invalid formData supplied.`;
            throw new Meteor.Error(403, errMesg);
        }
        
        let insertedID = FAQs.collection.insert(formData);

        return insertedID;
    },
    /* update faq */
    "faqs.update": (quesId:string, formData: FAQ) => {
        userIsInRole(["super-admin", "sub-admin"]);

        try {
            validateFAQData(formData);
        } catch (err) {
            let errMesg = err.reason || `Invalid formData supplied.`;
            throw new Meteor.Error(403, errMesg);
        }
        
        return FAQs.collection.update({_id: quesId}, {$set: formData});
    },
    /* find faqs or search */
    "faqs.find": (options: Options, criteria: any, searchString: string) => {
        let where: any = [];
        where.push({
            "$or": [{ deleted: false }, { deleted: { $exists: false } }]
        });

        if (typeof searchString === 'string' && searchString.length) {
            where.push({
                "$or": [
                    { "question": { $regex: `.*${searchString}.*`, $options: 'i' } },
                    { "answer": { $regex: `.*${searchString}.*`, $options: 'i' } },
                ]
            });
        }

        let cursor = FAQs.collection.find({ $and: where }, options);
        return { count: cursor.count(), data: cursor.fetch() };
    },
    /* find single faq */
    "faqs.findOne": (quesId: string) => {
        return FAQs.collection.findOne({ _id: quesId });
    },
    /* delete faq */
    "faqs.delete": (faqId: string) => {
        userIsInRole(["super-admin", "sub-admin"]);

        return FAQs.collection.update({_id: faqId}, {$set: {
            deleted: true
        } });
    },
    /* activate faq */
    "faqs.activate": (faqId: string) => {
        userIsInRole(["super-admin", "sub-admin"]);

        return FAQs.collection.update({_id: faqId}, {$set: {
            active: true
        } });
    },
    /* deactivate faq */
    "faqs.deactivate": (faqId: string) => {
        userIsInRole(["super-admin", "sub-admin"]);

        return FAQs.collection.update({_id: faqId}, {$set: {
            active: false
        } });
    },

    /* FAQ Categories */ 
    /* insert new faq category */
    "faqcategories.insert": (faqcategoryData: FAQCategory) => {
        userIsInRole(["super-admin", "sub-admin"]);

        try {
            validateFAQCategoryData(faqcategoryData);
        } catch (err) {
            let errMesg = err.reason || `Invalid formData supplied.`;
            throw new Meteor.Error(403, errMesg);
        }
        
        let faqcategoryId = FAQCategories.collection.insert(faqcategoryData);

        return faqcategoryId;
    },
    /* update faq category */
    "faqcategories.update": (faqcategoryId: string, faqcategoryData: FAQCategory) => {
        userIsInRole(["super-admin", "sub-admin"]);

        try {
            validateFAQCategoryData(faqcategoryData);
        } catch (err) {
            let errMesg = err.reason || `Invalid formData supplied.`;
            throw new Meteor.Error(403, errMesg);
        }
        return FAQCategories.collection.update({ _id: faqcategoryId }, { $set: faqcategoryData });
    },
    /* find faq categories or search */
    "faqcategories.find": (options: Options, criteria: any, searchString: string) => {
        let where: any = [];
        where.push({
            "$or": [{ deleted: false }, { deleted: { $exists: false } }]
        });

        if (typeof searchString === 'string' && searchString.length) {
            where.push({
                "$or": [
                    { "title": { $regex: `.*${searchString}.*`, $options: 'i' } },
                    { "summary": { $regex: `.*${searchString}.*`, $options: 'i' } },
                ]
            });
        }

        let cursor = FAQCategories.collection.find({ $and: where }, options);
        return { count: cursor.count(), data: cursor.fetch() };
    },
    /* find single faq category */
    "faqcategories.findOne": (faqcategoryId: string) => {
        return FAQCategories.collection.findOne({ _id: faqcategoryId });
    },
    /* delete faq category */
    "faqcategories.delete": (faqcategoryId: string) => {
        userIsInRole(["super-admin", "sub-admin"]);

        return FAQCategories.collection.update({_id: faqcategoryId}, {$set: {
            deleted: true
        } });
    },
    /* activate faq category */
    "faqcategories.activate": (faqcategoryId: string) => {
        userIsInRole(["super-admin", "sub-admin"]);

        return FAQCategories.collection.update({_id: faqcategoryId}, {$set: {
            active: true
        } });
    },
    /* deactivate faq category */
    "faqcategories.deactivate": (faqcategoryId: string) => {
        userIsInRole(["super-admin", "sub-admin"]);

        return FAQCategories.collection.update({_id: faqcategoryId}, {$set: {
            active: false
        } });
    }
});

function validateFAQData(item: FAQ) {
    /* validate question */
    let quesLen = item.question.length;
    if (quesLen < 5 || quesLen > 255) {
        throw new Meteor.Error(403, `Invalid question supplied.`);
    }

    /* validate summary */
    /*let answerLen = item.answer.length;
    if (answerLen < 8 || answerLen > 255) {
        throw new Meteor.Error(403, `Invalid answer supplied.`);
    }*/

    return true;
}

function validateFAQCategoryData(item: FAQCategory) {
    /* validate title */
    let titleLen = item.title.length;
    if (titleLen < 5 || titleLen > 255) {
        throw new Meteor.Error(403, `Invalid title supplied.`);
    }

    /* validate summary */
    let summaryLen = item.summary.length;
    if (summaryLen < 8 || summaryLen > 255) {
        throw new Meteor.Error(403, `Invalid summary supplied.`);
    }

    return true;
}