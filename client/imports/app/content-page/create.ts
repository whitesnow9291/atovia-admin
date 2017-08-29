import { Meteor } from 'meteor/meteor';
import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MeteorComponent } from 'angular2-meteor';
import { Subscription } from "rxjs";
import { Page } from "../../../../both/models/page.model";
import {showAlert} from "../shared/show-alert";
import {validateSlug} from "../../validators/common";
import { Roles } from 'meteor/alanning:roles';

import template from "./create.html";

@Component({
  selector: '',
  template
})
export class CreatePageComponent extends MeteorComponent implements OnInit, OnDestroy {
  paramsSub: Subscription;
  pageId: string;
  createForm: FormGroup;
  error: string;
  slugs: string[];

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
          this.pageId = id;
          //console.log("patientId:", patientId);

          if (! this.pageId) {
            //console.log("no page-id supplied");
            return;
          }

          this.call("pages.findOne", id, (err, res)=> {
              if (err || typeof res == "undefined" || res._id !== id) {
                  this.zone.run(() => {
                    showAlert("Error while fetching page data.", "danger");
                    this.router.navigate(['/page/list']);
                  });
                  return;
              }
              this.createForm.controls['title'].setValue(res.title);
              this.createForm.controls['heading'].setValue(res.heading);
              this.createForm.controls['slug'].setValue(res.slug);
              this.createForm.controls['summary'].setValue(res.summary);
              this.createForm.controls['contents'].setValue(res.contents);
          });

      });

    this.createForm = this.formBuilder.group({
      title: ['', Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(255)])],
      heading: ['', Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(255)])],
      summary: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(255)])],
      slug: [''],
      contents: ['', Validators.compose([Validators.required])],
    });

    this.error = '';
    this.populateSlugs();
  }

  onSubmit() {
    if (!this.createForm.valid) {
      console.log(this.createForm);
      showAlert("Invalid form-data supplied.", "danger");
      return;
    }

    // insert new page
    if (!this.pageId) {
      let pageData = {
        title: this.createForm.value.title,
        heading: this.createForm.value.heading,
        summary: this.createForm.value.summary,
        contents: this.createForm.value.contents,
        slug: this.createForm.value.slug,
        ownerId: Meteor.userId(),
        active: true,
        deleted: false
      };
      this.call("pages.insert", pageData, (err, res) => {
        this.zone.run(() => {
          if (err) {
              this.error = err;
          } else {
            showAlert("New page saved successfully.", "success");
            this.router.navigate(['/page/list']);
          }
        });
      });
    }
    // finish insert new page
    // update page data
    else {
      let pageData = {
        title: this.createForm.value.title,
        heading: this.createForm.value.heading,
        summary: this.createForm.value.summary,
        contents: this.createForm.value.contents,
        slug: this.createForm.value.slug
      }
      this.call("pages.update", this.pageId, pageData, (err, res) => {
        this.zone.run(() => {
          if (err) {
              this.error = err;
          } else {
            showAlert("Page data updated successfully.", "success");
            this.router.navigate(['/page/list']);
          }
        });
      });
    }
    // finish update page data
  }

  private populateSlugs() {
    let where = {};
    if (!! this.pageId) {
      where = {_id: {$ne: this.pageId}};
    }
    this.call("pages.find", {limit: 0, skip: 0, fields: {slug: 1} }, where, "", (err, res) => {
      if (err) {
        /*showAlert("Error while fetching data.", "danger");*/
        return;
      }
      let items:Page[] = res.data;
      let slugs:string[] = [];
      for(let i=0; i<items.length; i++) {
        slugs.push(items[i].slug);
      }
      this.slugs = slugs;
      this.createForm.controls["slug"].setValidators(
        Validators.compose([
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(50),
          validateSlug,
          this.isUniqueSlug()
        ])
      );
      //console.log("slugs:", this.slugs);
    })
  }

  private isUniqueSlug() {
     return (c: FormControl) => {
       let value = c.value;

       // don't validate empty values to allow optional controls
       if (value == null || typeof value === 'string' && value.length === 0) {
         return null;
       }

       if (value!==this.slugs.find((key)=>{
         return key==value;
       })) {
         return null;
       }

       return {
        isUnique: {
          valid: false
        }
      };
     }
  }

  ngOnDestroy() {
    this.paramsSub.unsubscribe();
  }
}
