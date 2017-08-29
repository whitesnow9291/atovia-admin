import {Component, OnInit, NgZone} from '@angular/core';
import { MeteorComponent } from 'angular2-meteor';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Meteor } from 'meteor/meteor';
import { Title } from '@angular/platform-browser';
import {validateEmail, validatePhoneNum, validateFirstName, validatePassword} from "../../validators/common";

import template from './login.component.web.html';

@Component({
  selector: 'login',
  template,
  providers: []
})
export class LoginComponent extends MeteorComponent implements OnInit {
    loginForm: FormGroup;
    error: string;

    constructor(private router: Router, private titleService: Title, private zone: NgZone, private formBuilder: FormBuilder) {
        super();
    }

    ngOnInit() {
        this.titleService.setTitle("Login | Atorvia");
        this.loginForm = this.formBuilder.group({
          email: ['', Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(50), validateEmail])],
          password: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(30)])]
        });

        this.error = '';
    }

    login() {
        if (this.loginForm.valid) {
            Meteor.loginWithPassword(this.loginForm.value.email, this.loginForm.value.password, (err) => {
              this.zone.run(() => {
                if (err) {
                      this.error = err;
                } else {
                    this.router.navigate(['/dashboard']);
                }
              });
            });
        }
    }
}
