import { Component, EventEmitter, Output } from '@angular/core';
import { User } from '../../persistence/auth.service';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
})
export class DialogComponent {
  @Output() closeDialog = new EventEmitter<void>();
  // Assume User data is passed through some service or parent component
  user: User;

  constructor() { }

  onNoClick(): void {
    this.closeDialog.emit();
  }
}
