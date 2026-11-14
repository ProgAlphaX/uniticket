import { TestBed } from '@angular/core/testing';

import { NetworkPanel } from './network-panel';

describe('NetworkPanel', () => {
  it('se abre y se cierra con la tecla R', () => {
    const fixture = TestBed.createComponent(NetworkPanel);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.panel')).toBeNull();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'r' }));
    fixture.detectChanges();
    expect(el.querySelector('.panel')).not.toBeNull();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'R' }));
    fixture.detectChanges();
    expect(el.querySelector('.panel')).toBeNull();
  });
});
