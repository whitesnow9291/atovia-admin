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

import template from "./create-question.html";

declare var jQuery: any;

@Component({
    selector: '',
    template
})
export class CreateFAQComponent extends MeteorComponent implements OnInit, AfterViewInit, OnDestroy {
    paramsSub: Subscription;
    faqCategories: FAQCategory[];
    faqcategoryId: string;
    faqCategory: FAQCategory;
    questionId: string;
    createForm: FormGroup;
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
            .subscribe(params => {
                this.faqcategoryId = params["catId"];
                if (typeof params["quesId"] != "undefined") {
                    this.questionId = params["quesId"];
                }

                if (!this.faqcategoryId) {
                    showAlert("Error while fetching faq data.", "danger");
                    this.zone.run(() => {
                        this.router.navigate(['/faqcategory/list']);
                    });
                    return;
                }

                this.call("faqcategories.findOne", this.faqcategoryId, (err, res) => {
                    if (err || typeof res == "undefined" || res._id !== this.faqcategoryId) {
                        this.zone.run(() => {
                          showAlert("Error while fetching faq category.", "danger");
                          this.router.navigate(['/faqcategory/list']);
                        });
                        return;
                    }
                    this.faqCategory = res;
                });

                if (!!this.questionId) {
                    this.call("faqs.findOne", this.questionId, (err, res) => {
                        if (err || typeof res == "undefined" || res._id !== this.questionId) {
                            this.zone.run(() => {
                              showAlert("Error while fetching FAQ data.", "danger");
                              this.router.navigate(['/faqcategory/list']);
                            });
                            return;
                        }
                        this.faqCategory = res;
                        this.createForm.controls['categoryId'].setValue(res.categoryId);
                        this.createForm.controls['question'].setValue(res.question);
                        this.createForm.controls['answer'].setValue(res.answer);
                    });
                }

            });

        this.createForm = this.formBuilder.group({
            categoryId: ['', Validators.compose([Validators.required])],
            question: ['', Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(255)])],
            answer: ['', Validators.compose([Validators.required, Validators.minLength(8)])],
        });

        this.error = '';

        this.loadCategories();
    }

    private loadCategories() {
        jQuery(".loading").show();
        this.call("faqcategories.find", {limit: 0,  skip: 0, order: {title: 1} }, {}, "", (err, res) => {
            //console.log("patients.find() done");
            jQuery(".loading").hide();
            if (err) {
                //console.log("error while fetching patient list:", err);
                showAlert("Error while fetching categories list.", "danger");
                return;
            }
            this.faqCategories = res.data;
        });
    }

    onSubmit() {
        if (!this.createForm.valid || !this.faqcategoryId) {
            console.log(this.createForm);
            showAlert("Invalid form-data supplied.", "danger");
            return;
        }

        // insert new page
        if (!this.questionId) {
            let formData = {
                question: this.createForm.value.question,
                answer: this.createForm.value.answer,
                ownerId: Meteor.userId(),
                categoryId: this.createForm.value.categoryId,
                active: true,
                deleted: false
            };
            this.call("faqs.insert", formData, (err, res) => {
              this.zone.run(() => {
                if (err) {
                  this.error = err;
                } else {
                  showAlert("New FAQ saved successfully.", "success");
                  this.router.navigate(['/faqcategory/list']);
                }
              });
            });
        }
        // finish insert new faq
        // update faq data
        else {
            let formData = {
                question: this.createForm.value.question,
                answer: this.createForm.value.answer,
                categoryId: this.createForm.value.categoryId,
            }
            this.call("faqs.update", this.questionId, formData, (err, res) => {
              this.zone.run(() => {
                if (err) {
                  this.error = err;
                } else {
                  showAlert("FAQ data updated successfully.", "success");
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
