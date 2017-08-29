import { Meteor } from "meteor/meteor";
import { Component, OnInit, OnDestroy, NgZone, AfterViewInit } from "@angular/core";
import { Observable, Subscription, Subject, BehaviorSubject } from "rxjs";
import { PaginationService } from "ng2-pagination";
import { MeteorObservable } from "meteor-rxjs";
import { InjectUser } from "angular2-meteor-accounts-ui";
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MeteorComponent } from 'angular2-meteor';
import { ChangeDetectorRef } from "@angular/core";
import { Title } from '@angular/platform-browser';
import { LocalStorageService } from 'angular-2-local-storage';
import { Subscriber } from "../../../../both/models/subscriber.model";
import { showAlert } from "../shared/show-alert";
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
export class ListSubscribersComponent extends MeteorComponent implements OnInit, AfterViewInit {
    items: Subscriber[];
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
        private titleService: Title,
        private changeDetectorRef: ChangeDetectorRef,
        private localStorageService: LocalStorageService
    ) {
        super();
    }

    ngOnInit() {
      this.titleService.setTitle("Subscribers List | Atorvia");
      this.setOptions();
    }

    private setOptions() {
        let options = {
                limit: 10,
                curPage: 1,
                nameOrder: 1,
                searchString: '',
            }
        this.setOptionsSub();

        this.paginationService.register({
        id: "subscribers",
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
                sort: { "email": nameOrder as number }
            };

            this.paginationService.setCurrentPage("subscribers", curPage as number);

            //console.log("options:", options);
            //console.log("searchString:", this.searchString);
            this.searchString = searchString;
            jQuery(".loading").show();
            this.call("subscribers.find", options, {}, searchString, (err, res) => {
                //console.log("patients.find() done");
                jQuery(".loading").hide();
                if (err) {
                    console.log(err);
                    showAlert("Error while fetching subscribers list.", "danger");
                    return;
                }

                this.items = res.data;
                this.itemsSize = res.count;
                this.paginationService.setTotalItems("subscribers", this.itemsSize);

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

    onPageChanged(page: number): void {
        this.curPage.next(page);
    }

    deleteSubscriber(subscriber: Subscriber) {
      if (! confirm("Are you sure to delete this subscriber?")) {
          return false;
      }

      this.call("subscribers.delete", subscriber.email, (err, res) => {
        if (! err) {
          showAlert("Subscriber has been removed successfully.", "success");
          subscriber.deleted = true;
          this.changeDetectorRef.detectChanges();
        } else {
          console.log(err);
        }
      })
    }

    ngAfterViewInit() {
    }
}
