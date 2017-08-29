import { Route } from '@angular/router';
import { Meteor } from 'meteor/meteor';

import { UserDetailsComponent } from "./viewprofile";
import {PasswordComponent} from "./changepassword";

export const routes = [
    {path: "account/viewprofile", component: UserDetailsComponent},
    {path: "account/changepassword", component: PasswordComponent},
];
