
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ConfettiPiece {
  left: string;
  top: string;
  animationDelay: string;
  animationDuration: string;
  color: string;
  transform: string;
}

@Component({
  selector: 'app-confetti',
  templateUrl: './confetti.component.html',
  styleUrls: ['./confetti.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class ConfettiComponent implements OnInit {
  confettiPieces = signal<ConfettiPiece[]>([]);
  
  private confettiCount = 150;
  private colors = ['#facc15', '#3b82f6', '#ec4899', '#4ade80', '#f97316'];

  ngOnInit() {
    this.generateConfetti();
  }

  private generateConfetti() {
    const pieces: ConfettiPiece[] = [];
    for (let i = 0; i < this.confettiCount; i++) {
      pieces.push({
        left: `${Math.random() * 100}vw`,
        top: `${-20 + Math.random() * -80}px`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${2 + Math.random() * 3}s`,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        transform: `rotate(${Math.random() * 360}deg)`
      });
    }
    this.confettiPieces.set(pieces);
  }
}
