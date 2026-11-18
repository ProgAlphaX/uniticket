import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';

import { API_URL } from '../../../core/config/api';
import {
  ESTADO_ICONO,
  ESTADOS,
  ESTADOS_PLURAL,
  EstadoTicket,
  TIPO_ICONO,
  TIPOS,
  TipoTicket,
} from '../../../core/config/catalogos';
import { Ticket } from '../../../core/models/ticket';
import { Usuario } from '../../../core/models/usuario';
import { AuthService } from '../../../core/services/auth.service';
import { esPantallaMovil } from '../../../layout/pantalla';
import { Avatar } from '../../../shared/ui/avatar/avatar';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { StatusPill } from '../../../shared/ui/status-pill/status-pill';
import { TicketService } from '../../solicitudes/data/ticket.service';
import { BarChart, BarraDato } from '../bar-chart/bar-chart';
import { StatCard } from '../stat-card/stat-card';

@Component({
  selector: 'ut-inicio-page',
  imports: [
    DatePipe,
    NgTemplateOutlet,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    Avatar,
    EmptyState,
    StatusPill,
    BarChart,
    StatCard,
  ],
  templateUrl: './inicio-page.html',
  styleUrl: './inicio-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InicioPage {
  private readonly ticketService = inject(TicketService);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  protected readonly usuario = this.auth.usuario;
  protected readonly esAdmin = this.auth.esAdmin;
  protected readonly esMovil = esPantallaMovil();
  protected readonly hoy = new Date();
  protected readonly estados = Object.keys(ESTADOS) as EstadoTicket[];
  protected readonly etiquetas = ESTADOS_PLURAL;
  protected readonly iconos = ESTADO_ICONO;
  protected readonly tipos = TIPOS;
  protected readonly tipoIcono = TIPO_ICONO;

  protected readonly cargando = signal(true);
  protected readonly error = signal(false);
  private readonly tickets = signal<Ticket[]>([]);
  private readonly usuarios = signal<Usuario[]>([]);

  protected readonly visibles = computed(() => {
    const idUsuario = this.usuario()?.nId_Usuario;
    return this.esAdmin() ? this.tickets() : this.tickets().filter(t => t.nId_Usuario === idUsuario);
  });

  protected readonly conteo = computed(() => {
    const conteo = { PENDIENTE: 0, EN_PROCESO: 0, OBSERVADO: 0, PROCEDE: 0, NO_PROCEDE: 0 } as Record<EstadoTicket, number>;
    this.visibles().forEach(t => conteo[t.sEstado]++);
    return conteo;
  });

  protected readonly abiertas = computed(
    () => this.conteo().PENDIENTE + this.conteo().EN_PROCESO + this.conteo().OBSERVADO,
  );
  protected readonly usuariosActivos = computed(() => this.usuarios().filter(u => u.sEstado === 'ACTIVO').length);

  protected readonly porAtender = computed(() =>
    this.visibles()
      .filter(t => t.sEstado === 'PENDIENTE')
      .sort((a, b) => a.dFecha_Creacion.localeCompare(b.dFecha_Creacion))
      .slice(0, 5),
  );

  protected readonly enCurso = computed(() =>
    this.visibles()
      .filter(t => t.sEstado === 'EN_PROCESO' || t.sEstado === 'OBSERVADO')
      .sort((a, b) => a.dFecha_Actualizacion.localeCompare(b.dFecha_Actualizacion))
      .slice(0, 5),
  );

  protected readonly observadas = computed(() => this.visibles().filter(t => t.sEstado === 'OBSERVADO'));
  protected readonly ultimas = computed(() => this.visibles().slice(0, 5));

  protected readonly grafico = computed<BarraDato[]>(() =>
    (Object.keys(TIPOS) as TipoTicket[]).map(tipo => ({
      clave: tipo,
      etiqueta: TIPOS[tipo],
      icono: TIPO_ICONO[tipo],
      valor: this.visibles().filter(t => t.sTipo === tipo).length,
    })),
  );

  protected readonly rutaLista = computed(() => (this.esAdmin() ? '/admin/solicitudes' : '/solicitudes'));

  constructor() {
    this.cargar();
  }

  private cargarUsuarios(): Observable<Usuario[]> {
    return this.esAdmin() ? this.http.get<Usuario[]>(`${API_URL}/usuarios`) : of([]);
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set(false);
    forkJoin({
      tickets: this.ticketService.listar(),
      usuarios: this.cargarUsuarios(),
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

  protected usuarioDe(id: number): Usuario | undefined {
    return this.usuarios().find(u => u.nId_Usuario === id);
  }

  protected verCategoria(tipo: string): void {
    this.router.navigate([this.rutaLista()], { queryParams: { tipo } });
  }
}
