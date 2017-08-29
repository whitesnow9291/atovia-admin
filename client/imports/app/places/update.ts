import { Meteor } from "meteor/meteor";
import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MeteorComponent } from 'angular2-meteor';
import { Subscription } from "rxjs";
import { User } from "../../../../both/models/user.model";
import {showAlert} from "../shared/show-alert";
import {validateEmail, validatePhoneNum, validateFirstName} from "../../validators/common";
import { Roles } from 'meteor/alanning:roles';

import template from "./update.html";

@Component({
  selector: '',
  template
})
export class UpdateSubadminComponent extends MeteorComponent implements OnInit {
  paramsSub: Subscription;
  placeId: string;
  createForm: FormGroup;
  error: string;

  constructor(private router: Router, private route: ActivatedRoute, private zone: NgZone, private formBuilder: FormBuilder) {
    super();

  }

  ngOnInit() {
    this.paramsSub = this.route.params
      .map(params => params['id'])
      .subscribe(id => {
          this.placeId = id;
          //console.log("patientId:", patientId);

          this.call("places.findOne", id, (err, res)=> {
              if (err || typeof res == "undefined" || res._id !== id) {
                  //console.log("error while fetching patient data:", err);
                  showAlert("Error while fetching user data.", "danger");
                  this.zone.run(() => {
                    this.router.navigate(['/places/list']);
                  });
                  return;
              }

              this.createForm.controls['name'].setValue(res.name);
              this.createForm.controls['lat'].setValue(res.geometry.lat);
              this.createForm.controls['lng'].setValue(res.geometry.lng);
              this.createForm.controls['address'].setValue(res.address);
          });

      });

    this.createForm = this.formBuilder.group({
      lat: ['', Validators.compose([])],
      lng: ['', Validators.compose([])],
      name: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(255)])],
      address: ['', Validators.compose([Validators.required])]
    });

    this.error = '';
  }


  onSubmit() {

    if (!this.createForm.valid) {
      showAlert("Invalid form-data supplied.", "danger");
      return;
    }

    // update old place
    let placeData = {
      name: this.createForm.value.name,
      address: this.createForm.value.address,
      geometry: {
        lat: this.createForm.value.lat,
        lng: this.createForm.value.lng
      }
    };

    this.call("places.update", this.placeId, placeData, (err, res) => {
      if (err) {
        this.zone.run(() => {
          this.error = err;
        });
      } else {
        showAlert("Place record updated successfully.", "success");
        this.zone.run(() => {
          this.router.navigate(['/places/list']);
        });
      }
    });
    // finish update old user
  }
}
