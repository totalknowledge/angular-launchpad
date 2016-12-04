import { Component } from '@angular/core';

@Component({
  selector: 'my-package',
  template: `
      <form class="card g--12">
            <label for="first_name">First Name</label>
            <input placeholder="Placeholder" id="first_name" type="text" class="validate">
            <label for="last_name">Package Description</label>
            <textarea id="last_name" class="validate"></textarea>
      </form>
    `
})
export class Package {
  pkgObject = {
    "name": "TEST-PKG",
    "desc": "Long description for Package.",
  };
}
