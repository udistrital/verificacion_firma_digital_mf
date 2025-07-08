import { Injectable } from '@angular/core';
import { RequestManager } from '../managers/requestManager';
import { PopUpManager } from '../managers/popUpManager';

@Injectable({
  providedIn: 'root',
})
export class FirmaElectronicaService {

  constructor(
    private rqManager: RequestManager,
    private pUpManager: PopUpManager,
  ) { }

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

  getOne(firma: string, fileUp: string, urlFileUp: string) {
    this.rqManager.setPath('FIRMA_ELECTRONICA_SERVICE');
    const payload = [
      {
        firma,
        fileUp,
        urlFileUp,
      },
    ];
    return this.rqManager.post('verify', payload);
  }

}
