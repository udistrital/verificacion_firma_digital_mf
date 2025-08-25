import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { VerificarComponent } from './components/verificar/verificar.component';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, VerificarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'verificacion_firma_digital_mf';
  environment = environment; // Puedes acceder a environment.variable en HTML o TS

  ngOnInit(): void {
    console.log('Ambiente:', this.environment);
    // Puedes ejecutar lógica basada en variables del entorno, por ejemplo:
    // if (this.environment.production) { ... }
  }
}
