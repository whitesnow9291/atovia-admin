import { Meteor } from "meteor/meteor";
import { Component, OnInit, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MeteorComponent } from 'angular2-meteor';
import { Observable, Subscription, Subject, BehaviorSubject } from "rxjs";
import { Title } from '@angular/platform-browser';
import { User } from "../../../../both/models/user.model";
import { showAlert } from "../shared/show-alert";

import template from "./view-user.html";


@Component({
  selector: '',
  template
})
export class ViewCustomerComponent extends MeteorComponent implements OnInit {
  paramsSub: Subscription;
  userId: string;
  user: User;
  error: string;
  optionsSub: Subscription;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private titleService: Title,
    private zone: NgZone) {
    super();
  }

  ngOnInit() {
    this.paramsSub = this.route.params
      .map(params => params['id'])
      .subscribe(id => {
          this.userId = id;
          //console.log("patientId:", patientId);

          this.call("users.findOne", id, (err, res)=> {
              if (err || typeof res == "undefined" || res._id !== id) {
                  //console.log("error while fetching patient data:", err);
                  showAlert("Error while fetching user data.", "danger");
                  this.zone.run(() => {
                    this.router.navigate(['/sub-admin/list']);
                  });
                  return;
              }

              let user = res.profile.fullName;
              this.titleService.setTitle(user + " | Atorvia");
              this.user = res;
          });
      });

    this.error = '';
  }

}
