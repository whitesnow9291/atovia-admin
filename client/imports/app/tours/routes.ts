import { Route } from '@angular/router';
import { Meteor } from 'meteor/meteor';
import { AuthService } from "../../services/auth";

import { ListTourComponent } from './list';
import { ViewTourComponent } from './view';

export const routes = [
    {path: "tours/list", component: ListTourComponent, canActivate: [AuthService], data: {'roles': ['super-admin']} },
    {path: "tours/view/:id", component: ViewTourComponent, canActivate: [AuthService], data: {'roles': ['super-admin']} },
]
