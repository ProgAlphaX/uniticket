import { computed, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { Notificacion } from '../../../core/models/notificacion';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../data/notification.service';
import { AVISOS } from '../data/notification.service.spec';
import { NotificationDrawer } from './notification-drawer';

describe('NotificationDrawer', () => {
  let items: ReturnType<typeof signal<Notificacion[]>>;
  let servicio: { items: typeof items; noLeidasItems: unknown; noLeidas: unknown; marcarLeida: jasmine.Spy; marcarTodasLeidas: jasmine.Spy };
  let router: jasmine.SpyObj<Router>;
  let fixture: ComponentFixture<NotificationDrawer>;

  function crear(esAdmin: boolean): HTMLElement {
    TestBed.configureTestingModule({
      imports: [NotificationDrawer],
      providers: [
        { provide: NotificationService, useValue: servicio },
        { provide: AuthService, useValue: { esAdmin: signal(esAdmin) } },
        { provide: Router, useValue: router },
      ],
    });
    fixture = TestBed.createComponent(NotificationDrawer);
    fixture.detectChanges();
    return fixture.nativeElement;
  }

  beforeEach(() => {
    items = signal<Notificacion[]>(AVISOS);
    const noLeidasItems = computed(() => items().filter(aviso => !aviso.bLeida));
    servicio = {
      items,
      noLeidasItems,
      noLeidas: computed(() => noLeidasItems().length),
      marcarLeida: jasmine.createSpy('marcarLeida'),
      marcarTodasLeidas: jasmine.createSpy('marcarTodasLeidas'),
    };
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
  });

  it('lista los avisos y resalta los no leídos', () => {
    const vista = crear(false);
    const avisos = vista.querySelectorAll('.aviso');

    expect(avisos.length).toBe(2);
    expect(avisos[0].classList).toContain('nuevo');
    expect(avisos[0].textContent).toContain('Hace un momento');
    expect(avisos[1].classList).not.toContain('nuevo');
  });

  it('al abrir un aviso lo marca como leído, cierra el panel y va a la solicitud', () => {
    const vista = crear(false);
    let cerrado = false;
    fixture.componentInstance.cerrar.subscribe(() => (cerrado = true));

    (vista.querySelector('.aviso') as HTMLButtonElement).click();

    expect(servicio.marcarLeida).toHaveBeenCalledWith(1);
    expect(cerrado).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith(['/solicitudes', 2]);
  });

  it('lleva al admin a la ruta de administración', () => {
    const vista = crear(true);
    (vista.querySelectorAll('.aviso')[1] as HTMLButtonElement).click();

    expect(servicio.marcarLeida).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/admin/solicitudes', 1]);
  });

  it('muestra un estado vacío cuando no hay avisos', () => {
    items.set([]);
    const vista = crear(false);

    expect(vista.querySelector('ut-empty-state')?.textContent).toContain('No tienes avisos');
    expect(vista.querySelector('.cabecera button')?.hasAttribute('disabled')).toBeTrue();
  });
});
