export interface ItemNav {
  ruta: string;
  icono: string;
  etiqueta: string;
  corta: string;
  destacado?: boolean;
}

const INICIO: ItemNav = { ruta: '/inicio', icono: 'home', etiqueta: 'Inicio', corta: 'Inicio' };

export function itemsDeNavegacion(esAdmin: boolean): ItemNav[] {
  return esAdmin
    ? [
        INICIO,
        { ruta: '/admin/solicitudes', icono: 'inbox', etiqueta: 'Solicitudes', corta: 'Solicitudes' },
        { ruta: '/admin/usuarios', icono: 'group', etiqueta: 'Usuarios', corta: 'Usuarios' },
      ]
    : [
        INICIO,
        { ruta: '/solicitudes/nueva', icono: 'add', etiqueta: 'Nueva solicitud', corta: 'Nueva', destacado: true },
        { ruta: '/solicitudes', icono: 'description', etiqueta: 'Mis solicitudes', corta: 'Solicitudes' },
      ];
}

export function estaActivo(item: ItemNav, url: string): boolean {
  const ruta = url.split('?')[0];
  if (item.destacado || item.ruta === '/inicio') {
    return ruta === item.ruta;
  }
  return ruta === item.ruta || (ruta.startsWith(item.ruta + '/') && ruta !== '/solicitudes/nueva');
}
