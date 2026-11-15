import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TicketService } from '../../solicitudes/data/ticket.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'ut-inicio-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './inicio-page.html',
  styleUrl: './inicio-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InicioPage implements OnInit {
  private ticketService = inject(TicketService);
  public authService = inject(AuthService);

  tickets = signal<any[]>([]);
  loading = signal<boolean>(true);

  // Contadores por estado oficial de UniTicket
  totalTickets = signal<number>(0);
  pendientes = signal<number>(0);
  enProceso = signal<number>(0);
  observados = signal<number>(0);
  procedes = signal<number>(0);
  noProcedes = signal<number>(0);

  // Datos para el gráfico ut-bar-chart
  categoriasStats = signal<{ key: string; label: string; count: number; percentage: number }[]>([]);
  categoriaTop = signal<{ label: string; count: number; percentage: number } | null>(null);

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.loading.set(true);
    this.ticketService.listar().subscribe({
      next: (data) => {
        this.tickets.set(data);
        this.calcularMetricas(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar indicadores:', err);
        this.loading.set(false);
      }
    });
  }

  calcularMetricas(data: any[]) {
    const isAdmin = this.authService.esAdmin?.() ?? false;
    const lista = data; // Si es estudiante, el servicio o la vista puede filtrar; aquí tomamos el total o adaptamos según el rol

    this.totalTickets.set(lista.length);
    this.pendientes.set(lista.filter((t: any) => t.sEstado === 'PENDIENTE').length);
    this.enProceso.set(lista.filter((t: any) => t.sEstado === 'EN_PROCESO').length);
    this.observados.set(lista.filter((t: any) => t.sEstado === 'OBSERVADO').length);
    this.procedes.set(lista.filter((t: any) => t.sEstado === 'PROCEDE').length);
    this.noProcedes.set(lista.filter((t: any) => t.sEstado === 'NO_PROCEDE').length);

    // Estadísticas para ut-bar-chart por categoría
    const tiposMap: { [key: string]: { label: string; count: number } } = {
      CERTIFICADO: { label: 'Certificado de estudios', count: 0 },
      CITA_TUTOR: { label: 'Cita con tutor', count: 0 },
      PENSION: { label: 'Pensión y pagos', count: 0 },
      DOCUMENTOS: { label: 'Trámite de documentos', count: 0 }
    };

    lista.forEach((t: any) => {
      if (tiposMap[t.sTipo]) {
        tiposMap[t.sTipo].count++;
      }
    });

    const totalCount = lista.length || 1;
    const statsArray = Object.entries(tiposMap).map(([key, val]) => ({
      key,
      label: val.label,
      count: val.count,
      percentage: Math.round((val.count * 100) / totalCount)
    })).sort((a, b) => b.count - a.count);

    this.categoriasStats.set(statsArray);
    if (statsArray.length > 0) {
      this.categoriaTop.set(statsArray[0]);
    }
  }
}