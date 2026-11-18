import { MatPaginatorIntl } from '@angular/material/paginator';

export function paginadorEnEspanol(): MatPaginatorIntl {
  const intl = new MatPaginatorIntl();
  intl.itemsPerPageLabel = 'Registros por página';
  intl.firstPageLabel = 'Primera página';
  intl.previousPageLabel = 'Página anterior';
  intl.nextPageLabel = 'Página siguiente';
  intl.lastPageLabel = 'Última página';
  intl.getRangeLabel = (pagina: number, tamano: number, total: number) => {
    if (total === 0) {
      return '0 de 0';
    }
    const inicio = pagina * tamano;
    return `${inicio + 1} – ${Math.min(inicio + tamano, total)} de ${total}`;
  };
  return intl;
}
