import { Route } from '@angular/router';
import { Meteor } from 'meteor/meteor';
import { AuthService } from "../../services/auth";

import { ListCurrencyComponent } from "./list";
import { EditCurrencyComponent } from "./edit";
export const routes = [
    {path: "currency/list", component: ListCurrencyComponent, canActivate: [AuthService], data: {'roles': ['super-admin']}},
    {path: "currency/edit/:id", component: EditCurrencyComponent, canActivate: [AuthService], data: {'roles': ['super-admin']}}
]
