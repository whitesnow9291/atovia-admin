import { Meteor } from 'meteor/meteor';

import './startup/accounts-config.js';
import './imports/publications/users';
import './imports/routers/customer.routes';
import './imports/routers/paypal.routes.ts';

Meteor.startup(() => {

});
