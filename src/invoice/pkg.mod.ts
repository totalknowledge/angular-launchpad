import { Component, Input } from '@angular/core';

@Component({
  selector: 'my-package',
  template: `
      <md-card class="app-input-section">
            <h3>Packages</h3>
            <table class="listview">
              <tr>
                <th class="select"><md-checkbox></md-checkbox></th>
                <th class="select">ID</th>
                <th>Name</th>
                <th>Description</th>
              </tr>
              <tr *ngIf="!pkgObjects.length">
                <td colspan="4" class="centered">No Packages found for Offer.</td>
              </tr>
              <tr *ngFor="let package of pkgObjects" (click)="detailPackage(package)">
                <td><md-checkbox></md-checkbox></td>
                <td>{{package.id}}</td>
                <td>{{package.pkg_name}}</td>
                <td>{{package.pkg_desc}}</td>
              </tr>
            </table>
            <br>
            <h3>Create Package</h3>
            <label>Package Name&nbsp;&nbsp;</label>
            <md-input
              placeholder="Enter Name"
              id="pkg_name"
              type="text"
              [(ngModel)]="selectedPackage.pkg_name"
              class="validate">
            </md-input>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <label>Description&nbsp;&nbsp;</label>
            <md-input
              id="pkg_desc"
              type="text"
              [(ngModel)]="selectedPackage.pkg_desc"
              class="validate long">
            </md-input>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <label>ID&nbsp;&nbsp;</label>
            <md-input
              id="id"
              type="text"
              [(ngModel)]="selectedPackage.id"
              class="validate">
            </md-input>
            <br>
            <md-radio-group [(ngModel)]="selectedPackage.pkg_mod">
              <md-radio-button value="custom">Custom</md-radio-button>
              <md-radio-button value="config">Configurable</md-radio-button>
              <md-radio-button value="standard">Standard</md-radio-button>
              <md-radio-button value="fixed">Fixed</md-radio-button>
            </md-radio-group>
            <br>
            <br>
            <button md-raised-button color="primary" *ngIf="!selectedPackage.id" (click)="createPackage(selectedPackage)">Create</button>
            <button md-raised-button color="primary" *ngIf="selectedPackage.id" (click)="savePackage(selectedPackage)">Save</button>
            <button md-raised-button color="accent" *ngIf="selectedPackage.id" (click)="cancelPackage()">Cancel</button>
            <button md-raised-button color="accent" *ngIf="!selectedPackage.id" (click)="cancelPackage()">Clear</button>
      </md-card>
    `
})
export class PackageControler {
  @Input()
  selectedPackage: Package;
  pkgObjects: Package[] = [ ];

  constructor() {
    this.selectedPackage = new Package();
  }

  detailPackage(pkg: Package): void {
    this.selectedPackage = pkg;
  };
  createPackage(pkg: Package): boolean {
    this.pkgObjects.push(pkg);
    this.selectedPackage = new Package();
    return true;
  };
  cancelPackage(): void {
    this.selectedPackage = new Package();
  }
}

export class Package {
  pkg_name: string;
  pkg_desc: string;
  parent_id: number;
  pkg_mod: string;
  id: number;
}
