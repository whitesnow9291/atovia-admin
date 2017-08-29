import { Meteor } from "meteor/meteor";
import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Accounts } from 'meteor/accounts-base';
import { MeteorComponent } from 'angular2-meteor';
import { Title } from '@angular/platform-browser';
import { matchingPasswords, validatePassword } from '../../validators/common';
import { showAlert } from "../shared/show-alert";

import template from './changepassword.html';

@Component({
  selector: '',
  template
})
export class PasswordComponent extends MeteorComponent implements OnInit {
  passwordForm: FormGroup;
  error: string;

  constructor(private router: Router, private zone: NgZone, private formBuilder: FormBuilder,private titleService: Title) {
    super();
  }

  ngOnInit() {
    this.titleService.setTitle("Change Password | Atorvia");
    this.passwordForm = this.formBuilder.group({
      oldpassword: ['', Validators.compose([Validators.required])],
      newPassword: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(30), validatePassword])],
      confirmPassword: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(30), validatePassword])],
    }, { validator: matchingPasswords('newPassword', 'confirmPassword') });

    this.error = '';
  }

  changePassword() {
    if (!this.passwordForm.valid) {
      showAlert("Invalid formData supplied.", "danger");
      return;
    }

    Accounts.changePassword(this.passwordForm.value.oldpassword, this.passwordForm.value.newPassword, (err) => {
      //console.log("res:", err);
      if (err) {
        this.error = err;
        showAlert(err.message, "danger");
      } else {
        showAlert("Password updated successfully.", "success");
        this.router.navigate(['/account/viewprofile']);
      }
    });
  }
}
