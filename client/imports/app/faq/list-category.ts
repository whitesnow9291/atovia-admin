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
import { FAQ, FAQCategory } from "../../../../both/models/faq.model";
import {showAlert} from "../shared/show-alert";
import { Roles } from 'meteor/alanning:roles';

import template from "./list-category.html";

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

export class ListFAQCategoryComponent extends MeteorComponent implements OnInit, OnDestroy, AfterViewInit {
    items: FAQCategory[];
    faqs: FAQ[];
    pageSize: Subject<number> = new Subject<number>();
    curPage: Subject<number> = new Subject<number>();
    nameOrder: Subject<number> = new Subject<number>();
    optionsSub: Subscription;
    itemsSize: number = -1;
    searchSubject: Subject<string> = new Subject<string>();
    searchString: string = "";
    isSetAccordian: boolean = false;

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
        let options:any = this.localStorageService.get("faqcategory-list.options");
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
                limit: 0,
                curPage: 1,
                nameOrder: 1,
                searchString: '',
            }
        }

        this.setOptionsSub();

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
            this.localStorageService.set("faqcategory-list.options", {
                pageSize: pageSize,
                curPage: curPage,
                nameOrder: nameOrder,
                searchString: searchString
            });

            //console.log("options:", options);
            //console.log("searchString:", this.searchString);
            this.searchString = searchString;
            jQuery(".loading").show();
            //console.log("call pages.find()");
            this.call("faqcategories.find", options, {}, searchString, (err, res) => {
                //console.log("patients.find() done");
                jQuery(".loading").hide();
                if (err) {
                    //console.log("error while fetching patient list:", err);
                    showAlert("Error while fetching categories list.", "danger");
                    return;
                }
                this.items = res.data;
                this.itemsSize = res.count;
            });

            this.call("faqs.find", {limit: 0, skip: 0, sort: {"categoryId": 1} }, {}, "", (err, res) => {
                if (err) {
                    showAlert("Error while fetching FAQs data.", "danger");
                    return;
                }
                this.faqs = res.data;

                /*Meteor.setTimeout(function() {
                    jQuery('.collapsible').collapsible();
                }, 1000);*/
            })
        });
    }

    get faqcategoryArr() {
        return this.items;
    }

    getFAQs(categoryId: string) {
        //console.log("inside faqs");
        let retArr:FAQ[] = [];

        if (typeof this.faqs == "undefined" || this.faqs.length==0) {
            return retArr;
        }

        for (let i=0; i<this.faqs.length; i++) {
            if (this.faqs[i].categoryId == categoryId) {
                retArr.push(this.faqs[i]);
            }
        }

        //jQuery('.collapsible').collapsible();
        return retArr;
    }

    search(value: string): void {
        this.searchSubject.next(value);
        this.isSetAccordian = false;
    }

    /* function for clearing search */
    clearsearch(value: string): void{
        this.searchSubject.next(value);
        this.isSetAccordian = false;
    }

    changeSortOrder(nameOrder: string): void {
        this.nameOrder.next(parseInt(nameOrder));
    }

    activateFAQCategory(item: FAQCategory) {
        if (! confirm("Are you sure to activate this FAQ Category?")) {
            return false;
        }

        Meteor.call("faqcategories.activate", item._id, (err, res) => {
            if (err) {
                showAlert("Error calling faqcategory.activate", "danger");
                return;
            }
            item.active = true;
            //angular2 waits for dom event to detect changes automatically
            //so trigger change detection manually to update dom
            this.changeDetectorRef.detectChanges();
            showAlert("FAQ Category has been activated.", "success");
        })
    }

    deactivateFAQCategory(item: FAQCategory) {
        if (! confirm("Are you sure to deactivate this FAQ Category?")) {
            return false;
        }

        Meteor.call("faqcategories.deactivate", item._id, (err, res) => {
            if (err) {
                showAlert("Error calling faqcategory.deactivate", "danger");
                return;
            }
            item.active = false;
            //angular2 waits for dom event to detect changes automatically
            //so trigger change detection manually to update dom
            this.changeDetectorRef.detectChanges();
            showAlert("FAQ Category has been deactivated.", "success");
        })
    }

    deleteFAQCategory(item: FAQCategory) {
        if (! confirm("Are you sure to delete this FAQ Category?")) {
            return false;
        }

        Meteor.call("faqcategories.delete", item._id, (err, res) => {
            if (err) {
                showAlert("Error calling faqcategories.delete", "danger");
                return;
            }
            //set page.deleted to true to remove from list
            item.deleted = true;
            //angular2 waits for dom event to detect changes automatically
            //so trigger change detection manually to update dom
            this.changeDetectorRef.detectChanges();
            showAlert("FAQ Category has been deleted.", "success");
        })
    }

    activateFAQ(item: FAQ) {
        if (! confirm("Are you sure to activate this FAQ?")) {
            return false;
        }

        Meteor.call("faqs.activate", item._id, (err, res) => {
            if (err) {
                showAlert("Error calling faqs.activate", "danger");
                return;
            }
            item.active = true;
            //angular2 waits for dom event to detect changes automatically
            //so trigger change detection manually to update dom
            this.changeDetectorRef.detectChanges();
            showAlert("FAQ has been activated.", "success");
        })
    }

    deactivateFAQ(item: FAQ) {
        if (! confirm("Are you sure to deactivate this FAQ?")) {
            return false;
        }

        Meteor.call("faqs.deactivate", item._id, (err, res) => {
            if (err) {
                showAlert("Error calling faqs.deactivate", "danger");
                return;
            }
            item.active = false;
            //angular2 waits for dom event to detect changes automatically
            //so trigger change detection manually to update dom
            this.changeDetectorRef.detectChanges();
            showAlert("FAQ has been deactivated.", "success");
        })
    }

    deleteFAQ(item: FAQ) {
        if (! confirm("Are you sure to delete this FAQ?")) {
            return false;
        }

        Meteor.call("faqs.delete", item._id, (err, res) => {
            if (err) {
                showAlert("Error calling faqs.delete", "danger");
                return;
            }
            //set page.deleted to true to remove from list
            item.deleted = true;
            //angular2 waits for dom event to detect changes automatically
            //so trigger change detection manually to update dom
            this.changeDetectorRef.detectChanges();
            showAlert("FAQ has been deleted.", "success");
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
      }, 200);
      jQuery(function($){
      $(document).ready(function(){
          $('.collapsible').collapsible();
      });
      })
    }

    initializeJS() {
        if (this.isSetAccordian === true) {
            return;
        }
        Meteor.setTimeout(function() {
            jQuery('.collapsible').collapsible();
        }, 500);
        this.isSetAccordian = true;
    }
}
