import { Meteor } from "meteor/meteor";
import { Component, OnInit, OnDestroy, NgZone, AfterViewInit } from "@angular/core";
import { Observable, Subscription, Subject, BehaviorSubject } from "rxjs";
import { MeteorObservable } from "meteor-rxjs";
import { InjectUser } from "angular2-meteor-accounts-ui";
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MeteorComponent } from 'angular2-meteor';
import { Title } from '@angular/platform-browser';
import { ChangeDetectorRef } from "@angular/core";
import { LocalStorageService } from 'angular-2-local-storage';
import { Currency } from "../../../../both/models/currency.model";
import { showAlert } from "../shared/show-alert";
import { Roles } from 'meteor/alanning:roles';

import template from "./list.html";

declare var jQuery:any;

@Component({
  selector: '',
  template
})
export class ListCurrencyComponent extends MeteorComponent implements OnInit, AfterViewInit {
    items: Currency[];
    itemsSize: number = -1;
    constructor(private router: Router,
        private route: ActivatedRoute,
        private ngZone: NgZone,
        private titleService: Title,
        private changeDetectorRef: ChangeDetectorRef,
        private localStorageService: LocalStorageService
    ) {
        super();
    }

    ngOnInit() {
      this.titleService.setTitle("Currency List | Atorvia");
        this.call("currency.find", {}, (err, res) => {
          if (err) {
            console.log("error calling currency.find", err);
            return;
          }

          this.items = res.data;
          this.itemsSize = res.count;
        })
    }

    ngAfterViewInit() {

    }
  }
