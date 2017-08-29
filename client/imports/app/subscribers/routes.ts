import { Route } from '@angular/router';
import { Meteor } from 'meteor/meteor';
import { AuthService } from "../../services/auth";

import { ListSubscribersComponent } from "./list";

export const routes = [
  {path: "subscribers/list", component: ListSubscribersComponent, canActivate: [AuthService], data: {'roles': ['super-admin']} },
]
