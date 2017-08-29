import { Meteor } from 'meteor/meteor';
import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MeteorComponent } from 'angular2-meteor';
import { Subscription } from "rxjs";
import { Page } from "../../../../both/models/page.model";
import {showAlert} from "../shared/show-alert";

import template from "./view.html";

@Component({
  selector: '',
  template
})
export class ViewPageComponent extends MeteorComponent implements OnInit, OnDestroy {
  paramsSub: Subscription;
  pageId: string;
  page: Page;
  error: string;

  constructor(
      private router: Router, 
      private route: ActivatedRoute, 
      private zone: NgZone
  ) {
    super();
  }

  ngOnInit() {
    this.paramsSub = this.route.params
      .map(params => params['id'])
      .subscribe(id => {
          this.pageId = id;
          //console.log("patientId:", patientId);
  
          if (! this.pageId) {
            showAlert("Invalid page-id supplied.");
            return;
          }

          this.call("pages.findOne", id, (err, res)=> {
              if (err) {
                  //console.log("error while fetching patient data:", err);
                  showAlert("Error while fetching page data.", "danger");
                  return;
              }

              this.page = res;
          });

      });

    this.error = '';
  }

  ngOnDestroy() {
    this.paramsSub.unsubscribe();
  }
}