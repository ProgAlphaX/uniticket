import { HttpRequest } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';

export interface EntradaRed {
  id: number;
  metodo: string;
  url: string;
  status: number;
  autorizacion: string | null;
  enviado: unknown;
  respuesta: unknown;
  ms: number;
}

/** Guarda las últimas peticiones HTTP para la consola de red (solo en desarrollo). */
@Injectable({ providedIn: 'root' })
export class RequestLogService {
  private secuencia = 0;
  readonly entradas = signal<EntradaRed[]>([]);

  agregar(req: HttpRequest<unknown>, status: number, respuesta: unknown, ms: number): void {
    const entrada: EntradaRed = {
      id: ++this.secuencia,
      metodo: req.method,
      url: req.urlWithParams,
      status,
      autorizacion: req.headers.get('Authorization'),
      enviado: req.body,
      respuesta,
      ms: Math.round(ms),
    };
    this.entradas.update(lista => [entrada, ...lista].slice(0, 50));
  }

  limpiar(): void {
    this.entradas.set([]);
  }
}
