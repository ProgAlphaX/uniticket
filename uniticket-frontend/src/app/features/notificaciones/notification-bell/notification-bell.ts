import {
    ChangeDetectionStrategy,
    Component,
    inject,
    output,
} from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';

import { NotificationService } from '../data/notification.service';

@Component({
    selector: 'ut-notification-bell',
    standalone: true,
    imports: [
        MatButtonModule,
        MatBadgeModule,
        MatIconModule,
    ],
    templateUrl: './notification-bell.html',
    styleUrl: './notification-bell.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationBell {

    private readonly notifications = inject(NotificationService);

    readonly abrir = output<void>();

    protected readonly noLeidas = this.notifications.noLeidas;

    protected abrirPanel(): void {
        this.abrir.emit();
    }
}