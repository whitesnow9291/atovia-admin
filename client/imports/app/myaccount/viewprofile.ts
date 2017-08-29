import { Meteor } from "meteor/meteor";
import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription, Subject } from "rxjs";
import { MeteorObservable } from "meteor-rxjs";
import { InjectUser } from "angular2-meteor-accounts-ui";
import { upload } from '../../../../both/methods/images.methods';
import { Image } from "../../../../both/models/image.model";
import { MeteorComponent } from 'angular2-meteor';
import { Title } from '@angular/platform-browser';
import { User } from "../../../../both/models/user.model";
import template from './viewprofile.html';
import { showAlert } from "../shared/show-alert";


@Component({
    selector: '',
    template
})
@InjectUser("user")
export class UserDetailsComponent extends MeteorComponent implements OnInit {
    userId: string;
    user: User;
    isUploading: boolean = false;
    isUploaded: boolean = false;
    searchString: string;
    paramsSub: Subscription;


    constructor(
        private route: ActivatedRoute,
        private ngZone: NgZone,
        private titleService: Title
    ) {
        super();
    }

    ngOnInit() {
        this.titleService.setTitle("My Account | Atorvia");
        this.userId = Meteor.userId();
        this.fetchUser();
    }

    private fetchUser() {
        this.call("users.findOne", this.userId, (err, res) => {
            if (err) {
                //console.log("error while fetching user data:", err);
                return;
            }
            this.user = res;
        });
    }

    onFileSelect(event) {
        var files = event.srcElement.files;
        console.log(files);
        this.startUpload(files[0]);
    }


    private startUpload(file: File): void {
        // check for previous upload
        if (this.isUploading === true) {
            console.log("aleady uploading...");
            return;
        }

        // start uploading
        this.isUploaded = false;
        //console.log('file uploading...');
        this.isUploading = true;

        upload(file)
        .then((res) => {
            this.isUploading = false;
            this.isUploaded = true;
            console.log("image upload done.")
            console.log("file id:", res._id);
            let userData = {
              "profile.image":{
                  id: res._id,
                  url: res.path,
                  name: res.name
                }
            };
            this.call("users.update", this.userId, userData, (err, res) => {
                if (err) {
                    console.log("Error while updating user picture");
                    return;
                }
                $("#inputFile").val("");
                this.user.profile.image.url = res.path;
                showAlert("Profile picture updated successfully.", "success");
            });
        })
        .catch((error) => {
            this.isUploading = false;
            console.log('Error in file upload:', error);
            showAlert(error.reason, "danger");
        });
    }

    /* deleting user image */
    deleteImage(image: Image) {
        if (!confirm("Are you sure to delete this image?")) {
            return false;
        }

        Meteor.call("users.deleteImage", (err, res) => {
            if (err) {
                showAlert("Error calling image.delete", "danger");
                return;
            }
            this.user.profile.image.url = null;
            showAlert("Image has been deleted.", "success");
        })
    }

}
