import { bootstrapApplication } from '@angular/platform-browser';
import { enableProdMode } from '@angular/core';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

console.log('API base URL:', environment.apiUrl);

// Lógica para obtener el token antes de iniciar la app
fetch(environment.AUTENTICACION_MID + 'token/clientAuth', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    clienteId: btoa(environment.TOKEN.CLIENTE_ID),
    documento: '8F0cB3XNG1bY9Quz_utqRDE9yh4a'
  })
})
  .then(res => res.json())
  .then(data => {
    console.log('Token recibido:', data);
    // Si quieres guardar el token globalmente:
    localStorage.setItem('access_token', data.access_token);
    bootstrapApplication(AppComponent, appConfig)
      .catch((err) => console.error(err));
  })
  .catch(error => {
    console.error('Error obteniendo token:', error);
  });
