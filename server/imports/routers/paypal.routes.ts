import { Meteor } from "meteor/meteor";
import { HTTP } from 'meteor/http'
//import * as bodyParser from "body-parser";
var bodyParser = require("body-parser");   
//import * as paypal from "paypal-rest-sdk";
var paypal = require("paypal-rest-sdk");   
import { Transactions } from "../../../both/collections/transactions.collection";
import { Bookings } from "../../../both/collections/bookings.collection";

// configue paypal sdk
let paypalMode = Meteor.settings.public["paypal"] ["mode"];
let clientId = Meteor.settings.public["paypal"] ["clientId"];
let clientSecret = Meteor.settings.public["paypal"] ["clientSecret"];
paypal.configure({
  'mode': paypalMode, //sandbox or live
  'client_id': clientId,
  'client_secret': clientSecret
});

declare var Picker: any;
let rootUrl = process.env.ROOT_URL;

// Define our middleware using the Picker.middleware() method.
Picker.middleware( bodyParser.json() );
Picker.middleware( bodyParser.urlencoded( { extended: false } ) );

Picker.route( '/admin/api/1.0/paypal/payment/get/', function( params, request, response, next ) {
  let body = request.body;
  let args = params.query;

  paypal.payment.get(args.paymentId, function (error, payment) {
      if (error) {
          //console.log(error);
          response.end( JSON.stringify(error) );
      } else {
          console.log("Get Payment Response");
          response.end( JSON.stringify(payment) );
      }
  });
});

Picker.route( '/admin/api/1.0/paypal/payment/refund/', function( params, request, response, next ) {
  let body = request.body;
  let args = params.query;
  let booking = <any>Bookings.collection.findOne({"paymentInfo.gatewayTransId": args.paymentId});
  let randomnumber = Math.ceil(Math.random() * 9999999);
  let amountToRefund = Number(body.refundAmount);
  let comments = body.comments;
  // get refund amount
  let refund_details = {
      "amount": {
        total: amountToRefund,
        currency: "USD"
      },
      "invoice_number": randomnumber
  };
  // delete refund_details.amount.details;
  // let refund_details = {};
  // get sale id
  console.log("refund details",refund_details);
  let saleId = booking.paymentInfo.saleId;

  paypal.sale.refund(saleId, refund_details, Meteor.wrapAsync( (error, refund) => {
      if (error) {
          console.log(error.response);
          response.end( JSON.stringify({success: false}) );
          // response.end( JSON.stringify(error) );
      } else {
          console.log("Get Refund Response");
          //console.log(JSON.stringify(payment));
          // insert transaction in mongodb
          refund.relatedInfo = {
            gateway: "paypal",
            purpose: "refund",
            bookingId: booking._id,
            supplierId: booking.tour.supplierId
          };
          refund.createdAt = new Date();
          var transactionId = Transactions.collection.insert(refund);
          console.log("new transactionId:", transactionId);
          // update booking object
          Bookings.collection.update({_id: booking._id}, {$set: {
            refunded: true,
            refundedAmount: amountToRefund,
            refundComments: comments,
            "refundInfo": {
              transactionId: transactionId,
              gatewayTransId: refund.id,
              processedAt: new Date(),
              processedBy: "admin"
            }
          } });

          Meteor.setTimeout(() => {
            Meteor.call("bookings.refundConfirmation", booking._id);
          }, 0);

          response.end( JSON.stringify({success: true}) );
          // response.end( JSON.stringify(refund) );
      }
  }) );
});
