import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router'
import template from './header.min.component.html';
import {InjectUser} from "angular2-meteor-accounts-ui";

@Component({
    selector: 'header-min',
    template
})
@InjectUser('user')
export class HeaderMinComponent implements AfterViewInit {
    constructor(private router: Router) {}
  
    ngAfterViewInit() {
    }
}
