import { Meteor } from 'meteor/meteor';
import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MeteorComponent } from 'angular2-meteor';
import { showAlert } from "../shared/show-alert";
import { validateEmail, validatePhoneNum, validateFirstName, validatePassword } from "../../validators/common";

import template from "./create.html";

@Component({
  selector: '',
  template
})
export class CreateSubadminComponent extends MeteorComponent implements OnInit {
  createForm: FormGroup;
  error: string;

  constructor(private router: Router, private route: ActivatedRoute, private zone: NgZone, private formBuilder: FormBuilder) {
    super();
  }

  ngOnInit() {
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

    // insert new user
    let placeData = {
      name: this.createForm.value.name,
      slug: this.slugify(this.createForm.value.name),
      address: this.createForm.value.address,
      geometry: {
        lat: this.createForm.value.lat,
        lng: this.createForm.value.lng
      }
    };
    this.call("places.insert", placeData, (err, res) => {
      if (err) {
        this.zone.run(() => {
          this.error = err;
        });
      } else {
        //console.log("new user-id:", res);
        showAlert("New place saved successfully.", "success");
        this.zone.run(() => {
          this.router.navigate(['/places/list']);
        });
      }
    });
  }
  // finish insert new user

  slugify(text)
    {
      return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
    }
}
