import { Route } from '@angular/router';
import { Meteor } from 'meteor/meteor';
import { AuthService } from "../../services/auth";

import { ListSubadminComponent } from "./list";
import { PasswordSubadminComponent } from "./passwd";
import { ViewSubadminComponent } from "./view";
import { ViewCustomerComponent } from "./view-user";
import { PayoutSubadminComponent } from "./payout-form";

export const routes = [
    {path: "customers/list", component: ListSubadminComponent, canActivate: [AuthService], data: {'roles': ['super-admin']} },
    {path: "sub-admin/list", component: ListSubadminComponent, canActivate: [AuthService], data: {'roles': ['super-admin']} },
    {path: "sub-admin/passwd/:id", component: PasswordSubadminComponent, canActivate: [AuthService], data: {'roles': ['super-admin']} },
    {path: "sub-admin/view/:id", component: ViewSubadminComponent, canActivate: [AuthService], data: {'roles': ['super-admin']} },
    {path: "customer/view/:id", component: ViewCustomerComponent, canActivate: [AuthService], data: {'roles': ['super-admin']} },
    {path: "sub-admin/payout/:id", component: PayoutSubadminComponent, canActivate: [AuthService], data: {'roles': ['super-admin']} },
];
