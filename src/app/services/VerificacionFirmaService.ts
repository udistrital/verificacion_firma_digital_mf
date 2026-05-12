import { Injectable } from "@angular/core";
import { RequestManager } from "../managers/requestManager";
import { environment } from "../../environments/environment";

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
        return this.requestManager.post('qr/resolve', { token });
    }

    buildSecureDocumentFileUrl(filePath?: string) {
        const baseUrl = environment.FIRMA_ELECTRONICA_SERVICE.replace(/\/+$/, '');
        if (filePath) {
            return `${baseUrl}/${filePath.replace(/^\/+/, '')}`;
        }
        return `${baseUrl}/qr/file`;
    }

    async getSecureDocumentFile(token: string, documentUrl: string) {
        const accessToken = window.localStorage.getItem('access_token');
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const documentResponse = await fetch(documentUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({ token }),
        });
        if (!documentResponse.ok) {
            throw new Error(`file_${documentResponse.status}`);
        }

        const payload = await documentResponse.json();
        const documentData = payload?.res;
        if (payload?.Status !== '200' || !documentData?.file) {
            throw new Error('invalid_file_payload');
        }

        const binary = atob(documentData.file.replace(/\s/g, ''));
        const buffer = new ArrayBuffer(binary.length);
        const view = new Uint8Array(buffer);
        for (let i = 0; i < binary.length; i++) {
            view[i] = binary.charCodeAt(i);
        }

        return {
            blob: new Blob([view], { type: documentData.mime_type || 'application/pdf' }),
            filename: documentData.filename || 'documento.pdf',
            mimeType: documentData.mime_type || 'application/pdf',
        };
    }
}
