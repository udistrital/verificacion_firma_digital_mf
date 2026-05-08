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

    post(endpoint: string, element: any) {
        this.requestManager.setPath('VERIFICACION_FIRMA_SERVICE');
        return this.requestManager.post(endpoint, element);
    }

    resolveQrToken(token: string) {
        this.requestManager.setPath('FIRMA_ELECTRONICA_SERVICE');
        return this.requestManager.get(`qr/resolve/${encodeURIComponent(token)}`);
    }

    async getSecureDocumentFile(documentUrl: string) {
        const documentResponse = await fetch(documentUrl);
        if (!documentResponse.ok) {
            throw new Error(`file_${documentResponse.status}`);
        }

        return {
            blob: await documentResponse.blob(),
            filename: 'documento.pdf',
            mimeType: documentResponse.headers.get('Content-Type') || 'application/pdf',
        };
    }
}
