import { Component, OnInit } from "@angular/core";
import { Meteor } from "meteor/meteor";
import { Router } from '@angular/router';

import template from "./landing.component.html";

@Component({
    selector: "landing",
    template
})

export class LandingComponent implements OnInit {
    constructor(private router: Router) {
        if(Meteor.userId()){
            this.router.navigate(['/dashboard']);
        } else {
            this.router.navigate(['/login']);
        }
    }

    ngOnInit() {
    }
}