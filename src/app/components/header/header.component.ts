import {Component, Input, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [MatSelectModule, RouterModule, CommonModule],
  encapsulation: ViewEncapsulation.Emulated,
})
export class HeaderComponent{
  @Input('appname') appname: any;
  @Input() menuApps: boolean = false;
  @Input() notificaciones: boolean = false;


  basePathAssets = environment.PRUEBAS_ASSETS;

  langs: string[] = ['es', 'en']; 
  langCookie: string = 'en';

  constructor(
    private translate: TranslateService
  ) {
    this.langCookie = getCookie('lang') || 'es';
    this.translate.setDefaultLang(this.langCookie);
  }

  cambiarIdioma(lang: string) {
    this.langCookie = lang;
    setCookie('lang', lang);
    const event = new CustomEvent('lang', {
      detail: { answer: lang },
    });
    window.dispatchEvent(event);
    this.translate.setDefaultLang(lang);
  }
}

export function setCookie(name: string, val: string) {
  const date = new Date();
  date.setTime(date.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 días
  document.cookie = `${name}=${val}; expires=${date.toUTCString()}; path=/`;
}

export function getCookie(name: string): string | undefined {
  const value = '; ' + document.cookie;
  const parts = value.split('; ' + name + '=');
  if (parts.length == 2) {
    return parts.pop()?.split(';').shift();
  }
  return undefined;
}
