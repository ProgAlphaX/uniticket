import { TestBed } from '@angular/core/testing';

import { ColumnFilter, OpcionFiltro } from './column-filter';

describe('ColumnFilter', () => {
  const opciones: OpcionFiltro[] = [
    { valor: 'PENDIENTE', etiqueta: 'Pendiente', color: '#F08C00' },
    { valor: 'PROCEDE', etiqueta: 'Procede', color: '#1F9D57' },
  ];

  const crear = (seleccion: string[]) => {
    const fixture = TestBed.createComponent(ColumnFilter);
    fixture.componentRef.setInput('opciones', opciones);
    fixture.componentRef.setInput('seleccion', seleccion);
    fixture.detectChanges();
    return fixture.componentInstance as unknown as {
      seleccion: () => string[];
      alternar: (v: string) => void;
      alternarTodos: () => void;
    };
  };

  it('quita y vuelve a poner una opción', () => {
    const filtro = crear(['PENDIENTE', 'PROCEDE']);
    filtro.alternar('PROCEDE');
    expect(filtro.seleccion()).toEqual(['PENDIENTE']);
    filtro.alternar('PROCEDE');
    expect(filtro.seleccion()).toEqual(['PENDIENTE', 'PROCEDE']);
  });

  it('«Todos» desmarca todo si ya estaba todo marcado y marca todo si no', () => {
    const filtro = crear(['PENDIENTE', 'PROCEDE']);
    filtro.alternarTodos();
    expect(filtro.seleccion()).toEqual([]);
    filtro.alternarTodos();
    expect(filtro.seleccion()).toEqual(['PENDIENTE', 'PROCEDE']);
  });
});
