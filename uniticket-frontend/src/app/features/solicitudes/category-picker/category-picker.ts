import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { TIPO_DESCRIPCION, TIPO_ICONO, TIPOS, TipoTicket } from '../../../core/config/catalogos';

@Component({
  selector: 'ut-category-picker',
  imports: [MatIconModule],
  templateUrl: './category-picker.html',
  styleUrl: './category-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CategoryPicker), multi: true }],
})
export class CategoryPicker implements ControlValueAccessor {
  readonly invalido = input(false);

  protected readonly categorias = (Object.keys(TIPOS) as TipoTicket[]).map(tipo => ({
    tipo,
    nombre: TIPOS[tipo],
    descripcion: TIPO_DESCRIPCION[tipo],
    icono: TIPO_ICONO[tipo],
  }));
  protected readonly valor = signal<TipoTicket | ''>('');
  protected readonly deshabilitado = signal(false);

  private alCambiar: (valor: TipoTicket) => void = () => undefined;
  private alTocar: () => void = () => undefined;

  writeValue(valor: TipoTicket | '' | null): void {
    this.valor.set(valor ?? '');
  }

  registerOnChange(fn: (valor: TipoTicket) => void): void {
    this.alCambiar = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.alTocar = fn;
  }

  setDisabledState(deshabilitado: boolean): void {
    this.deshabilitado.set(deshabilitado);
  }

  protected elegir(tipo: TipoTicket): void {
    this.valor.set(tipo);
    this.alCambiar(tipo);
    this.alTocar();
  }

  protected tocar(): void {
    this.alTocar();
  }
}
