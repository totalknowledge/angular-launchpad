import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';

import { DialogComponent } from './dialog.component';

@Component({
  template: `
    <ng-template #content>
      <span class="projected-content">Projected content</span>
    </ng-template>
  `,
  standalone: false
})
class DialogHostComponent {
  @ViewChild('content', { static: true }) content!: TemplateRef<unknown>;
  clicked = false;
  buttons = [
    {
      label: 'Apply',
      onClick: () => {
        this.clicked = true;
      }
    }
  ];
}

describe('DialogComponent', () => {
  let component: DialogComponent;
  let fixture: ComponentFixture<DialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DialogComponent, DialogHostComponent],
      imports: [CommonModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit close events from component methods', () => {
    const emitSpy = vi.spyOn(component.dClose, 'emit');
    const clickEvent = new MouseEvent('click');
    const stopPropagation = vi.spyOn(clickEvent, 'stopPropagation');

    component.closeDialog('saved');
    component.onOverlayClicked(clickEvent);
    component.onDialogContentClicked(clickEvent);

    expect(emitSpy).toHaveBeenCalledWith('saved');
    expect(emitSpy).toHaveBeenCalledWith();
    expect(stopPropagation).toHaveBeenCalled();
  });

  it('should render projected content and run configured buttons', () => {
    const hostFixture = TestBed.createComponent(DialogHostComponent);
    hostFixture.detectChanges();

    expect(hostFixture.componentInstance.content).toBeTruthy();

    component.content = hostFixture.componentInstance.content;
    component.buttons = hostFixture.componentInstance.buttons;
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.textContent).toContain('Projected content');

    root.querySelector('button')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(hostFixture.componentInstance.clicked).toBeTruthy();
  });

  it('should close from overlay clicks but not content clicks', () => {
    const closeSpy = vi.spyOn(component.dClose, 'emit');
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    root.querySelector('.dialog-content')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(closeSpy).not.toHaveBeenCalled();

    root.querySelector('.dialog-overlay')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(closeSpy).toHaveBeenCalledWith(undefined);
  });
});
