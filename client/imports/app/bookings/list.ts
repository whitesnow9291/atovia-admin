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
import { LocalStorageService } from 'angular-2-local-storage';
import { Title } from '@angular/platform-browser';
import { Booking } from "../../../../both/models/booking.model";
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
export class ListBookingComponent extends MeteorComponent implements OnInit, AfterViewInit {
  items: Booking[];
  pageSize: Subject<number> = new Subject<number>();
  curPage: Subject<number> = new Subject<number>();
  orderBy: Subject<string> = new Subject<string>();
  nameOrder: Subject<number> = new Subject<number>();
  optionsSub: Subscription;
  itemsSize: number = -1;
  searchSubject: Subject<string> = new Subject<string>();
  searchString: string = "";
  whereCond: any = {};
  whereSub: Subject<any> = new Subject<any>();
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
    this.titleService.setTitle("Bookings List | Atorvia");
    this.setOptions();
  }

  private setOptions() {
    let options = {
      limit: 10,
      curPage: 1,
      orderBy: "bookingDate",
      nameOrder: -1,
      searchString: '',
      where: {}
    }

    this.setOptionsSub();

    this.paginationService.register({
      id: "bookings",
      itemsPerPage: 10,
      currentPage: options.curPage,
      totalItems: this.itemsSize
    });

    this.pageSize.next(options.limit);
    this.curPage.next(options.curPage);
    this.orderBy.next(options.orderBy);
    this.nameOrder.next(options.nameOrder);
    this.searchSubject.next(options.searchString);
    this.whereSub.next(options.where);
  }

  private setOptionsSub() {
    this.optionsSub = Observable.combineLatest(
      this.pageSize,
      this.curPage,
      this.orderBy,
      this.nameOrder,
      this.whereSub,
      this.searchSubject
    ).subscribe(([pageSize, curPage, orderBy, nameOrder, where, searchString]) => {
      //console.log("inside subscribe");
      const options: Options = {
        limit: pageSize as number,
        skip: ((curPage as number) - 1) * (pageSize as number),
        sort: { [orderBy]: nameOrder as number }
      };

      this.paginationService.setCurrentPage("bookings", curPage as number);

      this.searchString = searchString;
      jQuery(".loading").show();
      this.call("bookings.find", options, where, searchString, (err, res) => {
        jQuery(".loading").hide();
        if (err) {
          showAlert("Error while fetching tours list.", "danger");
          return;
        }
        this.items = res.data;
        this.itemsSize = res.count;
        // console.log(res.data);
        this.paginationService.setTotalItems("bookings", this.itemsSize);
      })
    });
  }

  get pageArr() {
    return this.items;
  }

  search(value: string): void {
      this.searchSubject.next(value);
  }

  /* function for clearing search */
  clearsearch(value: string): void{
      this.searchSubject.next(value);
  }

  onPageChanged(page: number): void {
      this.curPage.next(page);
  }

  changeSortOrder(nameOrder: string): void {
      this.nameOrder.next(parseInt(nameOrder));
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

  filter(value) {

    if (value == "") {
      this.whereSub.next({});
    } else if (value == "Confirmed") {
      this.whereSub.next({confirmed: true, cancelled: false, completed: false});
    } else if (value == "Cancelled") {
      this.whereSub.next({cancelled: true, refunded: true});
    } else if (value == "Pending") {
      this.whereSub.next({confirmed: false, cancelled: false, refunded: false});
    } else if (value == "Completed") {
      this.whereSub.next({confirmed: true, cancelled: false, completed: true});
    } else if (value == "Refund Requested") {
      this.whereSub.next({confirmed: false, cancelled: true, refunded: false});
    }
  }

  getBookingStatus(item) {
    let retVal = null;

    // check completed flag
    if (new Date(item.startDate) < new Date()) {
      item.completed = true;
    }

    if (! item.paymentInfo || item.paymentInfo.status != 'approved') {
      retVal = "Unpaid";
    } else if (item.cancelled == true && item.refunded !== true) {
      retVal = "Refund Requested";
    } else if (item.cancelled == true && item.refunded == true) {
      retVal = "Cancelled";
    } else if (item.confirmed !== true) {
        retVal = "Pending";
    } else if (item.confirmed === true && item.completed !== true) {
        retVal = "Confirmed";
    } else if (item.completed === true) {
        retVal = "Completed";
    }

    return retVal;
  }
}
