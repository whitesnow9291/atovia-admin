import { Meteor } from "meteor/meteor";
import { Accounts } from 'meteor/accounts-base';
import { Subscribers } from "../../both/collections/subscribers.collection";
import { Subscriber } from "../../both/models/subscriber.model";
import { isLoggedIn, userIsInRole } from "../imports/services/auth";
import * as _ from 'underscore';

interface Options {
    [key: string]: any;
}

Meteor.methods({
  "subscribers.find": (options: Options, criteria:any, searchString: string) => {
      userIsInRole(["super-admin"]);
      let where:any = [];
      where.push({
          "$or": [{deleted: false}, {deleted: {$exists: false} }]
      }, {
        "$or": [{active: false}, {active: {$exists: false} }]
      });

      if ( !_.isEmpty(criteria) ) {
        //console.log(criteria);
        where.push(criteria);
      }

      if (typeof searchString === 'string' && searchString.length) {
          // allow search on firstName, lastName
          where.push({
              "$or": [
                  { "email": { $regex: `.*${searchString}.*`, $options: 'i' } }
              ]
          });
      }

      let cursor = Subscribers.collection.find({$and: where}, options);
      return {count: cursor.count(), data: cursor.fetch()};
  },

  "subscribers.delete": (email: string) => {
    return Subscribers.collection.remove({email: email});
  }
})
