import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { Usuario } from '../../../core/models/usuario';
import { AuthService } from '../../../core/services/auth.service';
import { LoginPage } from './login-page';

describe('LoginPage', () => {
  let auth: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  const crear = () => {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();
    return fixture;
  };

  const llenar = (el: HTMLElement, email: string, password: string) => {
    const [correo, clave] = Array.from(el.querySelectorAll('input')) as HTMLInputElement[];
    correo.value = email;
    correo.dispatchEvent(new Event('input'));
    clave.value = password;
    clave.dispatchEvent(new Event('input'));
  };

  beforeEach(() => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['iniciarSesion', 'cerrarSesion']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
      ],
    });
    spyOn(console, 'log');
    spyOn(console, 'error');
  });

  it('no llama al servicio si el formulario está vacío y muestra los errores', () => {
    const fixture = crear();
    (fixture.nativeElement as HTMLElement).querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(auth.iniciarSesion).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Este campo es obligatorio');
  });

  it('valida el formato del correo', () => {
    const fixture = crear();
    const el = fixture.nativeElement as HTMLElement;
    llenar(el, 'no-es-correo', '123456');
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(auth.iniciarSesion).not.toHaveBeenCalled();
    expect(el.textContent).toContain('Ingresa un correo válido');
  });

  it('inicia sesión y navega al inicio', () => {
    auth.iniciarSesion.and.returnValue(of({ nId_Usuario: 1 } as Usuario));
    const fixture = crear();
    const el = fixture.nativeElement as HTMLElement;
    llenar(el, 'julio.admin@utp.edu.pe', '123456');
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    expect(auth.iniciarSesion).toHaveBeenCalledWith({ sEmail: 'julio.admin@utp.edu.pe', sPassword: '123456' });
    expect(router.navigate).toHaveBeenCalledWith(['/inicio']);
  });

  it('muestra el mensaje del backend cuando las credenciales son inválidas', () => {
    const error = new HttpErrorResponse({
      status: 401,
      error: JSON.stringify({ status: 401, message: 'Credenciales inválidas' }),
    });
    auth.iniciarSesion.and.returnValue(throwError(() => error));
    const fixture = crear();
    const el = fixture.nativeElement as HTMLElement;
    llenar(el, 'julio.admin@utp.edu.pe', 'incorrecta');
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(el.querySelector('[role=alert]')?.textContent).toContain('Credenciales inválidas');
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
