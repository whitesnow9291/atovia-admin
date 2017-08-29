import { Meteor } from "meteor/meteor";
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import { check } from "meteor/check";
import { Pages } from "../../both/collections/pages.collection";
import { Page } from "../../both/models/page.model";
import { isValidSlug } from "../../both/validators";
import { isLoggedIn, userIsInRole } from "../imports/services/auth";
import * as _ from 'underscore';

interface Options {
  [key: string]: any;
}

Meteor.methods({
    "pages.insert": (pageData: Page) => {
        userIsInRole(["super-admin", "sub-admin"]);

        try {
            validatePageData(pageData);
        } catch (err) {
            let errMesg = err.reason || `Invalid formData supplied.`;
            throw new Meteor.Error(403, errMesg);
        }
        let pageId = Pages.collection.insert(pageData);

        return pageId;
    },
    "pages.update": (pageId: string, pageData: Page) => {
        userIsInRole(["super-admin", "sub-admin"]);
        
        try {
            validatePageData(pageData);
        } catch (err) {
            let errMesg = err.reason || `Invalid formData supplied.`;
            throw new Meteor.Error(403, errMesg);
        }
        return Pages.collection.update({_id: pageId}, {$set: pageData});
    },
    "pages.find": (options: Options, criteria: any, searchString: string) => {
        let where:any = [];
        
        // exclude deleted items
        where.push({
            "$or": [{deleted: false}, {deleted: {$exists: false} }]
        });

        // merge criteria to where
        if (! _.isEmpty(criteria)) {
            where.push(criteria);
        }
        
        // match search string
        if (typeof searchString === 'string' && searchString.length) {
            // allow search on firstName, lastName
            where.push({"$or": [
                {"title": {$regex: `.*${searchString}.*`,$options : 'i'} },
                {"heading": {$regex: `.*${searchString}.*`,$options : 'i'} },
                {"slug": {$regex: `.*${searchString}.*`,$options : 'i'} }
            ]} );
        }

        // restrict db fields to return
        _.extend(options, {
            //fields: {"emails.address": 1, "patient": 1, "createdAt": 1, "status": 1}
        });

        //console.log("where:", where);
        //console.log("options:", options);
        // execute find query
        let cursor = Pages.collection.find({$and: where}, options);
        return {count: cursor.count(), data: cursor.fetch()};
    },
    "pages.findOne": (pageId: string) => {
        return Pages.collection.findOne({_id: pageId});
    },
    "pages.delete": (pageId: string) => {
        userIsInRole(["super-admin", "sub-admin"]);
        
        return Pages.collection.update({_id: pageId}, {$set: {
            deleted: true
        } });
    },
    "pages.activate": (pageId: string) => {
        userIsInRole(["super-admin", "sub-admin"]);

        return Pages.collection.update({_id: pageId}, {$set: {
            active: true
        } });
    },
    "pages.deactivate": (pageId: string) => {
        userIsInRole(["super-admin", "sub-admin"]);

        return Pages.collection.update({_id: pageId}, {$set: {
            active: false
        } });
    }
});

function validatePageData(pageData: Page) {
    /* validate title */
    let titleLen = pageData.title.length;
    if (titleLen < 5 || titleLen > 255) {
        throw new Meteor.Error(403, `Invalid title supplied.`);
    }
    /* validate heading */
    let headingLen = pageData.heading.length;
    if (headingLen < 5 || headingLen > 255) {
        throw new Meteor.Error(403, `Invalid heading supplied.`);
    }
    /* validate summary */
    let summaryLen = pageData.summary.length;
    if (summaryLen < 8 || summaryLen > 255) {
        throw new Meteor.Error(403, `Invalid summary supplied.`);
    }
    /* validate contents */
    let contentsLen = pageData.contents.length;
    if (contentsLen < 8) {
        throw new Meteor.Error(403, `Invalid contents supplied.`);
    }
    /* validate slug */
    let slugLen = pageData.slug.length;
    if (slugLen < 5 || slugLen > 255) {
        throw new Meteor.Error(403, `Invalid slug supplied.`);
    }
    if (! isValidSlug(pageData.slug) ) {
        throw new Meteor.Error(403, `Invalid slug ${pageData.slug}`);
    }

    return true;
}