import { Meteor } from "meteor/meteor";
import {Component, OnDestroy, NgZone } from "@angular/core";
import { Subscription } from "rxjs";
import { FormBuilder, FormGroup, FormArray, Validators as Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MeteorComponent } from 'angular2-meteor';
import { ChangeDetectorRef } from "@angular/core";
import { Booking } from "../../../../both/models/booking.model";
import { User } from "../../../../both/models/user.model";
import { Title } from '@angular/platform-browser';
import {showAlert} from "../shared/show-alert";

import template from './view.html';

declare var jQuery:any;

@Component({
  selector: '',
  template
})
export class ViewBookingComponent extends MeteorComponent {
  refundForm: FormGroup;
  booking: Booking;
  paramsSub: Subscription;
  bookingId: string;
  owner: User;
  error: string;
  isProcessing: boolean = false;
  initializedModal: boolean = false;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private zone: NgZone,
    private formBuilder: FormBuilder,
    private titleService: Title,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit() {
    this.paramsSub = this.route.params
      .map(params => params['id'])
      .subscribe(id => {
          this.bookingId = id;
          //console.log("patientId:", patientId);

          this.call("bookings.findOne", {_id: id}, {with: {tour: true}}, (err, res)=> {
              if (err || typeof res == "undefined" || typeof res.booking == "undefined" || res.booking._id !== id) {
                  showAlert("Error while fetching tour data.", "danger");
                  this.zone.run(() => {
                    this.router.navigate(['/bookings/list']);
                  });
                  return;
              }

              let tour = res.booking.tour.name;
              let name = tour.toUpperCase();
              this.titleService.setTitle("Booking - " + name +" | Atorvia");
              this.booking = <Booking>res.booking;
              this.owner = <User>res.owner;
          });
      });

    this.error = '';

    this.refundForm = this.formBuilder.group({
      amount: ['', Validators.compose([Validators.required])],
      comments: ['', Validators.compose([Validators.maxLength(255)])]
    });
  }

  getBookingStatus(item) {
    let retVal = null;

    // check completed flag
    if (new Date(item.startDate) < new Date()) {
      item.completed = true;
    }

    if (! item.paymentInfo || item.paymentInfo.status != 'approved') {
      retVal = "Unpaid";
    } else if (item.cancelled == true && item.refunded !== true) {
      retVal = "Refund Requested";
    } else if (item.cancelled == true && item.refunded == true) {
      retVal = "Cancelled";
    } else if (item.confirmed !== true) {
        retVal = "Pending";
    } else if (item.confirmed === true && item.completed !== true) {
        retVal = "Confirmed";
    } else if (item.completed === true) {
        retVal = "Completed";
    }

    return retVal;
  }

  denyRefund() {
    let booking = this.booking;

    this.call("bookings.denyRefund", booking._id, (err, res) => {
      if (err) {
        showAlert(err.reason, "danger");
        return;
      }

      booking.refunded = true;
      this.zone.run(() => {
        showAlert("Refund request has been declined.", "success")
        this.router.navigate(['/bookings/list']);
      });
    });
  }

  processRefund() {
    let refundAmount = this.refundForm.value.amount;
    let comments = this.refundForm.value.comments;
    let booking = this.booking;

    if (! this.refundForm.valid) {
      showAlert("Invalid amount supplied.", "danger");
      return;
    }
    if (refundAmount <= 0) {
      showAlert("Amount entered is invalid.", "danger");
      return;
    }
    if(refundAmount > booking.totalPrice) {
      showAlert("Refund amount is greater than total amount paid for booking.", "danger");
      return;
    }


    if (this.isProcessing) {
      showAlert("Your previous request is under processing. Please wait for a while.", "info");
      return false;
    }

    this.isProcessing = true;
    this.changeDetectorRef.detectChanges();
    let adminAppUrl = Meteor.settings.public["adminAppUrl"];
    HTTP.call("POST", adminAppUrl + "/api/1.0/paypal/payment/refund", {
      data: {refundAmount, comments},
      params: {
        paymentId: booking.paymentInfo.gatewayTransId
      }
    }, (error, result) => {
      this.isProcessing = false;
      this.changeDetectorRef.detectChanges();
      let response = JSON.parse(result.content);
      if (! response.success) {
        showAlert("Error while processing refund request. Please review gateway configurations and try again after some time.", "danger");
        return;
      } else {
        booking.refunded = true;
        this.zone.run(() => {
          showAlert("Refund request has been processed successfully. Payment will be sent to customer based on processing time of gateway.", "success")
          this.router.navigate(['/bookings/list']);
        });
      }
    });
    jQuery(".modal").modal('close');
  }

  initializeModal() {
    if (this.initializedModal) {
      return;
    }

    this.initializedModal = true;
    Meteor.setTimeout(function() {
      jQuery(function($){
        $('.modal').modal();
      });
    }, 500);
  }
}
