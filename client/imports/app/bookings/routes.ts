import { Route } from '@angular/router';
import { Meteor } from 'meteor/meteor';
import { AuthService } from "../../services/auth";

import { ListBookingComponent } from './list';
import { ViewBookingComponent } from './view';

export const routes = [
    {path: "bookings/list", component: ListBookingComponent, canActivate: [AuthService], data: {'roles': ['super-admin']} },
    {path: "bookings/view/:id", component: ViewBookingComponent, canActivate: [AuthService], data: {'roles': ['super-admin']} }
]
