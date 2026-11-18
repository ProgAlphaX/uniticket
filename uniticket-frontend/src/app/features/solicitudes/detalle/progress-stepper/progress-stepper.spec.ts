import { TestBed } from '@angular/core/testing';

import { AccionSeguimiento } from '../../../../core/models/seguimiento';
import { Ticket } from '../../../../core/models/ticket';
import { TICKETS, detalle } from '../../testing-data';
import { ProgressStepper } from './progress-stepper';

describe('ProgressStepper', () => {
  function pasos(estado: Ticket['sEstado'], acciones: AccionSeguimiento[]): { texto: string; clase: string }[] {
    const fixture = TestBed.createComponent(ProgressStepper);
    fixture.componentRef.setInput('ticket', detalle({ ...TICKETS[0], sEstado: estado }, acciones));
    fixture.detectChanges();
    return Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('li')).map(li => ({
      texto: li.querySelector('b')!.textContent!.trim(),
      clase: li.className,
    }));
  }

  it('una solicitud pendiente está en el primer paso', () => {
    const resultado = pasos('PENDIENTE', ['REGISTRO']);

    expect(resultado.map(p => p.texto)).toEqual(['Registrada', 'En proceso', 'Decisión']);
    expect(resultado[0].clase).toContain('cur');
  });

  it('agrega el paso de observación cuando la solicitud fue observada', () => {
    const resultado = pasos('OBSERVADO', ['REGISTRO', 'EN_PROCESO', 'OBSERVADO']);

    expect(resultado.map(p => p.texto)).toEqual(['Registrada', 'En proceso', 'Observada', 'Decisión']);
    expect(resultado[2].clase).toContain('cur');
  });

  it('una solicitud cerrada muestra la decisión como último paso', () => {
    const resultado = pasos('NO_PROCEDE', ['REGISTRO', 'EN_PROCESO', 'NO_PROCEDE']);

    expect(resultado.map(p => p.texto)).toEqual(['Registrada', 'En proceso', 'No procede']);
    expect(resultado[2].clase).toContain('cur');
  });
});
