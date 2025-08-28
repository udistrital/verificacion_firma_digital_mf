import { bootstrapApplication } from '@angular/platform-browser';
import { enableProdMode } from '@angular/core';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

// Lógica para obtener el token antes de iniciar la app
fetch(environment.AUTENTICACION_MID + 'token/clientAuth', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    clienteId: btoa(environment.TOKEN.CLIENTE_ID),
    documento: environment.TOKEN.CLIENTE_ID
  })
})
  .then(res => res.json())
  .then(data => {
    localStorage.setItem('access_token', data.access_token);
    bootstrapApplication(AppComponent, appConfig)
      .catch((err) => console.error(err));
  })
  .catch(error => {
    console.error('Error obteniendo token:', error);
  });
