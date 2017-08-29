import { Route } from '@angular/router';
import { Meteor } from 'meteor/meteor';
import { AuthService } from "../../services/auth";

import { CreatePageComponent } from "./create";
import { ListPageComponent } from "./list";
import { ViewPageComponent } from "./view";

export const routes = [
    {path: "page/create", component: CreatePageComponent, canActivate: [AuthService], data: {'roles': ['super-admin', 'sub-admin']}},
    {path: "page/update/:id", component: CreatePageComponent, canActivate: [AuthService], data: {'roles': ['super-admin', 'sub-admin']}},
    {path: "page/list", component: ListPageComponent, canActivate: [AuthService], data: {'roles': ['super-admin', 'sub-admin']}},
    {path: "page/view/:id", component: ViewPageComponent, canActivate: [AuthService], data: {'roles': ['super-admin', 'sub-admin']}}
];

