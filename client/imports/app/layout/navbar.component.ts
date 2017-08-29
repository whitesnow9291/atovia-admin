import { Meteor } from "meteor/meteor";
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router'
import { InjectUser } from "angular2-meteor-accounts-ui";
import { User } from "../../../../both/models/user.model";
import template from './navbar.component.html';

declare var jQuery: any;

@Component({
    selector: 'navbar',
    template
})
@InjectUser('user')
export class NavBarComponent implements OnInit, AfterViewInit {
    constructor(private router: Router) { }

    logout() {
        Meteor.logout();
        this.router.navigate(['/login']);
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        jQuery(function ($) {
            $(".button-collapse").sideNav();
            $('.collapsible').collapsible();
        })
    }
}
