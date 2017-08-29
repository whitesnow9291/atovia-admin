import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Email } from 'meteor/email';
import * as _ from 'underscore';

Meteor.startup(() => {

let sendDefault = <any>_.bind(Email.send, Email);
  _.extend(Email, {
    send: function (options) {
      let override = true;
      if (override) {
        /* your custom mail method, pull the options you need from `options` */
        // console.log('CUSTOM MAIL METHOD');
        Meteor.call("sendEmailCustom", options.to, options.subject, options.html);
      } else {
        /* use the SMTP method */
        // console.log('DEFAULT MAIL METHOD');
        sendDefault(options);
      }
    }
  });
});
