import { Injectable, ComponentRef, Injector, ApplicationRef, EmbeddedViewRef, TemplateRef } from '@angular/core';
import { DialogComponent } from './dialog.component';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private dialogComponentRef?: ComponentRef<DialogComponent>;
  private afterClosedSubject = new Subject<unknown>();

  constructor(private appRef: ApplicationRef, private injector: Injector) { }

  public open(content: TemplateRef<unknown>, buttons: { label: string; onClick: () => void; }[], afterClose: unknown): Observable<unknown> {
    const componentRef = this.appRef.components[0].instance.viewContainerRef.createComponent(DialogComponent);
    this.dialogComponentRef = componentRef;
    this.dialogComponentRef.instance.content = content;
    this.dialogComponentRef.instance.buttons = buttons;
    this.dialogComponentRef.instance.dClose.subscribe(() => {
      this.afterClosedSubject.next(afterClose);
      this.afterClosedSubject.complete();
      this.close();
    });

    this.appRef.attachView(componentRef.hostView);
    const domElem = (componentRef.hostView as EmbeddedViewRef<unknown>).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);

    return this.afterClosedSubject.asObservable();
  }

  public close(): void {
    if (this.dialogComponentRef) {
      this.appRef.detachView(this.dialogComponentRef.hostView);
      this.dialogComponentRef.destroy();
    }
  }
}
