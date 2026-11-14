import { TestBed } from '@angular/core/testing';

import { Avatar } from './avatar';

describe('Avatar', () => {
  it('muestra las iniciales y un color fijo según el id', () => {
    const fixture = TestBed.createComponent(Avatar);
    fixture.componentRef.setInput('id', 8);
    fixture.componentRef.setInput('nombres', 'ana lucía');
    fixture.componentRef.setInput('apellidos', 'torres quispe');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent?.trim()).toBe('AT');
    expect(el.classList).toContain('avatar--2');
  });
});
