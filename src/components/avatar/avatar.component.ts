
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="containerClass()" [style.background-color]="!imageUrl() ? backgroundColor() : 'transparent'">
      @if (imageUrl()) {
        <img [src]="imageUrl()" [alt]="name()" class="w-full h-full object-cover rounded-full" />
      } @else {
        <span [class]="textClass()">{{ initials() }}</span>
      }
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarComponent {
  name = input.required<string>();
  imageUrl = input<string | null | undefined>();
  size = input<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md');
  customClass = input<string>('');

  initials = computed(() => {
    const name = this.name();
    if (!name) return '';
    const parts = name.split(' ').filter(p => p.length > 0);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  });

  backgroundColor = computed(() => {
    const name = this.name();
    if (!name) return '#ccc';
    const colors = [
      '#F87171', '#FB923C', '#FBBF24', '#34D399', '#2DD4BF', 
      '#38BDF8', '#818CF8', '#A78BFA', '#F472B6', '#94A3B8'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  });

  containerClass = computed(() => {
    const sizeClasses = {
      'xs': 'w-6 h-6 text-[10px]',
      'sm': 'w-8 h-8 text-xs',
      'md': 'w-10 h-10 text-sm',
      'lg': 'w-12 h-12 text-base',
      'xl': 'w-16 h-16 text-xl'
    };
    return `flex items-center justify-center rounded-full overflow-hidden font-bold text-white transition-colors ${sizeClasses[this.size()]} ${this.customClass()}`;
  });

  textClass = computed(() => {
    return 'select-none';
  });
}
