import { Route } from '@angular/router';
import { Meteor } from 'meteor/meteor';
import { AuthService } from "../../services/auth";

import { CreateEmailComponent } from "./create";
import { ListEmailComponent } from "./list";


export const routes = [
    {path: "email/create", component: CreateEmailComponent, canActivate: [AuthService], data: {'roles': ['super-admin']}},
    {path: "email/update/:id", component: CreateEmailComponent, canActivate: [AuthService], data: {'roles': ['super-admin']}},
    {path: "email/list", component: ListEmailComponent, canActivate: [AuthService], data: {'roles': ['super-admin']}},
];

