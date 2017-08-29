import { Meteor } from "meteor/meteor";
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import { check } from "meteor/check";
import { Currencies } from "../../both/collections/currencies.collection";
import { Currency } from "../../both/models/currency.model";
import * as _ from 'underscore';

Meteor.methods({
  "currency.find": (criteria: any) => {
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

    let cursor = Currencies.collection.find({$and: where});
    return {count: cursor.count(), data: cursor.fetch()};
  },
  "currency.findOne": (id: string) => {
    return Currencies.collection.findOne({_id: id});
  },
  "currency.update": (id: string, currencyData: Currency) => {
    return Currencies.collection.update({_id: id}, {$set: currencyData})
  }
})
