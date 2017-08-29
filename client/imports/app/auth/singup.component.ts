import {Component, OnInit, NgZone} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Accounts } from 'meteor/accounts-base';
import {MeteorComponent} from 'angular2-meteor';
import { Title } from '@angular/platform-browser';
import {validateEmail, validatePhoneNum, validateFirstName, validatePassword} from "../../validators/common";

import template from './signup.component.html';

@Component({
  selector: 'signup',
  template
})
export class SignupComponent extends MeteorComponent implements OnInit {
  signupForm: FormGroup;
  error: string;

  constructor(private router: Router, private titleService: Title, private zone: NgZone, private formBuilder: FormBuilder) {
    super();
  }

    ngOnInit() {
      this.titleService.setTitle("Signup | Atorvia");
        this.signupForm = this.formBuilder.group({
          email: ['', Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(50), validateEmail])],
          password: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(30), validatePassword])],
          firstName: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(30), validateFirstName])],
          lastName: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(30), validateFirstName])],
        });

        this.error = '';
    }

    signup() {
        if (this.signupForm.valid) {
          let userData = {
            email: this.signupForm.value.email,
            passwd: this.signupForm.value.password,
            profile: {
              firstName: this.signupForm.value.firstName,
              lastName: this.signupForm.value.lastName
            }
          };
          this.call("users.insert", userData, ['super-admin'], (err, res) => {
            this.zone.run(() => {
              if (err) {
                  this.error = err;
              } else {
                console.log("new user-id:", res);
                this.router.navigate(['/login']);
              }
            });
          });
        }
    }
}
