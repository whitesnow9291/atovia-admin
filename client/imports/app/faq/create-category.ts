import { Meteor } from 'meteor/meteor';
import { Component, OnInit, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MeteorComponent } from 'angular2-meteor';
import { Subscription } from "rxjs";
import { FAQCategory } from "../../../../both/models/faq.model";
import { showAlert } from "../shared/show-alert";
import { validateSlug } from "../../validators/common";
import { Roles } from 'meteor/alanning:roles';

import template from "./create-category.html";

declare var jQuery: any;

@Component({
    selector: '',
    template
})
export class CreateFAQCategoryComponent extends MeteorComponent implements OnInit, AfterViewInit, OnDestroy {
    paramsSub: Subscription;
    faqcategoryId: string;
    faqcategoryForm: FormGroup;
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
                this.faqcategoryId = id;
                //console.log("patientId:", patientId);

                if (!this.faqcategoryId) {
                    //console.log("no page-id supplied");
                    return;
                }

                this.call("faqcategories.findOne", id, (err, res) => {
                    if (err || typeof res == "undefined" || res._id !== id) {
                        this.zone.run(() => {
                          showAlert("Error while fetching faq data.", "danger");
                          this.router.navigate(['/faqcategory/list']);
                        });
                        return;
                    }
                    this.faqcategoryForm.controls['title'].setValue(res.title);
                    this.faqcategoryForm.controls['summary'].setValue(res.summary);
                });

            });

        this.faqcategoryForm = this.formBuilder.group({
            title: ['', Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(255)])],
            summary: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(255)])],
        });

        this.error = '';
    }

    onSubmit() {
        if (!this.faqcategoryForm.valid) {
            console.log(this.faqcategoryForm);
            showAlert("Invalid form-data supplied.", "danger");
            return;
        }

        // insert new page
        if (!this.faqcategoryId) {
            let faqcategoryData = {
                title: this.faqcategoryForm.value.title,
                summary: this.faqcategoryForm.value.summary,
                ownerId: Meteor.userId(),
                active: true,
                deleted: false
            };
            this.call("faqcategories.insert", faqcategoryData, (err, res) => {
              this.zone.run(() => {
                if (err) {
                  this.error = err;
                } else {
                  showAlert("New faqcategory saved successfully.", "success");
                  this.router.navigate(['/faqcategory/list']);
                }
              });
            });
        }
        // finish insert new faq
        // update faq data
        else {
            let faqcategoryData = {
                title: this.faqcategoryForm.value.title,
                summary: this.faqcategoryForm.value.summary,
            }
            this.call("faqcategories.update", this.faqcategoryId, faqcategoryData, (err, res) => {
              this.zone.run(() => {
                if (err) {
                  this.error = err;
                } else {
                  showAlert("Faqcategory data updated successfully.", "success");
                  this.router.navigate(['/faqcategory/list']);
                }
              });
            });
        }
        // finish update faq data
    }

    ngAfterViewInit() {
        jQuery(function ($) {
            $('.collapsible').collapsible();
        })
    }

    initializeJS() {
        jQuery('.collapsible').collapsible();
    }

    ngOnDestroy() {
        this.paramsSub.unsubscribe();
    }
}
