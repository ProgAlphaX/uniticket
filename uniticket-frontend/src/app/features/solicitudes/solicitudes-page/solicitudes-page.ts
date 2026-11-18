import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { API_URL } from '../../../core/config/api';
import {
  ESTADO_COLOR,
  ESTADOS,
  ESTADOS_PLURAL,
  EstadoTicket,
  TIPO_COLOR,
  TIPOS,
  TipoTicket,
} from '../../../core/config/catalogos';
import { Ticket } from '../../../core/models/ticket';
import { Usuario } from '../../../core/models/usuario';
import { AuthService } from '../../../core/services/auth.service';
import { esPantallaMovil } from '../../../layout/pantalla';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { ColumnFilter, OpcionFiltro } from '../column-filter/column-filter';
import { TicketService } from '../data/ticket.service';
import { SolicitudesTable } from '../solicitudes-table/solicitudes-table';

const TODOS_LOS_ESTADOS = Object.keys(ESTADOS) as EstadoTicket[];
const TODOS_LOS_TIPOS = Object.keys(TIPOS) as TipoTicket[];

@Component({
  selector: 'ut-solicitudes-page',
  imports: [
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    EmptyState,
    ColumnFilter,
    SolicitudesTable,
  ],
  templateUrl: './solicitudes-page.html',
  styleUrl: './solicitudes-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolicitudesPage {
  private readonly ticketService = inject(TicketService);
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  readonly estado = input<string>();
  readonly tipo = input<string>();

  protected readonly esAdmin = this.auth.esAdmin;
  protected readonly esMovil = esPantallaMovil();
  protected readonly cargando = signal(true);
  protected readonly error = signal(false);
  protected readonly usuarios = signal<Usuario[]>([]);
  private readonly tickets = signal<Ticket[]>([]);

  protected readonly texto = signal('');
  protected readonly estados = linkedSignal<string[]>(() => {
    const estado = this.estado();
    return estado && estado in ESTADOS ? [estado] : [...TODOS_LOS_ESTADOS];
  });
  protected readonly tipos = linkedSignal<string[]>(() => {
    const tipo = this.tipo();
    return tipo && tipo in TIPOS ? [tipo] : [...TODOS_LOS_TIPOS];
  });

  protected readonly pagina = signal(0);
  protected readonly tamano = signal(10);

  protected readonly opcionesTipo: OpcionFiltro[] = TODOS_LOS_TIPOS.map(tipo => ({
    valor: tipo,
    etiqueta: TIPOS[tipo],
    color: TIPO_COLOR[tipo],
  }));

  protected readonly visibles = computed(() => {
    const idUsuario = this.auth.usuario()?.nId_Usuario;
    return this.esAdmin() ? this.tickets() : this.tickets().filter(t => t.nId_Usuario === idUsuario);
  });

  protected readonly filtrados = computed(() => {
    const texto = this.normalizar(this.texto());
    const estados = this.estados();
    const tipos = this.tipos();
    return this.visibles().filter(t => {
      const usuario = this.usuarios().find(u => u.nId_Usuario === t.nId_Usuario);
      const buscable = this.normalizar(`${t.sNum_Ticket} ${t.sAsunto} ${usuario?.sNombreCompleto ?? ''} ${usuario?.sDni ?? ''}`);
      return estados.includes(t.sEstado) && tipos.includes(t.sTipo) && (!texto || buscable.includes(texto));
    });
  });

  protected readonly paginaActual = computed(() => {
    const inicio = this.pagina() * this.tamano();
    return this.filtrados().slice(inicio, inicio + this.tamano());
  });

  protected readonly resumen = computed(() =>
    TODOS_LOS_ESTADOS.map(estado => ({
      estado,
      etiqueta: ESTADOS_PLURAL[estado],
      color: ESTADO_COLOR[estado],
      total: this.visibles().filter(t => t.sEstado === estado).length,
    })),
  );

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set(false);
    forkJoin({
      tickets: this.ticketService.listar(),
      usuarios: this.http.get<Usuario[]>(`${API_URL}/usuarios`),
    }).subscribe({
      next: data => {
        console.log('Datos recibidos del servicio:', data);
        this.tickets.set(data.tickets);
        this.usuarios.set(data.usuarios);
        this.cargando.set(false);
      },
      error: err => {
        console.error('Error al llamar al servicio:', err);
        this.error.set(true);
        this.cargando.set(false);
      },
    });
  }

  protected buscar(valor: string): void {
    this.texto.set(valor);
    this.pagina.set(0);
  }

  protected cambiarEstados(estados: string[]): void {
    this.estados.set(estados);
    this.pagina.set(0);
  }

  protected cambiarTipos(tipos: string[]): void {
    this.tipos.set(tipos);
    this.pagina.set(0);
  }

  protected cambiarPagina(evento: PageEvent): void {
    this.pagina.set(evento.pageIndex);
    this.tamano.set(evento.pageSize);
  }

  protected limpiarFiltros(): void {
    this.texto.set('');
    this.estados.set([...TODOS_LOS_ESTADOS]);
    this.tipos.set([...TODOS_LOS_TIPOS]);
    this.pagina.set(0);
  }

  private normalizar(texto: string): string {
    return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  }
}
