import { estaActivo, itemsDeNavegacion } from './navegacion';

describe('navegacion', () => {
  it('el estudiante ve Inicio, Nueva solicitud (destacada, al centro) y Mis solicitudes', () => {
    const items = itemsDeNavegacion(false);
    expect(items.map(i => i.ruta)).toEqual(['/inicio', '/solicitudes/nueva', '/solicitudes']);
    expect(items[1].destacado).toBeTrue();
  });

  it('el administrador ve Inicio, Solicitudes y Usuarios, sin acción de crear', () => {
    const items = itemsDeNavegacion(true);
    expect(items.map(i => i.ruta)).toEqual(['/inicio', '/admin/solicitudes', '/admin/usuarios']);
    expect(items.some(i => i.destacado)).toBeFalse();
  });

  it('Mis solicitudes está activo en la lista y el detalle, pero no en Nueva solicitud', () => {
    const [, nueva, lista] = itemsDeNavegacion(false);
    expect(estaActivo(lista, '/solicitudes')).toBeTrue();
    expect(estaActivo(lista, '/solicitudes/15')).toBeTrue();
    expect(estaActivo(lista, '/solicitudes/nueva')).toBeFalse();
    expect(estaActivo(nueva, '/solicitudes/nueva')).toBeTrue();
  });
});
