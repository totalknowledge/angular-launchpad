import { Component, Input, Output, EventEmitter, TemplateRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  standalone: false
})
export class DialogComponent {
  @Input() content!: TemplateRef<unknown>;
  @Input() buttons: { label: string, onClick: () => void; }[] = [];
  @Output() dClose = new EventEmitter<unknown>();

  @ViewChild('dialogContent') dialogContent;

  closeDialog(result?: unknown) {
    this.dClose.emit(result);
  }

  onOverlayClicked(event: MouseEvent): void {
    void event;
    this.dClose.emit();
  }

  onDialogContentClicked(event: MouseEvent): void {
    event.stopPropagation();
  }
}
