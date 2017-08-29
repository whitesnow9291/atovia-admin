import { Meteor } from "meteor/meteor";
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import { check } from "meteor/check";
import { Bookings } from "../../both/collections/bookings.collection";
import { Booking } from "../../both/models/booking.model";
import { isLoggedIn, userIsInRole } from "../imports/services/auth";
import bookingRefundCustomerHtml from "../imports/emails/customer/booking-refund.html";
import bookingRefundSupplierHtml from "../imports/emails/supplier/booking-refund.html";
import bookingDenyCustomerHtml from "../imports/emails/customer/booking-refund-denied.html";
import * as _ from 'underscore';

interface Options {
  [key: string]: any;
}

Meteor.methods({
    "bookings.find": (options: Options, criteria: any, searchString: any, count: boolean = false):any => {
      userIsInRole(["super-admin"]);

        let where:any = [];
        let userId = Meteor.userId();
        where.push({
            "$or": [{deleted: false}, {deleted: {$exists: false} }]
        }, {
          "$or": [{active: true}, {active: {$exists: false} }]
        }, {
          "paymentInfo.status": "approved"
        });

        if ( !_.isEmpty(criteria) ) {
          if ( criteria.confirmed == false ) {
            criteria.startDate = {$gt: new Date()};
            delete criteria["completed"];
          } else if ( criteria.completed==true ) {
            criteria.startDate = {$lte: new Date()};
            delete criteria["completed"];
            delete criteria["confirmed"];
          } else if ( criteria.completed==false && criteria.confirmed==true ) {
            criteria.startDate = {$gt: new Date()};
            delete criteria["completed"];
          }
          //console.log(criteria);
          where.push(criteria);
        }

        // match search string
        if (isNaN(searchString) == false && searchString.length) {
          searchString = Number(searchString);
          where.push({
              "$or": [{uniqueId: searchString}]
          });
        } else if (typeof searchString === 'string' && searchString.length) {
            // allow search on firstName, lastName
            where.push({
                "$or": [
                    { "tour.name": { $regex: `.*${searchString}.*`, $options: 'i' } },
                    { "tour.supplier.companyName": { $regex: `.*${searchString}.*`, $options: 'i' } },
                    { "user.firstName": { $regex: `.*${searchString}.*`, $options: 'i' } },
                    { "user.lastName": { $regex: `.*${searchString}.*`, $options: 'i' } },
                    { "travellers.firstName": { $regex: `.*${searchString}.*`, $options: 'i' } },
                    { "travellers.lastName": { $regex: `.*${searchString}.*`, $options: 'i' } }
                ]
            });
        }
        let cursor = Bookings.collection.find({$and: where}, options);

        if (count === true) {
          return cursor.count();
        }

        return {count: cursor.count(), data: cursor.fetch()};
    },
    "bookings.findOne": (criteria: any, options: {with?: {tour: boolean}}= {}):any => {
      userIsInRole(["super-admin"]);
      let where:any = [];
      where.push({
          "$or": [{deleted: false}, {deleted: {$exists: false} }]
      }, {
        "$or": [{active: true}, {active: {$exists: false} }]
      }, {
        "paymentInfo.status": "approved"
      });

      if (_.isEmpty(criteria)) {
        criteria = { };
      }
      where.push(criteria);
      let booking = Bookings.collection.findOne({$and: where});

      if (typeof options.with == "undefined") {
        return booking;
      }

      if (options.with.tour == true) {
        let owner = Meteor.users.findOne({_id: booking.tour.supplierId}, {fields: {profile: 1} });
        return {booking, owner};
      }
    },
    "bookings.count": () => {
      userIsInRole(["super-admin"]);
      let bookingsCount: any = {};
      bookingsCount.new = Meteor.call("bookings.find", {}, {"confirmed": false, "cancelled": false}, "", true);
      bookingsCount.pending = Meteor.call("bookings.find", {}, {"confirmed": true, "completed": false}, "", true);
      bookingsCount.completed = Meteor.call("bookings.find", {}, {"confirmed": true, "completed": true}, "", true);

      return bookingsCount;
    },
    "bookings.statistics":(id: string) => {
      userIsInRole(["super-admin"]);
      let data = Bookings.collection.aggregate([{
        "$match":
          {
            "tour.supplierId": id,
            "confirmed": true,
            "refunded": false
          }
      },
      {
        "$project":
          {
            "tour.supplierId":1,
            "totalPriceDefault":1,
            "month": {"$month":"$bookingDate"},
            "year": {"$year": "$bookingDate"}
          }},
        {
          "$group":
            {
              _id:{"month":"$month","year":"$year"},
              "totalPrice":{"$sum":"$totalPriceDefault"},
              "count":{"$sum":1}
            }
        }
      ])
      return data;
    },
    "bookings.statistics.monthly": () => {
      let userId = Meteor.userId(),
          today = new Date(),
          oneDay = ( 1000 * 60 * 60 * 24 ),
          month6 = new Date( today.valueOf() - ( 6 * 30 * oneDay ) ),
          month2 = new Date( today.valueOf() - ( 1 * 30 * oneDay ) ),
          month1 = new Date( today.valueOf() - ( 0 * 30 * oneDay ) );

      let $cond = {
          "$cond": [
              { "$lte": [ "$bookingDate", month6 ] },
              "month6",
              { "$cond": [
                  { "$lte": [ "$bookingDate", month2 ] },
                  "month2",
                  "month1"
              ]}
          ]
      };

      let data = Bookings.collection.aggregate([
          { "$match": {
              "confirmed": true,
              "refunded": false,
              "bookingDate": { "$gte": month6 }
          }},
          { "$group": {
              "_id": $cond,
              "count": { "$sum": 1 },
              "totalValue": { "$sum": "$totalPriceDefault" }
          }}
      ]);
      console.log(data);

      let bookings = data;
      let bookingsCount = [];
      let bookingsValue = [];
      let groupNames = ["month1", "month2", "month6"];
      interface BookingStats {count: number; totalValue: number}
      for (let i=0; i<groupNames.length; i++) {
        let item: BookingStats = <BookingStats>_.find(bookings, {_id: groupNames[i]});
        if (_.isEmpty(item)) {
          bookingsCount.push(0);
          bookingsValue.push(0);
        } else {
          bookingsCount.push(item.count);
          bookingsValue.push(item.totalValue);
        }
      }

      return {bookingsCount, bookingsValue};
    },
    "bookings.statistics.new":(criteria: any = {}) => {
      userIsInRole(["super-admin"]);
      let _id: any = {"year":"$year","month":"$month"};
      let data = Bookings.collection.aggregate([
        {
          "$match":
          {
            "confirmed": true,
            "refunded": false
          }},
          {
            "$project":
            {
              "tour.supplierId":1,
              "totalPriceDefault":1,
              "month": {"$month":"$bookingDate"},
              "year": {"$year": "$bookingDate"},
              "bookingDate": 1
            }},
            {
              "$match": criteria
            },
            {
              "$group":
              {
                _id: "$confirmed",
                "totalPrice":{"$sum":"$totalPriceDefault"},
                "count":{"$sum":1}
              }},
              {
                "$sort":
                {
                  "_id.year": 1, "_id.month": 1
                }}
              ])
              return data;
            },
    "bookings.refundConfirmation": (bookingId) => {

      // find booking details
      let booking = Bookings.collection.findOne({_id: bookingId});
      if (_.isEmpty(booking)) {
        return;
      }

      let paymentMethod = booking.paymentInfo.method;
      if (paymentMethod == "express_checkout") {
        booking.paymentInfo.method = "Paypal";
      } else if(paymentMethod == "credit_card") {
        booking.paymentInfo.method = "Credit Card";
      }

      // send email to customer
      let customerAppUrl = Meteor.settings.public["customerAppUrl"];
      let to = booking.user.email;
      let subject = "Booking Refund Confirmation - Customer";
      let text = eval('`'+ bookingRefundCustomerHtml +'`');
      Meteor.setTimeout(() => {
        Meteor.call("sendEmail", to, subject, text);
      }, 0);

      // send email to supplier
      let supplier = Meteor.users.findOne({_id: booking.tour.supplierId}, {fields: {emails: 1} });
      if (_.isEmpty(supplier)) {
        return;
      }

      let supplierAppUrl = Meteor.settings.public["supplierAppUrl"];
      to = supplier.emails[0].address;
      subject = "Booking Refund Confirmation - Supplier";
      text = eval('`'+ bookingRefundSupplierHtml +'`');
      Meteor.setTimeout(() => {
        Meteor.call("sendEmail", to, subject, text)
      }, 0);
    },
    "bookings.denyRefund": (bookingId: string) => {

      // find booking details
      let booking = Bookings.collection.findOne({_id: bookingId});
      if (_.isEmpty(booking)) {
        return;
      }

      Bookings.collection.update({_id: booking._id, cancelled: true, refunded: false}, {$set: {
        refunded: true,
        refundDeniedAt: new Date()
      } });

      let paymentMethod = booking.paymentInfo.method;
      if (paymentMethod == "express_checkout") {
        booking.paymentInfo.method = "Paypal";
      } else if(paymentMethod == "credit_card") {
        booking.paymentInfo.method = "Credit Card";
      }

      // send email to customer
      let customerAppUrl = Meteor.settings.public["customerAppUrl"];
      let to = booking.user.email;
      let subject = "Refund Rejected from Atorvia";
      let text = eval('`'+ bookingDenyCustomerHtml +'`');
      Meteor.setTimeout(() => {
        Meteor.call("sendEmail", to, subject, text);
      }, 0);
    }
});

function getFormattedDate(today) {
  if (! today) {
    return "N.A.";
  }
  today = new Date(today.toString());
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!

  var yyyy = today.getFullYear();
  if(dd<10){
      dd='0'+dd;
  }
  if(mm<10){
      mm='0'+mm;
  }
  return dd+'/'+mm+'/'+yyyy;
}
