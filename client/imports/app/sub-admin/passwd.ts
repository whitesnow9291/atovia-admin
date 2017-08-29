import { Meteor } from 'meteor/meteor';
import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from "rxjs";
import { MeteorComponent } from 'angular2-meteor';
import { User } from "../../../../both/models/user.model";
import {showAlert} from "../shared/show-alert";
import { Title } from '@angular/platform-browser';
import {validatePassword} from "../../validators/common";

import template from "./passwd.html";

@Component({
  selector: '',
  template
})
export class PasswordSubadminComponent extends MeteorComponent implements OnInit {
  paramsSub: Subscription;
  userId: string;
  user: User;
  passwdForm: FormGroup;
  error: string;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private zone: NgZone,
    private titleService: Title,
    private formBuilder: FormBuilder)
  {
    super();
  }

  ngOnInit() {
    this.paramsSub = this.route.params
      .map(params => params['id'])
      .subscribe(id => {
        this.userId = id;
        //console.log("patientId:", patientId);

        this.call("users.findOne", id, (err, res)=> {
            if (err) {
                //console.log("error while fetching patient data:", err);
                showAlert("Error while fetching user data.", "danger");
                return;
            }

            this.titleService.setTitle("Change Password | Atorvia");
            this.user = res;
        });
    });

    this.passwdForm = this.formBuilder.group({
      password: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(30), validatePassword])],
      repeatPassword: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(30), validatePassword])]
    }, {validator: this.matchPasswords('password', 'repeatPassword')});

    this.error = '';
  }

  matchPasswords(passwordKey: string, confirmPasswordKey: string) {
    return (group: FormGroup): {[key: string]: any} => {
      let password = group.controls[passwordKey];
      let confirmPassword = group.controls[confirmPasswordKey];
      //console.log("passwd:", password.value);
      //console.log("repeat passwd:", confirmPassword.value);

      if (password.value !== confirmPassword.value) {
        //console.log("password mismatch");
        return {
          "password.mismatch": false
        };
      } else {
        return null;
      }
    }
  }

  onSubmit() {
    if (!this.passwdForm.valid) {
      // console.log(this.passwdForm);
      showAlert("Invalid form-data supplied.", "danger");
      return;
    }

    this.call("users.resetPasswd", this.userId, this.passwdForm.value.password, (err, res) => {
      if (err) {
        this.zone.run(() => {
          this.error = err;
        });
      } else {
        showAlert("User password updated successfully.", "success");
        this.zone.run(() => {
          this.router.navigate(['/sub-admin/list']);
        });
      }
    });
  }
}
