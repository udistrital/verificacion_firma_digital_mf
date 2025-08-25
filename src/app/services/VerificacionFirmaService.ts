import { Injectable } from "@angular/core";
import { RequestManager } from "../managers/requestManager";

@Injectable({
    providedIn: 'root'
})
export class VerificacionFirmaService {

    constructor(private readonly requestManager: RequestManager) {
        this.requestManager.setPath('VERIFICACION_FIRMA_SERVICE');
    }

    getOne(firmaId: string, base64Output: string, pdfURL: string) {
        this.requestManager.setPath('VERIFICACION_FIRMA_SERVICE');
        return this.requestManager.get(`get_one/${firmaId}`);
    }

    getUrlFile(base64: any, minetype: any) {
        return new Promise((resolve, reject) => {
            const url = `data:${minetype};base64,${base64}`;
            fetch(url)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], 'File name', { type: minetype });
                    const urlF = URL.createObjectURL(file);
                    resolve(urlF);
                });
        });
    }

    /*getUrlFile(file: any, mimeType: string): string {
        const byteCharacters = atob(file);
        const byteArrays = [];
        for (let i = 0; i < byteCharacters.length; i++) {
          byteArrays.push(byteCharacters.charCodeAt(i));
        }
        const blob = new Blob([new Uint8Array(byteArrays)], { type: mimeType });
        return URL.createObjectURL(blob);
    }*/
      

    post(endpoint: string, element: any) {
        this.requestManager.setPath('VERIFICACION_FIRMA_SERVICE');
        return this.requestManager.post(endpoint, element);
    }
}
