import { Injectable } from '@angular/core';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';


@Injectable({
    providedIn: 'root',
})
export class PopUpManager {
    constructor(
        private readonly snackBar: MatSnackBar,
        private readonly translate: TranslateService,
    ) { }

    public showToast(message: string, duration: number = 3000) {
        this.translate.get('GLOBAL.cerrar').subscribe(cerrar => {
            this.snackBar.open(message, cerrar, {
                duration: duration,
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                panelClass: ['success-snackbar']
            });
        });
    }

    public showErrorToast(message: string, duration: number = 3000) {
        this.translate.get('GLOBAL.cerrar').subscribe(cerrar => {
            this.snackBar.open(message, cerrar, {
                duration: duration,
                panelClass: ['error-snackbar'],
            });
        });
    }

    public showInfoToast(message: string, duration: number = 3000) {
        this.translate.get('GLOBAL.cerrar').subscribe(cerrar => {
            this.snackBar.open(message, cerrar, {
                duration: duration,
                panelClass: ['info-snackbar'],
            });
        });
    }

    public showAlert(title: string, text: string) {
        this.translate.get(['GLOBAL.aceptar']).subscribe(translations => {
            Swal.fire({
                icon: 'info',
                title: title,
                text: text,
                confirmButtonText: translations['GLOBAL.aceptar'],
            });
        });
    }

    public showAlertDos(status: string, text: string, titulo: string = status) {
        return this.showAlertWithOptions({
            type: status,
            title: titulo,
            text: text,
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
    }

    public showAlertWithOptions(options: any) {
        return (Swal as any).fire(options);
    }

    public showSuccessAlert(text: string) {
        this.translate.get(['GLOBAL.operacion_exitosa', 'GLOBAL.aceptar']).subscribe(translations => {
            Swal.fire({
                icon: 'success',
                title: translations['GLOBAL.operacion_exitosa'],
                text: text,
                confirmButtonText: translations['GLOBAL.aceptar'],
            });
        });
    }

    public showErrorAlert(text: string) {
        this.translate.get(['GLOBAL.error', 'GLOBAL.aceptar']).subscribe(translations => {
            Swal.fire({
                icon: 'error',
                title: translations['GLOBAL.error'],
                text: text,
                confirmButtonText: translations['GLOBAL.aceptar'],
            });
        });
    }

    public showConfirmAlert(text: string): Promise<any> {
        return this.translate.get(['GLOBAL.atencion', 'GLOBAL.aceptar', 'GLOBAL.cancelar']).toPromise().then(translations => {
            return Swal.fire({
                title: translations['GLOBAL.atencion'],
                text: text,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: translations['GLOBAL.aceptar'],
                cancelButtonText: translations['GLOBAL.cancelar'],
            });
        });
    }

    public showPopUpGeneric(title: string, text: string, type: any, cancelar: boolean): Promise<any> {
        return this.translate.get(['GLOBAL.aceptar', 'GLOBAL.cancelar']).toPromise().then(translations => {
            return Swal.fire({
                title: title,
                html: text,
                icon: type,
                showCancelButton: cancelar,
                allowOutsideClick: !cancelar,
                confirmButtonText: translations['GLOBAL.aceptar'],
                cancelButtonText: translations['GLOBAL.cancelar'],
            });
        });
    }

    public showPopUpForm(title: string, form: { html: string[]; ids: any[]; }, cancelar: boolean): Promise<any> {
        return this.translate.get(['GLOBAL.aceptar', 'GLOBAL.cancelar']).toPromise().then(translations => {
            return Swal.fire({
                title: title,
                html: form.html,
                showCancelButton: cancelar,
                allowOutsideClick: !cancelar,
                confirmButtonText: translations['GLOBAL.aceptar'],
                cancelButtonText: translations['GLOBAL.cancelar'],
                preConfirm: () => {
                    const results: { [key: string]: any } = {};
                    form.ids.forEach(id => {
                        const element = <HTMLInputElement>Swal.getPopup()!.querySelector('#' + id);
                        results[id] = element.value;
                    });
                    return results;
                },
            });
        });
    }

    public showSignAlert (text: number) {
        let translatedText = '';
        let errorTipo = 'warning';
        let operacionTipo = 'Atención';
        switch (text) {
            case 1:
                translatedText = this.translate.instant('GLOBAL.firmaInvalida');
                break;
            case 2:
                translatedText = this.translate.instant('GLOBAL.docsComp');
                break;
            case 3:
                translatedText = this.translate.instant('GLOBAL.firmaVerificada');
                errorTipo = 'success';
                operacionTipo = 'GLOBAL.operacion_exitosa';
                break;
        }
        return this.showAlertDos(errorTipo, translatedText,
            this.translate.instant(operacionTipo));
    }
}
