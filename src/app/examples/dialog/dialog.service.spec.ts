import { TestBed } from '@angular/core/testing';
import { ApplicationRef, ComponentRef, EmbeddedViewRef, EventEmitter, Injector, TemplateRef } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { DialogComponent } from './dialog.component';
import { DialogService } from './dialog.service';

describe('DialogService', () => {
  let service: DialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should attach dialog content and emit the close result', async () => {
    const rootNode = document.createElement('section');
    const hostView = { rootNodes: [rootNode] } as unknown as EmbeddedViewRef<unknown>;
    const componentRef = {
      hostView,
      destroy: vi.fn(),
      instance: {
        dClose: new EventEmitter<unknown>(),
      }
    } as unknown as ComponentRef<DialogComponent>;
    const createComponent = vi.fn(() => componentRef);
    const appRef = {
      components: [{ instance: { viewContainerRef: { createComponent } } }],
      attachView: vi.fn(),
      detachView: vi.fn(),
    } as unknown as ApplicationRef;
    const dialogService = new DialogService(appRef, {} as Injector);
    const content = {} as TemplateRef<unknown>;
    const buttons = [{ label: 'Close', onClick: vi.fn() }];
    const closeValue = { saved: true };

    const closed = firstValueFrom(dialogService.open(content, buttons, closeValue));
    componentRef.instance.dClose.emit();

    await expect(closed).resolves.toEqual(closeValue);
    expect(createComponent).toHaveBeenCalledWith(DialogComponent);
    expect(componentRef.instance.content).toBe(content);
    expect(componentRef.instance.buttons).toBe(buttons);
    expect(appRef.attachView).toHaveBeenCalledWith(hostView);
    expect(document.body.contains(rootNode)).toBeTruthy();
    expect(appRef.detachView).toHaveBeenCalledWith(hostView);
    expect(componentRef.destroy).toHaveBeenCalled();

    rootNode.remove();
  });

  it('should ignore close calls when no dialog is open', () => {
    expect(() => service.close()).not.toThrow();
  });
});
