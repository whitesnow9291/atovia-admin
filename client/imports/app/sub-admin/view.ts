import { Meteor } from "meteor/meteor";
import { Component, OnInit, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MeteorComponent } from 'angular2-meteor';
import { PaginationService } from "ng2-pagination";
import { Title } from '@angular/platform-browser';
import { Observable, Subscription, Subject, BehaviorSubject } from "rxjs";
import { User } from "../../../../both/models/user.model";
import { Payout } from "../../../../both/models/payout.model";
import { showAlert } from "../shared/show-alert";

import template from "./view.html";

interface Pagination {
  limit: number;
  skip: number;
}

interface Options extends Pagination {
  [key: string]: any
}

@Component({
  selector: '',
  template
})
export class ViewSubadminComponent extends MeteorComponent implements OnInit {
  paramsSub: Subscription;
  userId: string;
  user: User;
  error: string;
  bookingsStats: any[] = null;
  payouts: Payout[] = null;
  payoutsSize: number = -1;
  pageSize: Subject<number> = new Subject<number>();
  curPage: Subject<number> = new Subject<number>();
  optionsSub: Subscription;
  monthsArr: string[] = [
    "",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  supplierAppUrl: string;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private zone: NgZone,
    private titleService: Title,
    private paginationService: PaginationService) {
    super();
    this.supplierAppUrl = Meteor.settings.public["supplierAppUrl"];
  }

  ngOnInit() {
    this.paramsSub = this.route.params
      .map(params => params['id'])
      .subscribe(id => {
          this.userId = id;
          //console.log("patientId:", patientId);

          this.call("users.findOne", id, (err, res)=> {
              if (err || typeof res == "undefined" || res._id !== id) {
                  //console.log("error while fetching patient data:", err);
                  showAlert("Error while fetching user data.", "danger");
                  this.zone.run(() => {
                    this.router.navigate(['/sub-admin/list']);
                  });
                  return;
              }

              let user = res.profile.supplier.companyName;
              this.titleService.setTitle(user + " | Atorvia");
              this.user = res;
              this.fetchBookingsStats(id);
          });

      });

    this.error = '';
  }

  private fetchBookingsStats(supplierId) {
    this.call("bookings.statistics", supplierId, (err, res) => {
      if (err) {
          //console.log("error while fetching patient data:", err);
          showAlert("Error while fetching bookings stats.", "danger");
          return;
      }
      this.bookingsStats = res;
      this.fetchPayouts(supplierId);
    });
  }

  private fetchPayouts(supplierId) {
    let options = {
        limit: 5,
        curPage: 1
    };

    this.paginationService.register({
    id: "payouts",
    itemsPerPage: 5,
    currentPage: options.curPage,
    totalItems: this.payoutsSize
    });

    this.optionsSub = Observable.combineLatest(
        this.pageSize,
        this.curPage
    ).subscribe(([pageSize, curPage]) => {
        const options: Options = {
            limit: pageSize as number,
            skip: ((curPage as number) - 1) * (pageSize as number),
            sort: { "createdAt": -1 }
        };

        this.paginationService.setCurrentPage("payouts", curPage as number);

        jQuery(".loading").show();
        this.call("payouts.find", options, {supplierId: supplierId}, (err, res) => {
          jQuery(".loading").hide();
          if (err) {
            showAlert("Error while fetching payouts data.", "danger");
            return;
          }
          this.payouts = res.data;
          this.payoutsSize = res.count;
          this.paginationService.setTotalItems("payouts", this.payoutsSize);
        });
    });

    this.pageSize.next(options.limit);
    this.curPage.next(options.curPage);
  }

  onPageChanged(page: number): void {
      this.curPage.next(page);
  }

  verifyCertificate (user: User) {
    if (! confirm("Are you sure to verify the supplier's certificate?")) {
        return false;
    }

    this.call("verifyAgentCertificate", this.userId, (err, res) => {
      if (! err) {
        showAlert("Agent Certificate has been verified successfully.", "success");

        user.profile.supplier.agentCertificate.verified = true;
      } else {
        showAlert("Error while processing your request.", "danger");
      }
    })
  }

  unverifyCertificate (user: User) {
    if (! confirm("Are you sure to unverify the supplier's certificate?")) {
        return false;
    }

    this.call("unverifyAgentCertificate", this.userId, (err, res) => {
      if (! err) {
        showAlert("Agent Certificate has been unverified successfully.", "success");

        user.profile.supplier.agentCertificate.verified = false;
      } else {
        showAlert("Error while processing your request.", "danger");
      }
    })
  }

  verifyIdentity(user: User) {
    if (! confirm("Are you sure to verify the supplier's identity?")) {
      return false;
    }

    this.call("verifyAgentIdentity", this.userId, (err, res) => {
      if (! err) {
        showAlert("Agent Identity has been verified successfully.", "success");

        user.profile.supplier.agentIdentity.verified = true;
      } else {
        showAlert("Error while processing your request.", "danger");
      }
    })
  }

  unverifyIdentity(user: User) {
    if (! confirm("Are you sure to unverify the supplier's identity?")) {
      return false;
    }

    this.call("unverifyAgentIdentity", this.userId, (err, res) => {
      if (! err) {
        showAlert("Agent Identity has been unverified successfully.", "success");

        user.profile.supplier.agentIdentity.verified = false;
      } else {
        showAlert("Error while processing your request.", "danger");
      }
    })
  }
}
