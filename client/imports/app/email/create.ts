import { Meteor } from 'meteor/meteor';
import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MeteorComponent } from 'angular2-meteor';
import { Subscription } from "rxjs";
import { Email } from "../../../../both/models/email.model";
import { validateCode, validateEmail } from "../../validators/common";
import { showAlert } from "../shared/show-alert";
import template from "./create.html";

@Component({
  selector: '',
  template
})
export class CreateEmailComponent extends MeteorComponent implements OnInit, OnDestroy {
  paramsSub: Subscription;
  emailId: string;
  emailForm: FormGroup;
  error: string;

  constructor(
      private router: Router,
      private route: ActivatedRoute,
      private zone: NgZone,
      private formBuilder: FormBuilder
  ) {
    super();
  }

  ngOnInit() {
    this.paramsSub = this.route.params
      .map(params => params['id'])
      .subscribe(id => {
          this.emailId = id;
          //console.log("patientId:", patientId);

          if (! this.emailId) {
            //console.log("no email-id supplied");
            return;
          }

          this.call("emails.findOne", id, (err, res)=> {
              if (err) {
                this.zone.run(() => {
                  showAlert("Error while fetching email data.", "danger");
                  this.router.navigate(['/email/list']);
                });
                return;
              }
              this.emailForm.controls['title'].setValue(res.title);
              this.emailForm.controls['heading'].setValue(res.heading);
              this.emailForm.controls['code'].setValue(res.code);
              this.emailForm.controls['senderId'].setValue(res.senderId);
              this.emailForm.controls['summary'].setValue(res.summary);
              this.emailForm.controls['contents'].setValue(res.contents);
          });

      });

    this.emailForm = this.formBuilder.group({
      title: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(255)])],
      heading: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(255)])],
      code: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(50), validateCode])],
      senderId:['', Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(50), validateEmail])],
      summary: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(255)])],
      contents: ['', Validators.compose([Validators.required])],
    });

    this.error = '';

    // CKEDITOR.replace( 'contents' );
  }

  onSubmit() {
    if (!this.emailForm.valid) {
      console.log(this.emailForm);
      showAlert("Invalid form-data supplied.", "danger");
      return;
    }

    // insert new email
    if (!this.emailId) {
      let emailData = {
        title: this.emailForm.value.title,
        heading: this.emailForm.value.heading,
        code: this.emailForm.value.code,
        senderId:this.emailForm.value.senderId,
        summary: this.emailForm.value.summary,
        contents: this.emailForm.value.contents,
        ownerId: Meteor.userId(),
        active: true,
        deleted: false
      };
      this.call("emails.insert", emailData, (err, res) => {
        this.zone.run(() => {
          if (err) {
              this.error = err;
          } else {
            showAlert("New email saved successfully.", "success");
              this.router.navigate(['/email/list']);
          }
        });
      });
    }
    // finish insert new email
    // update email data
    else {
      let emailData = {
        title: this.emailForm.value.title,
        heading: this.emailForm.value.heading,
        code: this.emailForm.value.code,
        senderId:this.emailForm.value.senderId,
        summary: this.emailForm.value.summary,
        contents: this.emailForm.value.contents,
      }
      this.call("emails.update", this.emailId, emailData, (err, res) => {
        this.zone.run(() => {
          if (err) {
              this.error = err;
          } else {
            showAlert("Email data updated successfully.", "success");
            this.router.navigate(['/email/list']);
          }
        });
      });
    }
    // finish update email data
  }

  ngOnDestroy() {
    this.paramsSub.unsubscribe();
  }
}
