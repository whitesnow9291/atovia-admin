import { Meteor } from "meteor/meteor";
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import { check } from "meteor/check";
import { Packages } from "../../both/collections/packages.collection";
import { Package } from "../../both/models/package.model";
import { isValidFirstName, isValidSlug } from "../../both/validators";
import { isLoggedIn, userIsInRole } from "../imports/services/auth";
import * as _ from 'underscore';

interface Options {
    [key: string]: any;
}

Meteor.methods({
    /* insert a new package */
    "packages.insert": (packageData: Package) => {
        userIsInRole(["super-admin"]);

        try {
            validatePackageData(packageData);
        } catch (err) {
            let errMesg = err.reason || `Invalid formData supplied.`;
            throw new Meteor.Error(403, errMesg);
        }

        let packageId = Packages.collection.insert(packageData);

        return packageId;
    },
    /* update a package */
    "packages.update": (packageId: string, packageData: Package) => {
        userIsInRole(["super-admin"]);
        
        try {
            validatePackageData(packageData);
        } catch (err) {
            let errMesg = err.reason || `Invalid formData supplied.`;
            throw new Meteor.Error(403, errMesg);
        }
        return Packages.collection.update({ _id: packageId }, { $set: packageData });
    },
    /* find packages or search packages */
    "packages.find": (options: Options, criteria: any, searchString: string) => {
        isLoggedIn();

        let where: any = [];
        
        // exclude deleted items
        where.push({
            "$or": [{ deleted: false }, { deleted: { $exists: false } }]
        });

        // merge criteria to where
        if (! _.isEmpty(criteria)) {
            where.push(criteria);
        }

        // match search string
        if (typeof searchString === 'string' && searchString.length) {
            where.push({
                "$or": [
                    { "title": { $regex: `.*${searchString}.*`, $options: 'i' } },
                    { "heading": { $regex: `.*${searchString}.*`, $options: 'i' } },
                ]
            });
        }

        let cursor = Packages.collection.find({ $and: where }, options);
        return { count: cursor.count(), data: cursor.fetch() };
    },
    /* get packages count */
    "packages.count": (criteria: any, searchString: string) : number => {
        isLoggedIn();

        let where: any = [];
        where.push({
            "$or": [{ deleted: false }, { deleted: { $exists: false } }]
        });
        if (!_.isEmpty(criteria)) {
            where.push(criteria);
        }
        if (typeof searchString === 'string' && searchString.length) {
            where.push({
                "$or": [
                    { "title": { $regex: `.*${searchString}.*` } },
                    { "heading": { $regex: `.*${searchString}.*` } },

                ]

            });
        }

        return Packages.collection.find({ $and: where }).count();
    },
    /* find single package */
    "packages.findOne": (packageId: string) => {
        isLoggedIn();

        return Packages.collection.findOne({ _id: packageId });
    },
    /* delete a package */
    "packages.delete": (packageId: string) => {
        userIsInRole(["super-admin"]);
        
        return Packages.collection.update({ _id: packageId }, {
            $set: {
                deleted: true
            }
        });
    },
    /* activate a package */
    "packages.activate": (packageId: string) => {
        userIsInRole(["super-admin"]);

        return Packages.collection.update({ _id: packageId }, {
            $set: {
                active: true
            }
        });
    },
    /* deactivate a package */
    "packages.deactivate": (packageId: string) => {
        userIsInRole(["super-admin"]);

        return Packages.collection.update({ _id: packageId }, {
            $set: {
                active: false
            }
        });
    }
});

function validatePackageData(item: Package) {
    /* validate title */
    let titleLen = item.title.length;
    if (titleLen < 8 || titleLen > 255) {
        throw new Meteor.Error(403, `Invalid title supplied.`);
    }
    if (!isValidFirstName(item.title)) {
        throw new Meteor.Error(403, `Invalid title supplied.`);
    }
    /* validate summary */
    let summaryLen = item.summary.length;
    if (summaryLen < 8 || summaryLen > 255) {
        throw new Meteor.Error(403, `Invalid summary supplied.`);
    }
    /* validate code */
    let codeLen = item.code.length;
    if (codeLen < 8 || codeLen > 255) {
        throw new Meteor.Error(403, `Invalid code supplied.`);
    }
    if (!isValidSlug(item.code)) {
        throw new Meteor.Error(403, `Invalid code supplied.`);
    }
    /* validate maxDevices */
    item.maxDevices = Number(item.maxDevices);
    if (!item.maxDevices || item.maxDevices < 1 || item.maxDevices > 25) {
        throw new Meteor.Error(403, `Invalid maxDevices supplied.`);
    }
    /* validate maxPatients */
    item.maxPatients = Number(item.maxPatients);
    if (!item.maxPatients || item.maxPatients < 1 || item.maxPatients > 50) {
        throw new Meteor.Error(403, `Invalid maxPatients supplied.`);
    }
    /* validate pricePerPatient */
    item.pricePerPatient = Number(item.pricePerPatient);
    if (!item.pricePerPatient || item.pricePerPatient < 0.25 || item.pricePerPatient > 10) {
        throw new Meteor.Error(403, `Invalid pricePerPatient supplied.`);
    }
    /* validate pricePerDevice */
    item.pricePerDevice = Number(item.pricePerDevice);
    if (!item.pricePerDevice || item.pricePerDevice < 25 || item.pricePerDevice > 500) {
        throw new Meteor.Error(403, `Invalid pricePerDevice supplied.`);
    }
    /* validate durationInMonths */
    item.durationInMonths = Number(item.durationInMonths);
    if (!item.durationInMonths || item.durationInMonths < 1 || item.durationInMonths > 36) {
        throw new Meteor.Error(403, `Invalid durationInMonths supplied.`);
    }
    /* validate durationInDays */
    item.durationInDays = Number(item.durationInMonths) * 30;

    return true;
}