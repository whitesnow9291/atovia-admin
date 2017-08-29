import { Meteor } from "meteor/meteor";
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import { check } from "meteor/check";
import { Emails } from "../../both/collections/emails.collection";
import { Email } from "../../both/models/email.model";
import { isValidEmail, isValidCode } from "../../both/validators";
import { isLoggedIn, userIsInRole } from "../imports/services/auth";
import * as _ from 'underscore';

interface Options {
  [key: string]: any;
}

Meteor.methods({
    /* insert new email template */
    "emails.insert": (emailData: Email) => {
        userIsInRole(["super-admin", "sub-admin"]);

        try {
            validateEmailData(emailData);
        } catch (err) {
            let errMesg = err.reason || `Invalid formData supplied.`;
            throw new Meteor.Error(403, errMesg);
        }
        let emailId = Emails.collection.insert(emailData);

        return emailId;
    },
    /* update email template */
    "emails.update": (emailId: string, emailData: Email) => {
        userIsInRole(["super-admin", "sub-admin"]);
        
        try {
            validateEmailData(emailData);
        } catch (err) {
            let errMesg = err.reason || `Invalid formData supplied.`;
            throw new Meteor.Error(403, errMesg);
        }
        return Emails.collection.update({_id: emailId}, {$set: emailData});
    },
    /* find email templates or search */
    "emails.find": (options: Options, criteria: any, searchString: string) => {
        isLoggedIn();

        let where:any = [];
        where.push({
            "$or": [{deleted: false}, {deleted: {$exists: false} }]
        });
        
        // match search string
        if (typeof searchString === 'string' && searchString.length) {
            // allow search on firstName, lastName
            where.push({"$or": [
                {"title": {$regex: `.*${searchString}.*`,$options : 'i'} },
                {"heading": {$regex: `.*${searchString}.*`,$options : 'i'} },
            ]} );
        }

        // restrict db fields to return
        _.extend(options, {
            //fields: {"emails.address": 1, "patient": 1, "createdAt": 1, "status": 1}
        });

        //console.log("where:", where);
        //console.log("options:", options);
        // execute find query
        let cursor = Emails.collection.find({$and: where}, options);
        return {count: cursor.count(), data: cursor.fetch()};
    },
    /* find single email template */
    "emails.findOne": (emailId: string) => {
        isLoggedIn();

        return Emails.collection.findOne({_id: emailId});
    },
    /* delete a email template */
    "emails.delete": (emailId: string) => {
        userIsInRole(["super-admin", "sub-admin"]);

        return Emails.collection.update({_id: emailId}, {$set: {
            deleted: true
        } });
    },
    /* activate email template */
    "emails.activate": (emailId: string) => {
        userIsInRole(["super-admin", "sub-admin"]);

        return Emails.collection.update({_id: emailId}, {$set: {
            active: true
        } });
    },
    /* deactivate email template */
    "emails.deactivate": (emailId: string) => {
        userIsInRole(["super-admin", "sub-admin"]);

        return Emails.collection.update({_id: emailId}, {$set: {
            active: false
        } });
    }
});

function validateEmailData(emailData: Email) {
    /* validate title */
    let titleLen = emailData.title.length;
    if (titleLen < 8 || titleLen > 255) {
        throw new Meteor.Error(403, `Invalid title supplied.`);
    }
    /* validate heading */
    let headingLen = emailData.heading.length;
    if (headingLen < 8 || headingLen > 255) {
        throw new Meteor.Error(403, `Invalid heading supplied.`);
    }
    /* validate summary */
    let summaryLen = emailData.summary.length;
    if (summaryLen < 8 || summaryLen > 255) {
        throw new Meteor.Error(403, `Invalid summary supplied.`);
    }
    /* validate contents */
    let contentsLen = emailData.contents.length;
    if (contentsLen < 8) {
        throw new Meteor.Error(403, `Invalid contents supplied.`);
    }
    /* validate code */
    let codeLen = emailData.code.length;
    if (codeLen < 8 || codeLen > 255) {
        throw new Meteor.Error(403, `Invalid code supplied.`);
    }
    if (! isValidCode(emailData.code) ) {
        throw new Meteor.Error(403, `Invalid code ${emailData.code}`);
    }
    /* validate sender-id */
    if (! isValidEmail(emailData.senderId)) {
        throw new Meteor.Error(403, `Invalid code ${emailData.code}`);
    }

    return true;
}