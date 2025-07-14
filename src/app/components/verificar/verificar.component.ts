import { Component, OnInit, ViewChild } from '@angular/core';

import Swal from 'sweetalert2';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { FirmaElectronicaService } from '../../services/FirmaElectronicaService';
import { VerificacionFirmaService } from '../../services/VerificacionFirmaService';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable, ReplaySubject } from 'rxjs';
import { PopUpManager } from '../../managers/popUpManager';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { RecaptchaModule, RecaptchaComponent } from 'ng-recaptcha';


declare const grecaptcha: any;

@Component({
  selector: 'app-verificar',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, TranslateModule, RecaptchaModule],
  templateUrl: './verificar.component.html',
  styleUrl: './verificar.component.scss'
})
export class VerificarComponent implements OnInit {
  @ViewChild('captchaRef') captchaRef!: RecaptchaComponent;

  doc: any;
  firmaId!: string;
  base64Output!: string;
  fileName!: string;
  pdfURL?: any;
  fileSelected?: Blob;
  blob?: Blob;
  fileEqual: any;

  captchaToken: string = '';
  captchaPassed: boolean = false;

  constructor(
    public translate: TranslateService,
    private firmaElectronicaService: FirmaElectronicaService,
    private verificacionFirmaService: VerificacionFirmaService,
    private sanitization: DomSanitizer,
    private popUpMan: PopUpManager,
  ) { }

  ngOnInit() {
  }

  // Inicio captura documento
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.fileName = file.name;
      this.convertFile(file).subscribe(base64 => {
        this.base64Output = base64;
        this.loadPdf();
      });
    } else {
      this.base64Output = '';
    }
  }

  convertFile(file: File): Observable<string> {
    const result = new ReplaySubject<string>(1);
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (event) => result.next(btoa(reader.result!.toString()));
    return result;
  }
  loadPdf(): void {
    if (this.base64Output) {
      // Mostrar en iframe base 64
      const binary = atob(this.base64Output.replace(/\s/g, ''));
      const len = binary.length;
      const buffer = new ArrayBuffer(len);
      const view = new Uint8Array(buffer);

      for (let i = 0; i < len; i++) {
        view[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([view], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      this.pdfURL = url;
    }
  }
  // fin captura documento
  public checkFirma() {
    if (!this.captchaToken) {
      this.popUpMan.showErrorAlert('Por favor completa el reCAPTCHA.');
      return;
    }

    if (!this.firmaId || this.firmaId.length !== 36) {
      this.popUpMan.showSignAlert(1);
      return;
    }
    if (this.base64Output == null) {
      this.base64Output = '';
    }
    if (this.pdfURL == null) {
      this.pdfURL = '';
    }
    Swal.fire({
      title: 'Por favor espera, cargando documento',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    
    /*this.firmaElectronicaService.getOne(this.firmaId, this.base64Output, this.pdfURL)
      .subscribe(async (data: any) => {
        const url = await this.firmaElectronicaService.getUrlFile(data.res[0].file, data.res[0]['file:content']['mime-type']);
        this.fileEqual = await data.res[0].fileEqual;
        this.pdfURL = this.sanitization.bypassSecurityTrustResourceUrl(data.res[0].urlFileUp);
        if (url) {
          console.info(url);
          this.doc = this.sanitization.bypassSecurityTrustResourceUrl(url.toString());
        }
        Swal.close();
        if (!this.fileEqual) {
          this.popUpMan.showSignAlert(2);
        } else {
          this.popUpMan.showSignAlert(3);
        }
        this.captchaRef.reset();
        this.captchaToken = '';
        this.captchaPassed = false;
      });*/
      const payload = [
        {
          pdf_base64: this.base64Output,        // base64 del PDF firmado (cadena larga)
          firma: this.firmaId,                  // UUID de la firma
          urlFileUp: this.pdfURL        // URL del archivo en el servidor
        }
      ];
console.log('Payload enviado:', payload);
        this.verificacionFirmaService.post('verificar_firma', payload)
          .subscribe((res) => {
            console.log('Verificación enviada:', res);
            Swal.close();
          });

  }



  onCaptchaResolved(token: string | null): void {
    if (token) {
      console.log('CAPTCHA resuelto con token:', token);
      this.captchaToken = token;
      this.captchaPassed = true;
    } else {
      console.warn('CAPTCHA no resuelto');
      this.captchaToken = '';
      this.captchaPassed = false;
    }
  }



}
