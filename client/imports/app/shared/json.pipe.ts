import { Pipe, PipeTransform } from '@angular/core';
import { Meteor } from 'meteor/meteor';

@Pipe({
    name: 'keys'
})
export class KeysPipe implements PipeTransform {
  transform(value, args:string[]) : any {
    let keys = [];
    for (let key in value) {
      keys.push(key);
    }
    return keys;
  }
}

@Pipe({
    name: 'length'
})
export class LengthPipe implements PipeTransform {
  transform(value, args:string[]) : any {
    let keys = [];
    for (let key in value) {
      keys.push(key);
    }
    return keys.length;
  }
}