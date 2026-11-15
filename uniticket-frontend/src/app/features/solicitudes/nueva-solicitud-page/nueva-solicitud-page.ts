import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TicketService } from '../data/ticket.service';

@Component({
  selector: 'ut-nueva-solicitud-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './nueva-solicitud-page.html',
  styleUrl: './nueva-solicitud-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NuevaSolicitudPage {
  private fb = inject(FormBuilder);
  private ticketService = inject(TicketService);
  private router = inject(Router);

  // Categorías oficiales de UniTicket (ut-category-picker)
  categorias = [
    { id: 'CERTIFICADO', nombre: 'Certificado de estudios', descripcion: 'Constancias y certificados de notas' },
    { id: 'CITA_TUTOR', nombre: 'Cita con tutor', descripcion: 'Asesoría académica o de tesis' },
    { id: 'PENSION', nombre: 'Pensión y pagos', descripcion: 'Cuotas, boletas, fraccionamiento' },
    { id: 'DOCUMENTOS', nombre: 'Trámite de documentos', descripcion: 'Carné, convalidaciones, datos' }
  ];

  // Formulario reactivo con validaciones (FRM-02)
  form: FormGroup = this.fb.group({
    sTipo: ['', Validators.required],
    sAsunto: ['', [Validators.required, Validators.maxLength(150)]],
    sDescripcion: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(1000)]]
  });

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      nId_Usuario: 2, // ID de Ana Torres (estudiante de prueba)
      ...this.form.value
    };

    this.ticketService.crear(payload).subscribe({
      next: () => {
        this.router.navigate(['/solicitudes']);
      },
      error: (err) => {
        console.error('Error al registrar la solicitud:', err);
      }
    });
  }
}