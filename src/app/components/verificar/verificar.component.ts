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
  fileType!: string;
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

  onFileSelected(event: any) {
    const file: File = event.target.files[0];

    if (!file) {
      this.base64Output = '';
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg'];

    /*if (file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf')) {
      this.popUpMan.showErrorAlert('Solo se permiten archivos PDF, por favor ingresa un archivo válido.');
      this.base64Output = '';
      this.fileName = '';
      return;
    }*/

    if (!allowedTypes.includes(file.type)) {
      this.popUpMan.showErrorAlert('Solo se permiten archivos PDF o JPG, por favor ingresa un archivo válido.');
      this.base64Output = '';
      this.fileName = '';
      return;
    }

    this.fileName = file.name;
    this.fileType = file.type;
    this.convertFile(file).subscribe(base64 => {
      this.base64Output = base64;
      //this.loadPdf();
      this.loadFileBlob()
    });
  }

  convertFile(file: File): Observable<string> {
    const result = new ReplaySubject<string>(1);
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (event) => result.next(btoa(reader.result!.toString()));
    return result;
  }

  /*loadPdf(): void {
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
  }*/

  loadFileBlob(): void {
    if (!this.base64Output || !this.fileType) {
      return;
    }

    const binary = atob(this.base64Output.replace(/\s/g, ''));
    const len = binary.length;
    const buffer = new ArrayBuffer(len);
    const view = new Uint8Array(buffer);

    for (let i = 0; i < len; i++) {
      view[i] = binary.charCodeAt(i);
    }

    const blob = new Blob([view], { type: this.fileType });
    const url = window.URL.createObjectURL(blob);
    this.pdfURL = url; // esta url puede ser para PDF o imagen
  }


  public checkFirma() {
    if (!this.captchaToken) {
      this.popUpMan.showErrorAlert('Por favor completa el reCAPTCHA.');
      return;
    }

    if (!this.firmaId || this.firmaId.length !== 36) {
      this.popUpMan.showErrorAlert('Revisa el código de verificación, por favor ingresa un código válido.');
      return;
    }

    if (this.base64Output == null) this.base64Output = '';
    if (this.pdfURL == null) this.pdfURL = '';

    Swal.fire({
      title: 'Por favor espera, mientras valido el código de verificación y el archivo',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const payload = [
      {
        pdf_base64: this.base64Output,
        firma: this.firmaId,
        urlFileUp: this.pdfURL,
      },
    ];

    this.verificacionFirmaService.post('verificar_firma', payload).subscribe({
      next: async (res: any) => {
        Swal.close();

        this.captchaRef.reset();
        this.captchaToken = '';
        this.captchaPassed = false;

        if (!res.Success) {
          this.popUpMan.showErrorAlert('Se genero un error en la verificación, debido al archivo o código de verificación.');
          return;
        }

        const verificacion = res.Data?.Verificacion;
        const virus = res.Data?.Virus;
        const fileEqual = verificacion?.fileEqual ?? false;
        const archivoInfectado = virus?.archive === 'infected';

        if (archivoInfectado) {
          this.popUpMan.showAlert('Atención', 'Se detecto que el archivo puede contener virus. No se puede validar la firma.');
          return;
        }

        if (!fileEqual) {
          this.popUpMan.showAlert('Atención', 'Se archivo adjunto no coincide o fue modificado al original.');
          return;
        }

        this.popUpMan.showSuccessAlert('Se verificó correctamente que es valida la firma digital y el archivo no tiene modificaciones.');
      },

      error: (err) => {
        Swal.close();
        this.captchaRef.reset();
        this.captchaToken = '';
        this.captchaPassed = false;
        this.popUpMan.showErrorAlert('Se genero un error en la verificación, debido al archivo o código de verificación, por favor revísalos.');
      },
    });
  }

  onCaptchaResolved(token: string | null): void {
    if (token) {
      this.captchaToken = token;
      this.captchaPassed = true;
    } else {
      this.captchaToken = '';
      this.captchaPassed = false;
    }
  }

}
