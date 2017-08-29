import { Meteor } from 'meteor/meteor';
import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from "rxjs";
import { ChangeDetectorRef } from "@angular/core";
import { Title } from '@angular/platform-browser';
import { MeteorComponent } from 'angular2-meteor';
import { Currency } from "../../../../both/models/currency.model";
import { showAlert } from "../shared/show-alert";

import template from "./edit.html";

@Component({
  selector: '',
  template
})
export class EditCurrencyComponent extends MeteorComponent implements OnInit {
  paramsSub: Subscription;
  currencyId: string;
  currency: Currency;
  currencyForm: FormGroup;
  error: string;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private zone: NgZone,
    private titleService: Title,
    private changeDetectorRef: ChangeDetectorRef,
    private formBuilder: FormBuilder)
  {
    super();
  }

  ngOnInit() {
    this.titleService.setTitle("Edit Currency Form | Atorvia");
    this.paramsSub = this.route.params
      .map(params => params['id'])
      .subscribe(id => {
        this.currencyId = id;
        //console.log("patientId:", patientId);

        this.call("currency.findOne", id, (err, res)=> {
            if (err) {
                //console.log("error while fetching patient data:", err);
                showAlert("Error while fetching currency data.", "danger");
                return;
            }

            this.currencyForm.controls['amount'].setValue(res.value);
            this.currencyForm.controls['fromCurrency'].setValue(res.from);
            this.currencyForm.controls['toCurrency'].setValue(res.to);
            this.currency = res;
            this.changeDetectorRef.detectChanges();
        });
    });

    this.currencyForm = this.formBuilder.group({
      amount: ['', Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(7)])],
      fromCurrency: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(4)])],
      toCurrency: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(4)])]
    });

    this.error = '';
  }

  changeCurrency() {
    let currencyData = {
      value: this.currencyForm.value.amount,
      from: this.currencyForm.value.fromCurrency,
      to: this.currencyForm.value.toCurrency
    }

    this.call("currency.update", this.currencyId, currencyData, (err, res) => {
      if (! err) {
        showAlert("Currency Rate has been update successfully.", "success");
        this.zone.run(() => {
          this.router.navigate(['/currency/list']);
        })
      } else {
        console.log("Error updating currency rate.", err);
      }
    })
  }
}
