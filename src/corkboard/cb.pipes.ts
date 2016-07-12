import {PipeTransform, Pipe, Injectable} from '@angular/core';

@Injectable()
@Pipe({name: 'titleCase'})
export class TitleCase implements PipeTransform {

    transform(text:string, args:any[]):any {
       var textStr = text.toLowerCase().split(' ');
       var excludeLst = ["a","in","the","and","or","nor","for", "to", "an", "at"];
       for (var i = 0; i < textStr.length; i++) {
          if(excludeLst.indexOf(textStr[i]) || i === 0){
             textStr[i] = textStr[i].charAt(0).toUpperCase() + textStr[i].substring(1);
          }
       }
       return textStr.join(' ');
    }
}
