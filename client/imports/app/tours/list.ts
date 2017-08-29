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
import { Tour } from "../../../../both/models/tour.model";
import { Title } from '@angular/platform-browser';
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
export class ListTourComponent extends MeteorComponent implements OnInit, AfterViewInit {
  items: Tour[];
  pageSize: Subject<number> = new Subject<number>();
  curPage: Subject<number> = new Subject<number>();
  orderBy: Subject<string> = new Subject<string>();
  nameOrder: Subject<number> = new Subject<number>();
  optionsSub: Subscription;
  itemsSize: number = -1;
  searchSubject: Subject<string> = new Subject<string>();
  searchString: string = "";
  customerAppUrl: string;
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
    this.titleService.setTitle("Tours List | Atorvia");
    this.setOptions();
    this.customerAppUrl = Meteor.settings.public["customerAppUrl"];
  }

  private setOptions() {
    let options = {
      limit: 10,
      curPage: 1,
      orderBy: "requestApprovalSentAt",
      nameOrder: -1,
      searchString: ''
    }

    this.setOptionsSub();

    this.paginationService.register({
      id: "tours",
      itemsPerPage: 10,
      currentPage: options.curPage,
      totalItems: this.itemsSize
    });

    this.pageSize.next(options.limit);
    this.curPage.next(options.curPage);
    this.orderBy.next(options.orderBy);
    this.nameOrder.next(options.nameOrder);
    this.searchSubject.next(options.searchString);
  }

  private setOptionsSub() {
    this.optionsSub = Observable.combineLatest(
      this.pageSize,
      this.curPage,
      this.orderBy,
      this.nameOrder,
      this.searchSubject
    ).subscribe(([pageSize, curPage, orderBy, nameOrder, searchString]) => {
      //console.log("inside subscribe");
      const options: Options = {
        limit: pageSize as number,
        skip: ((curPage as number) - 1) * (pageSize as number),
        sort: { [orderBy]: nameOrder as number }
      };

      this.paginationService.setCurrentPage("tours", curPage as number);

      this.searchString = searchString;
      jQuery(".loading").show();
      this.call("tours.find", options, {requestApprovalSentAt: {$exists: true}}, searchString, (err, res) => {
        jQuery(".loading").hide();
        if (err) {
          showAlert("Error while fetching tours list.", "danger");
          return;
        }
        this.items = res.data;
        this.itemsSize = res.count;
        // console.log(res.count);
        this.paginationService.setTotalItems("tours", this.itemsSize);
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

  activate(tour: Tour) {
    if (! confirm("Are you sure to activate this tour?")) {
      return false;
    }

    Meteor.call("tours.activate", tour._id, (err, res) => {
      if (err) {
        showAlert("Error calling tours.activate", "danger");
        return;
      }
      tour.active = true;
      //angular2 waits for dom event to detect changes automatically
      //so trigger change detection manually to update dom
      this.changeDetectorRef.detectChanges();
      showAlert("Tour has been activated.", "success");
    })
  }

  approveTour(tour: Tour) {
    if (! confirm("Are you sure to approve this tour?")) {
      return false;
    }

    Meteor.call("tours.approve", tour._id, (err, res) => {
      if (err) {
        showAlert("Error calling tours.approved", "danger");
        return;
      }
      tour.approved = true;
      tour.rejected = false;
      //angular2 waits for dom event to detect changes automatically
      //so trigger change detection manually to update dom
      this.changeDetectorRef.detectChanges();
      showAlert("Tour has been approved.", "success");
    })
  }

  disapproveTour(tour: Tour) {
    if (! confirm("Are you sure to disapprove this tour?")) {
      return false;
    }

    Meteor.call("tours.disapprove", tour._id, (err, res) => {
      if (err) {
        showAlert("Error calling tours.approved", "danger");
        return;
      }
      tour.approved = false;
      tour.rejected = true;
      //angular2 waits for dom event to detect changes automatically
      //so trigger change detection manually to update dom
      this.changeDetectorRef.detectChanges();
      showAlert("Tour has been disapproved.", "success");
    })
  }

  deactivate(tour: Tour) {
    if (! confirm("Are you sure to deactivate this tour?")) {
      return false;
    }

    Meteor.call("tours.deactivate", tour._id, (err, res) => {
      if (err) {
        showAlert("Error calling tours.deactivate", "danger");
        return;
      }
      tour.active = false;
      //angular2 waits for dom event to detect changes automatically
      //so trigger change detection manually to update dom
      this.changeDetectorRef.detectChanges();
      showAlert("Tour has been deactivated.", "success");
    })
  }

  /*deleteTour(tour: Tour) {
    if (! confirm("Are you sure to delete this tour?")) {
      return false;
    }
    // console.log(tour._id);
    Meteor.call("tours.delete", tour._id, (err, res) => {
      if (err) {
        showAlert("Error calling tours.delete", "danger");
        return;
      }
      //set user.deleted to true to remove from list
      tour.deleted = true;
      //angular2 waits for dom event to detect changes automatically
      //so trigger change detection manually to update dom
      this.changeDetectorRef.detectChanges();
      showAlert("Tour has been removed.", "success");
    })
  }*/

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
