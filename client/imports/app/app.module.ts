import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AccountsModule } from 'angular2-meteor-accounts-ui';
import { CKEditorModule } from 'ng2-ckeditor';
import { Ng2PaginationModule } from 'ng2-pagination';
import { LocalStorageModule } from "angular-2-local-storage";
import { AppComponent } from "./app.component.web";
import { routes, ROUTES_PROVIDERS } from './app.routes';
import { SHARED_DECLARATIONS } from './shared';
import { AUTH_DECLARATIONS } from "./auth/index";
import { ACCOUNT_DECLARATIONS } from "./myaccount/index";
import { LAYOUT_DECLARATIONS } from "./layout/index";
import { Subadmin_Declarations } from "./sub-admin/index";
import { Page_Declarations } from "./content-page/index";
import { DASHBOARD_DECLARATIONS } from "./dashboard/index";
import { Services_Providers } from "../services/index";
import { Faq_Declarations } from "./faq/index";
import { Email_Declarations } from "./email/index";
import { Tours_Declarations } from "./tours/index";
import { Places_Declarations } from "./places/index";
import { Booking_Declarations } from "./bookings/index";
import { Subscribers_Declarations } from "./subscribers/index";
import { CURRENCY_DECLARATIONS } from "./currency/index";

// Create config options (see ILocalStorageServiceConfigOptions) for deets:
/*let localStorageServiceConfig = {
    prefix: 'my-app',
    storageType: 'sessionStorage'
};*/

let moduleDefinition;

moduleDefinition = {
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    AccountsModule,
    Ng2PaginationModule,
    CKEditorModule,
    LocalStorageModule.withConfig({
        prefix: 'my-app',
        storageType: 'sessionStorage'
    })
  ],
  declarations: [
    AppComponent,
    ...SHARED_DECLARATIONS,
    ...AUTH_DECLARATIONS,
    ...DASHBOARD_DECLARATIONS,
    ...LAYOUT_DECLARATIONS,
    ...ACCOUNT_DECLARATIONS,
    ...Subadmin_Declarations,
    ...Page_Declarations,
    ...Email_Declarations,
    ...Faq_Declarations,
    ...Tours_Declarations,
    ...Places_Declarations,
    ...Booking_Declarations,
    ...Subscribers_Declarations,
    ...CURRENCY_DECLARATIONS
  ],
  providers: [
    ...ROUTES_PROVIDERS,
    ...Services_Providers
  ],
  bootstrap: [
    AppComponent
  ]
}

@NgModule(moduleDefinition)
export class AppModule {
  constructor() {

  }
}
