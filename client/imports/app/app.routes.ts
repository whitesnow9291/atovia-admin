import { Route } from '@angular/router';
import { Meteor } from 'meteor/meteor';

import {SignupComponent} from "./auth/singup.component";
import {RecoverComponent} from "./auth/recover.component";
import {LoginComponent} from "./auth/login.component.web";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {LandingComponent} from "./layout/landing.component";
import {routes as subadminRoutes} from "./sub-admin/routes";
import {routes as pageRoutes} from "./content-page/routes";
import {routes as accountRoutes} from "./myaccount/route";
import {routes as emailRoutes} from "./email/routes";
import {routes as faqcategoryRoutes} from "./faq/routes";
import {routes as toursRoutes} from "./tours/routes";
import {routes as placesRoutes } from "./places/routes";
import {routes as bookingRoutes } from "./bookings/routes";
import {routes as subscribersRoutes } from "./subscribers/routes";
import {routes as currencyRoutes } from "./currency/routes";

let mainRoutes = [
    { path: '', component: LandingComponent/*, canActivate: ['canActivateForLogoff']*/ },
    { path: 'dashboard', component: DashboardComponent, canActivate: ['canActivateForLoggedIn'] },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'recover', component: RecoverComponent }
];

export const routes: Route[] = [
    ...mainRoutes,
    ...subadminRoutes,
    ...pageRoutes,
    ...accountRoutes,
    ...emailRoutes,
    ...faqcategoryRoutes,
    ...toursRoutes,
    ...placesRoutes,
    ...bookingRoutes,
    ...subscribersRoutes,
    ...currencyRoutes
];

export const ROUTES_PROVIDERS = [
    {
        provide: 'canActivateForLoggedIn',
        useValue: () => !! Meteor.userId()
    },
    {
        provide: 'canActivateForLogoff',
        useValue: () => ! Meteor.userId()
    },
];
