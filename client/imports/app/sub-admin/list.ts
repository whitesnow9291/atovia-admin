import { Meteor } from "meteor/meteor";
import {Component, OnInit, OnDestroy, NgZone, AfterViewInit} from "@angular/core";
import {Observable, Subscription, Subject, BehaviorSubject} from "rxjs";
import {PaginationService} from "ng2-pagination";
import {MeteorObservable} from "meteor-rxjs";
import {InjectUser} from "angular2-meteor-accounts-ui";
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MeteorComponent } from 'angular2-meteor';
import { ChangeDetectorRef } from "@angular/core";
import { Title } from '@angular/platform-browser';
import { LocalStorageService } from 'angular-2-local-storage';
import { User } from "../../../../both/models/user.model";
import {showAlert} from "../shared/show-alert";
import { Roles } from 'meteor/alanning:roles';

import template from "./list.html";

interface Pagination {
  limit: number;
  skip: number;
}

interface Options extends Pagination {
  [key: string]: any
}

declare var jQuery:any;

@Component({
  selector: '',
  template
})
export class ListSubadminComponent extends MeteorComponent implements OnInit, AfterViewInit {
    items: User[];
    pageSize: Subject<number> = new Subject<number>();
    curPage: Subject<number> = new Subject<number>();
    nameOrder: Subject<number> = new Subject<number>();
    optionsSub: Subscription;
    itemsSize: number = -1;
    searchSubject: Subject<string> = new Subject<string>();
    searchString: string = "";
    pageTitle = "Suppliers";
    userRoles = ["supplier"];

    constructor(private router: Router,
        private route: ActivatedRoute,
        private paginationService: PaginationService,
        private ngZone: NgZone,
        private titleService: Title,
        private changeDetectorRef: ChangeDetectorRef,
        private localStorageService: LocalStorageService
    ) {
        super();

        let currentUrl = this.router.url;
        if(currentUrl == "/customers/list") {
          this.pageTitle = "Customers";
          this.userRoles = ["customer"];
          this.titleService.setTitle("Customers List | Atorvia");
        } else {
          this.titleService.setTitle("Suppliers List | Atorvia");
        }
    }

    ngOnInit() {
      this.setOptions();
    }

    private setOptions() {
        let options: any = {
            limit: 10,
            curPage: 1,
            nameOrder: 1,
            searchString: '',
        }

        this.setOptionsSub();

        this.paginationService.register({
        id: "sub-admins",
        itemsPerPage: 10,
        currentPage: options.curPage,
        totalItems: this.itemsSize
        });

        this.pageSize.next(options.limit);
        this.curPage.next(options.curPage);
        this.nameOrder.next(options.nameOrder);
        this.searchSubject.next(options.searchString);
    }

    private setOptionsSub() {
        this.optionsSub = Observable.combineLatest(
            this.pageSize,
            this.curPage,
            this.nameOrder,
            this.searchSubject
        ).subscribe(([pageSize, curPage, nameOrder, searchString]) => {
            const options: Options = {
                limit: pageSize as number,
                skip: ((curPage as number) - 1) * (pageSize as number),
                sort: { "profile.firstName": nameOrder as number }
            };

            this.paginationService.setCurrentPage("sub-admins", curPage as number);

            //console.log("options:", options);
            //console.log("searchString:", this.searchString);
            this.searchString = searchString;
            jQuery(".loading").show();
            this.call("users.find", options, {"roles": {$in: this.userRoles} }, searchString, (err, res) => {
                //console.log("patients.find() done");
                jQuery(".loading").hide();
                if (err) {
                    //console.log("error while fetching patient list:", err);
                    showAlert("Error while fetching suppliers list.", "danger");
                    return;
                }
                this.items = res.data;
                this.itemsSize = res.count;
                this.paginationService.setTotalItems("sub-admins", this.itemsSize);

                setTimeout(function(){
                    jQuery(function($){
                    /*$('.tooltipped').tooltip({delay: 0});*/
                    });
                }, 200);
            })

        });
    }

    search(value: string): void {
        this.searchSubject.next(value);
    }

     clearsearch(value: string): void{
        this.searchSubject.next(value);
    }

    onPageChanged(page: number): void {
        this.curPage.next(page);
    }

    changeSortOrder(nameOrder: string): void {
        this.nameOrder.next(parseInt(nameOrder));
    }

    activate(user: User) {
        if (! confirm("Are you sure to activate this supplier?")) {
            return false;
        }

        Meteor.call("users.activate", user._id, (err, res) => {
            if (err) {
                showAlert("Error while processing your request.", "danger");
                return;
            }
            user.active = true;
            //angular2 waits for dom event to detect changes automatically
            //so trigger change detection manually to update dom
            this.changeDetectorRef.detectChanges();
            showAlert("User has been activated.", "success");
        })
    }

    deactivate(user: User) {
        if (! confirm("Are you sure to deactivate this supplier?")) {
            return false;
        }

        Meteor.call("users.deactivate", user._id, (err, res) => {
            if (err) {
                showAlert("Error while processing your request.", "danger");
                return;
            }
            user.active = false;
            //angular2 waits for dom event to detect changes automatically
            //so trigger change detection manually to update dom
            this.changeDetectorRef.detectChanges();
            showAlert("User has been deactivated.", "success");
        })
    }

    // deleteUser(user: User) {
    //     if (! confirm("Are you sure to delete this supplier?")) {
    //         return false;
    //     }
    //
    //     Meteor.call("users.delete", user._id, (err, res) => {
    //         if (err) {
    //             showAlert("Error while processing your request.", "danger");
    //             return;
    //         }
    //         //set user.deleted to true to remove from list
    //         user.deleted = true;
    //         //angular2 waits for dom event to detect changes automatically
    //         //so trigger change detection manually to update dom
    //         this.changeDetectorRef.detectChanges();
    //         showAlert("User has been removed.", "success");
    //     })
    // }

    ngOnDestroy() {
        this.optionsSub.unsubscribe();
    }

    ngAfterViewInit() {
      Meteor.setTimeout(function() {
        jQuery(function($){
          /*$('select').material_select();*/
          $('.tooltipped').tooltip({delay: 50});
        });
      }, 500);
    }

    verifyCertificate (user: User) {
      if (! confirm("Are you sure to verify the supplier's certificate?")) {
          return false;
      }

      this.call("verifyAgentCertificate", user._id, (err, res) => {
        if (! err) {
          showAlert("Agent Certificate has been verified successfully.", "success");

          user.profile.supplier.agentCertificate.verified = true;
          this.changeDetectorRef.detectChanges();
        } else {
          showAlert("Error while processing your request.", "danger");
        }
      })
    }

    unverifyCertificate (user: User) {
      if (! confirm("Are you sure to unverify the supplier's certificate?")) {
          return false;
      }

      this.call("unverifyAgentCertificate", user._id, (err, res) => {
        if (! err) {
          showAlert("Agent Certificate has been unverified successfully.", "success");

          user.profile.supplier.agentCertificate.verified = false;
          this.changeDetectorRef.detectChanges();
        } else {
          showAlert("Error while processing your request.", "danger");
        }
      })
    }

    verifyIdentity(user: User) {
      if (! confirm("Are you sure to verify the supplier's identity?")) {
        return false;
      }

      this.call("verifyAgentIdentity", user._id, (err, res) => {
        if (! err) {
          showAlert("Agent Identity has been verified successfully.", "success");

          user.profile.supplier.agentIdentity.verified = true;
          this.changeDetectorRef.detectChanges();
        } else {
          showAlert("Error while processing your request.", "danger");
        }
      })
    }

    unverifyIdentity(user: User) {
      if (! confirm("Are you sure to unverify the supplier's identity?")) {
        return false;
      }

      this.call("unverifyAgentIdentity", user._id, (err, res) => {
        if (! err) {
          showAlert("Agent Identity has been unverified successfully.", "success");

          user.profile.supplier.agentIdentity.verified = false;
          this.changeDetectorRef.detectChanges();
        } else {
          showAlert("Error while processing your request.", "danger");
        }
      })
    }
}
