import 'angular2-meteor-polyfills';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './imports/app/app.module';

function setClass(css) {
  if (!document.body.className) {
    document.body.className = "";
  }
  document.body.className += " " + css;
}

Meteor.startup(() => {
  setClass('web');

  const platform = platformBrowserDynamic();
  platform.bootstrapModule(AppModule);
});
