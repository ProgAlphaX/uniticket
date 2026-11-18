import { computed, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationService } from '../data/notification.service';
import { NotificationBell } from './notification-bell';

describe('NotificationBell', () => {
  const noLeidas = signal(0);
  let fixture: ComponentFixture<NotificationBell>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NotificationBell],
      providers: [{ provide: NotificationService, useValue: { noLeidas: computed(() => noLeidas()) } }],
    });
    fixture = TestBed.createComponent(NotificationBell);
  });

  function boton(): HTMLButtonElement {
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('button');
  }

  it('oculta la insignia cuando no hay avisos sin leer', () => {
    noLeidas.set(0);

    expect(boton().getAttribute('aria-label')).toBe('Avisos');
    expect(fixture.nativeElement.querySelector('.mat-badge-hidden')).not.toBeNull();
  });

  it('muestra la cantidad sin leer y la limita a 9+', () => {
    noLeidas.set(12);

    expect(boton().getAttribute('aria-label')).toBe('Avisos, 12 sin leer');
    expect(fixture.nativeElement.querySelector('.mat-badge-content').textContent).toContain('9+');
  });

  it('emite abrir al hacer clic', () => {
    let abierto = false;
    fixture.componentInstance.abrir.subscribe(() => (abierto = true));
    boton().click();

    expect(abierto).toBeTrue();
  });
});
