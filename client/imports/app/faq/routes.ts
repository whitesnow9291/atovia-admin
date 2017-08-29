import { Route } from '@angular/router';
import { Meteor } from 'meteor/meteor';
import { AuthService } from "../../services/auth";

import { CreateFAQCategoryComponent } from "./create-category";
import { ListFAQCategoryComponent } from "./list-category";
import { CreateFAQComponent } from "./create-question";

export const routes = [
    {path: "faqcategory/create", component: CreateFAQCategoryComponent, canActivate: [AuthService], data: {'roles': ['super-admin', 'sub-admin']}},
    {path: "faqcategory/list", component: ListFAQCategoryComponent, canActivate: [AuthService], data: {'roles': ['super-admin', 'sub-admin']}},
    {path: "faqcategory/update/:id", component: CreateFAQCategoryComponent, canActivate: [AuthService], data: {'roles': ['super-admin', 'sub-admin']}},
    {path: "faqcategory/create-ques/:catId", component: CreateFAQComponent, canActivate: [AuthService], data: {'roles': ['super-admin', 'sub-admin']}},
    {path: "faqcategory/update-ques/:catId/:quesId", component: CreateFAQComponent, canActivate: [AuthService], data: {'roles': ['super-admin', 'sub-admin']}},
];