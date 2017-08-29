import { Meteor } from "meteor/meteor";
import { Accounts } from 'meteor/accounts-base';
import { check } from "meteor/check";
import { Places } from "../../both/collections/places.collection";
import { Place } from "../../both/models/place.model";
import { isLoggedIn, userIsInRole } from "../imports/services/auth";
import * as _ from 'underscore';

interface Options {
    [key: string]: any;
}

Meteor.methods({
    /* insert a new place */
    "places.insert": (data: Place) => {
      data.createdAt = new Date();
      data.active = true;
      data.deleted = false;

      let placeId = Places.collection.insert(data);
      return placeId;
    },

    /* find place and search */
    "places.find": (options: Options, criteria: any, searchString: string) => {
        userIsInRole(["super-admin"]);

        let where:any = [];

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
            // allow search on firstName, lastName
            where.push({
                "$or": [
                    { "name": { $regex: `.*${searchString}.*`, $options: 'i' } },
                    { "address": { $regex: `.*${searchString}.*`, $options: 'i' } }
                ]
            });
        }

        // restrict db fields to return
        _.extend(options, {
            //fields: {"emails.address": 1, "patient": 1, "createdAt": 1, "status": 1}
        });

        //console.log("where:", where);
        //console.log("options:", options);
        // execute find query
        let cursor = Places.collection.find({ $and: where }, options);
        return { count: cursor.count(), data: cursor.fetch() };

    },

    //update place details
    "places.update": (placeId: string, placeData: any) => {
      userIsInRole(["super-admin"]);

      placeData.modifiedAt = new Date();
      return Places.collection.update({_id: placeId}, {$set : placeData});
    },
    "places.findOne": (placeId: string) => {
      return Places.collection.findOne({_id: placeId});
    },
    "places.activate": (placeId: string) => {
      return Places.collection.update({_id: placeId}, {$set: {active: true}});
    },
    "places.deactivate": (placeId: string) => {
      return Places.collection.update({_id: placeId}, {$set: {active: false}});
    },
    "places.delete": (placeId: string) => {
      return Places.collection.update({_id: placeId}, {$set: {deleted: true}});
    },
    /*"places.import": () => {
      let csv = require('csv-parser');
      let fs = require('fs');

      fs.createReadStream('/Users/rahul.sethi/Downloads/countries.csv')
      .pipe(csv())
      .on('data', Meteor.bindEnvironment((data) => {
        if (typeof data.name !== "string") {
          return;
        }
        let formData = {
          name: data.name,
          slug: slugify(data.name),
          iso2: data["alpha-2"],
          iso3: data["alpha-3"],
          sortOrder: 1,
          active: true,
          createdAt: new Date()
        };

        // console.log("insert ", formData);
        Places.collection.insert(formData);

        })
      )
    }*/
});

function slugify(text)
  {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start of text
      .replace(/-+$/, '');            // Trim - from end of text
  }
