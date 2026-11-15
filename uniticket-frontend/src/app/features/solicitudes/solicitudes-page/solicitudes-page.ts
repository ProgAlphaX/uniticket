import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../data/ticket.service';

@Component({
  selector: 'ut-solicitudes-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './solicitudes-page.html',
  styleUrl: './solicitudes-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolicitudesPage implements OnInit {
  private ticketService = inject(TicketService);

  // Signals de datos y carga
  allTickets = signal<any[]>([]);
  loading = signal<boolean>(true);

  // Filtros (FRM-03)
  filtroTexto = signal<string>('');
  filtroEstado = signal<string>('');
  filtroTipo = signal<string>('');

  // Paginación
  paginaActual = signal<number>(1);
  registrosPorPagina = signal<number>(5);

  ngOnInit() {
    this.cargarTickets();
  }

  cargarTickets() {
    this.loading.set(true);
    this.ticketService.listar().subscribe({
      next: (data) => {
        this.allTickets.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al listar las solicitudes:', err);
        this.loading.set(false);
      }
    });
  }

  // Tickets filtrados en tiempo real usando computed signals
  ticketsFiltrados = computed(() => {
    const texto = this.filtroTexto().toLowerCase().trim();
    const estado = this.filtroEstado();
    const tipo = this.filtroTipo();

    return this.allTickets().filter(t => {
      const matchTexto = !texto || 
        (t.sNum_Ticket && t.sNum_Ticket.toLowerCase().includes(texto)) || 
        (t.sAsunto && t.sAsunto.toLowerCase().includes(texto));
      
      const matchEstado = !estado || t.sEstado === estado;
      const matchTipo = !tipo || t.sTipo === tipo;

      return matchTexto && matchEstado && matchTipo;
    });
  });

  // Tickets paginados según la página actual
  ticketsPaginados = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.registrosPorPagina();
    return this.ticketsFiltrados().slice(inicio, inicio + this.registrosPorPagina());
  });

  totalPaginas = computed(() => {
    return Math.max(1, Math.ceil(this.ticketsFiltrados().length / this.registrosPorPagina()));
  });

  cambiarPagina(pag: number) {
    if (pag >= 1 && pag <= this.totalPaginas()) {
      this.paginaActual.set(pag);
    }
  }

  limpiarFiltros() {
    this.filtroTexto.set('');
    this.filtroEstado.set('');
    this.filtroTipo.set('');
    this.paginaActual.set(1);
  }
}