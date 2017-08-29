import { Component, OnInit } from "@angular/core";
import { Title } from '@angular/platform-browser';
import { MeteorComponent } from 'angular2-meteor';
import { Meteor } from "meteor/meteor";

import template from "./dashboard.html";

@Component({
    selector: "dashboard",
    template
})

export class DashboardComponent extends MeteorComponent implements OnInit {
  totalStats: any;

    constructor(private titleService: Title){
        super();
    }

    ngOnInit() {
      this.titleService.setTitle("Dashboard | Atorvia");
      this.fetchStats();
    }

    private fetchStats() {
        this.call("fetchStats", (err, res) => {
            if (err) {
                console.log(err)
                return;
            }

            this.totalStats = res;
        });


    }
}
