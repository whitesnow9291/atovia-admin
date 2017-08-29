import { Meteor } from "meteor/meteor";
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import { check } from "meteor/check";
import { Payouts } from "../../both/collections/payouts.collection";
import { Payout } from "../../both/models/payout.model";
import { isLoggedIn, userIsInRole } from "../imports/services/auth";
import * as _ from 'underscore';

interface Options {
  [key: string]: any;
}

Meteor.methods({
  "payouts.insert": (payout: Payout) => {
    userIsInRole(["super-admin"]);
    let payoutId = Payouts.collection.insert(payout);
    return payoutId;
  },
  "payouts.find": (options: Options, criteria: any = {}, count: boolean = false):any => {
    userIsInRole(["super-admin"]);
      let where:any = [];
      where.push({
          "$or": [{deleted: false}, {deleted: {$exists: false} }]
      }, {
        "$or": [{active: true}, {active: {$exists: false} }]
      });

      if (!_.isEmpty(criteria)) {
        where.push(criteria);
      }

      let cursor = Payouts.collection.find({$and: where}, options);
      if (count === true) {
        return cursor.count();
      }
      return {count: cursor.count(), data: cursor.fetch()};
  }
})
