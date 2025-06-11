import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);

window.addEventListener('load', () => {
  console.log('!!! [HARD RELOAD] Страница полностью загружена');
});

window.addEventListener('beforeunload', () => {
  console.log('Страница собирается перезагрузиться или закрыться (Angular)');
});

window.addEventListener('unload', (e) => {
  console.log('unload! Stack:', new Error().stack);
});