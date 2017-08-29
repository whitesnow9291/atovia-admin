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
import { LocalStorageService } from 'angular-2-local-storage';
import { Email } from "../../../../both/models/email.model";
import {showAlert} from "../shared/show-alert";

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
export class ListEmailComponent extends MeteorComponent implements OnInit, OnDestroy {
    items: Email[];
    pageSize: Subject<number> = new Subject<number>();
    curPage: Subject<number> = new Subject<number>();
    nameOrder: Subject<number> = new Subject<number>();
    optionsSub: Subscription;
    itemsSize: number = -1;
    searchSubject: Subject<string> = new Subject<string>();
    searchString: string = "";

    constructor(private router: Router,
        private route: ActivatedRoute,
        private paginationService: PaginationService,
        private ngZone: NgZone,
        private changeDetectorRef: ChangeDetectorRef,
        private localStorageService: LocalStorageService
    ) {
        super();
    }

    ngOnInit() {
        //console.log("inside init");
        this.setOptions();
    }

    private setOptions() {
        let options:any = this.localStorageService.get("email-list.options");
        //console.log("patient-list.options:", options);

        if (!!options) {
            if (! options.pageSize) {
                options.limit = 10;
            } else {
                options.limit = Number(options.pageSize);
            }

            if (! options.curPage) {
                options.curPage = 1;
            } else {
                options.curPage = Number(options.curPage);
            }

            if (! options.nameOrder) {
                options.nameOrder = 1;
            } else {
                options.nameOrder = Number(options.nameOrder);
            }

            if (! options.searchString) {
                options.searchString = '';
            }
        } else {
            options = {
                limit: 10,
                curPage: 1,
                nameOrder: 1,
                searchString: '',
            }
        }

        this.setOptionsSub();

        this.paginationService.register({
        id: "emails",
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
            //console.log("inside subscribe");
            const options: Options = {
                limit: pageSize as number,
                skip: ((curPage as number) - 1) * (pageSize as number),
                sort: { "title": nameOrder as number }
            };
            this.localStorageService.set("page-list.options", {
                pageSize: pageSize,
                curPage: curPage,
                nameOrder: nameOrder,
                searchString: searchString
            });

            this.paginationService.setCurrentPage("emails", curPage as number);

            //console.log("options:", options);
            //console.log("searchString:", this.searchString);
            this.searchString = searchString;
            jQuery(".loading").show();
            //console.log("call pages.find()");
            this.call("emails.find", options, {}, searchString, (err, res) => {
                //console.log("patients.find() done");
                jQuery(".loading").hide();
                if (err) {
                    //console.log("error while fetching patient list:", err);
                    showAlert("Error while fetching emails list.", "danger");
                    return;
                }
                this.items = res.data;
                this.itemsSize = res.count;
                this.paginationService.setTotalItems("emails", this.itemsSize);

                setTimeout(function(){
                    jQuery(function($){
                    /*$('.tooltipped').tooltip({delay: 0});*/
                    });
                }, 200);
                //console.log("data:", this.items);
            })

        });
    }

    get emailArr() {
        return this.items;
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

    activate(item: Email) {
        if (! confirm("Are you sure to activate this email?")) {
            return false;
        }

        Meteor.call("emails.activate", item._id, (err, res) => {
            if (err) {
                showAlert("Error calling page.activate", "danger");
                return;
            }
            item.active = true;
            //angular2 waits for dom event to detect changes automatically
            //so trigger change detection manually to update dom
            this.changeDetectorRef.detectChanges();
            showAlert("Email has been activated.", "success");
        })
    }

    deactivate(item: Email) {
        if (! confirm("Are you sure to deactivate this email?")) {
            return false;
        }

        Meteor.call("emails.deactivate", item._id, (err, res) => {
            if (err) {
                showAlert("Error calling email.deactivate", "danger");
                return;
            }
            item.active = false;
            //angular2 waits for dom event to detect changes automatically
            //so trigger change detection manually to update dom
            this.changeDetectorRef.detectChanges();
            showAlert("Email has been deactivated.", "success");
        })
    }

    deleteEmail(item: Email) {
        if (! confirm("Are you sure to delete this email?")) {
            return false;
        }

        Meteor.call("emails.delete", item._id, (err, res) => {
            if (err) {
                showAlert("Error calling emails.delete", "danger");
                return;
            }
            //set page.deleted to true to remove from list
            item.deleted = true;
            //angular2 waits for dom event to detect changes automatically
            //so trigger change detection manually to update dom
            this.changeDetectorRef.detectChanges();
            showAlert("Email has been deleted.", "success");
        })
    }

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
}
