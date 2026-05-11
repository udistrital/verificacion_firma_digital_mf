import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';

import Swal from 'sweetalert2';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { VerificacionFirmaService } from '../../services/VerificacionFirmaService';
import { Observable, ReplaySubject, firstValueFrom } from 'rxjs';
import { PopUpManager } from '../../managers/popUpManager';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { environment } from '../../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { RecaptchaModule, RecaptchaComponent } from 'ng-recaptcha';
import { getCookie } from '../header/header.component';

@Component({
  selector: 'app-verificar',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, TranslateModule, RecaptchaModule],
  templateUrl: './verificar.component.html',
  styleUrl: './verificar.component.scss'
})
export class VerificarComponent implements OnInit, OnDestroy {
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
  qrToken = '';
  qrViewerUrl?: SafeResourceUrl;
  qrViewerBlobUrl = '';
  qrMode = false;
  qrLoading = false;
  qrError = '';

  captchaKey = environment.CAPTCHA_SITE_KEY;
  captchaToken: string = '';
  captchaPassed: boolean = false;

  constructor(
    public translate: TranslateService,
    private verificacionFirmaService: VerificacionFirmaService,
    private popUpMan: PopUpManager,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
    const lang = getCookie('lang') || 'es';
    this.translate.setDefaultLang(lang);
    void this.translate.use(lang);

    this.route.queryParamMap.subscribe((params) => {
      const token = params.get('token')?.trim() || '';
      if (!token) {
        return;
      }
      this.qrToken = token;
      this.qrMode = true;
      void this.loadQrDocument(token);
    });
  }

  ngOnDestroy() {
    if (this.qrViewerBlobUrl) {
      URL.revokeObjectURL(this.qrViewerBlobUrl);
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];

    if (!file) {
      this.base64Output = '';
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg'];

    if (!allowedTypes.includes(file.type)) {
      let mensaje = this.translate.instant('POPUP.archivo_invalido');
      this.popUpMan.showErrorAlert(mensaje);
      this.base64Output = '';
      this.fileName = '';
      return;
    }

    this.fileName = file.name;
    this.fileType = file.type;
    this.convertFile(file).subscribe(base64 => {
      this.base64Output = base64;
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
    this.pdfURL = url; 
  }


  public checkFirma() {
    if (!this.captchaToken) {
      let mensaje = this.translate.instant('POPUP.falta_captcha');
      this.popUpMan.showErrorAlert(mensaje);
      return;
    }

    if (!this.firmaId || this.firmaId.length !== 36) {
      let mensaje = this.translate.instant('POPUP.falta_codigo_verificacion');
      this.popUpMan.showErrorAlert(mensaje);
      return;
    }

    if (this.base64Output == null) this.base64Output = '';
    if (this.pdfURL == null) this.pdfURL = '';

    let titulo = this.translate.instant('POPUP.mensaje_espera');
    Swal.fire({
      title: titulo,
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

        this.captchaRef?.reset();
        this.captchaToken = '';
        this.captchaPassed = false;

        if (!res.Success) {
          let mensaje = this.translate.instant('POPUP.error_verificacion');
          this.popUpMan.showErrorAlert(mensaje);
          return;
        }

        const verificacion = res.Data?.Verificacion;
        const virus = res.Data?.Virus;
        const fileEqual = verificacion?.fileEqual ?? false;
        const archivoInfectado = virus?.archive === 'infected';

        let tituloAtencion = this.translate.instant('POPUP.titulo_atencion');
        if (archivoInfectado) {
          let mensaje = this.translate.instant('POPUP.puede_contener_virus');
          this.popUpMan.showAlert(tituloAtencion, mensaje);
          return;
        }

        if (!fileEqual) {
          let mensaje = this.translate.instant('POPUP.archivo_no_coincide');
          this.popUpMan.showAlert(tituloAtencion, mensaje);
          return;
        }

        let mensaje = this.translate.instant('POPUP.verificacion_exitosa');
        this.popUpMan.showSuccessAlert(mensaje);
      },

      error: (err) => {
        Swal.close();
        this.captchaRef?.reset();
        this.captchaToken = '';
        this.captchaPassed = false;
        let mensaje = this.translate.instant('POPUP.error_inesperado');
        this.popUpMan.showErrorAlert(mensaje);
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

  private async loadQrDocument(token: string) {
    this.qrLoading = true;
    this.qrError = '';

    const mensajeTraducido = await firstValueFrom(this.translate.get('POPUP.mensaje_espera_qr'));
    const mensaje = mensajeTraducido === 'POPUP.mensaje_espera_qr'
      ? 'Estamos validando la información. Esto puede tardar unos minutos, por favor espere.'
      : mensajeTraducido;
    Swal.fire({
      title: 'Por favor espere',
      text: mensaje,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.verificacionFirmaService.resolveQrToken(token).subscribe({
      next: async (res: any) => {
        try {
          if (res.Status !== '200' || !res.res?.token) {
            throw new Error('invalid_qr_payload');
          }

          const qrData = res.res;
          this.firmaId = qrData.firma_id;
          const fileUrl = this.verificacionFirmaService.buildSecureDocumentFileUrl(qrData.token, qrData.file_path);
          const fileData = await this.verificacionFirmaService.getSecureDocumentFile(fileUrl);
          if (this.qrViewerBlobUrl) {
            URL.revokeObjectURL(this.qrViewerBlobUrl);
          }

          this.qrViewerBlobUrl = window.URL.createObjectURL(fileData.blob);
          this.qrViewerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.qrViewerBlobUrl);
          this.doc = qrData;
          Swal.close();
        } catch (_error) {
          Swal.close();
          this.qrError = this.translate.instant('POPUP.error_documento_qr');
          this.popUpMan.showErrorAlert(this.qrError);
        } finally {
          this.qrLoading = false;
        }
      },
      error: () => {
        Swal.close();
        this.qrLoading = false;
        this.qrError = this.translate.instant('POPUP.error_documento_qr');
        this.popUpMan.showErrorAlert(this.qrError);
      },
    });
  }

}
