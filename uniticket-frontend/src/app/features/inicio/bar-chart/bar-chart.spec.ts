import { TestBed } from '@angular/core/testing';

import { BarChart, BarraDato } from './bar-chart';

describe('BarChart', () => {
  const datos: BarraDato[] = [
    { clave: 'PENSION', etiqueta: 'Pensión y pagos', valor: 1, icono: 'payments' },
    { clave: 'CERTIFICADO', etiqueta: 'Certificado de estudios', valor: 3, icono: 'workspace_premium' },
  ];

  const crear = () => {
    const fixture = TestBed.createComponent(BarChart);
    fixture.componentRef.setInput('datos', datos);
    fixture.detectChanges();
    return fixture;
  };

  it('destaca la categoría más solicitada con su porcentaje', () => {
    const texto = (crear().nativeElement as HTMLElement).querySelector('.destacado')!.textContent!;
    expect(texto).toContain('Certificado de estudios');
    expect(texto).toContain('3 de 4 solicitudes · 75 %');
  });

  it('ordena las barras de mayor a menor', () => {
    const nombres = Array.from((crear().nativeElement as HTMLElement).querySelectorAll('.nombre')).map(n => n.textContent);
    expect(nombres).toEqual(['Certificado de estudios', 'Pensión y pagos']);
  });

  it('emite la clave al hacer clic en una barra', () => {
    const fixture = crear();
    let elegido = '';
    fixture.componentInstance.seleccionar.subscribe(clave => (elegido = clave));
    (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('.barra')[1].click();
    expect(elegido).toBe('PENSION');
  });
});
