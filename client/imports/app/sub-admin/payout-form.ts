import { Meteor } from 'meteor/meteor';
import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from "rxjs";
import { MeteorComponent } from 'angular2-meteor';
import { User } from "../../../../both/models/user.model";
import { showAlert } from "../shared/show-alert";
import { Title } from '@angular/platform-browser';
import { validatePassword } from "../../validators/common";

import template from "./payout-form.html";

@Component({
  selector: '',
  template
})
export class PayoutSubadminComponent extends MeteorComponent implements OnInit {
  paramsSub: Subscription;
  userId: string;
  user: User;
  payoutForm: FormGroup;
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

            this.titleService.setTitle("Payout Form | Atorvia");
            this.user = res;
        });
    });

    this.payoutForm = this.formBuilder.group({
      amount: ['', Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(7)])],
      title: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(255)])],
      fromDate: ['', Validators.compose([Validators.required])],
      toDate: ['', Validators.compose([Validators.required])],
      status: ['', Validators.compose([Validators.required])]
    })

    this.error = '';
  }

  payout() {
    if (! this.payoutForm.valid) {
      showAlert("Please fill the payout form completly.", "danger");
      return;
    }

    let payoutData = {
      supplierId: this.userId,
      amount: Number(this.payoutForm.value.amount),
      title: this.payoutForm.value.title,
      fromDate: new Date(this.payoutForm.value.fromDate),
      toDate: new Date(this.payoutForm.value.toDate),
      status: this.payoutForm.value.status
    }

    this.call("payouts.insert", payoutData, (err, res) => {
      if (! err) {
        showAlert("Payout entry created successfully.", "success");
        this.zone.run(() => {
          this.router.navigate(['/sub-admin/view', this.userId]);
        });
      }
    })
  }
}
