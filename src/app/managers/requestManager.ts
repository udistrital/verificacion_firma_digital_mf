import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, map } from 'rxjs/operators';
import { HttpErrorManager } from './errorManager';

/**
 * This class manage the http connections with internal REST services. Use the response format {
 *  Code: 'xxxxx',
 *  Body: 'Some Data' (this element is returned if the request is success)
 *  ...
 * }
 */
@Injectable({
  providedIn: 'root',
})
export class RequestManager {
  private path: string = "";
  public httpOptions: any;
  public httpOptionsOnlyAuth: any;
  constructor(
    private readonly http: HttpClient, 
    private readonly errManager: HttpErrorManager
  ) {
    const acces_token = window.localStorage.getItem('access_token');
    if (acces_token !== null) {
      this.httpOptions = {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${acces_token}`,
        }),
      };
      this.httpOptionsOnlyAuth = {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${acces_token}`,
        }),
      };
    }
  }

  private getHttpOptions() {
    const acces_token = window.localStorage.getItem('access_token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${acces_token}`,
      }),
    };
  }
  


  /**
   * Use for set the source path of the service (service's name must be present at src/environment/environment.ts)
   * @param service: string
   */
  public setPath(service: string) {
    this.path = <string>environment[service as keyof typeof environment];
  }


  /**
   * Perform a GET http request
   * @param endpoint service's end-point
   * @param params (an Key, Value object with que query params for the request)
   * @returns Observable<any>
   */
  get(endpoint: string) {
    return this.http.get<any>(`${this.path}${endpoint}`, this.getHttpOptions()).pipe(
      map(res => res instanceof HttpResponse ? res.body : res),
      catchError(this.errManager.handleError.bind(this)),
    );
  }

  /**
   * Perform a POST http request
   * @param endpoint service's end-point
   * @param element data to send as JSON
   * @returns Observable<any>
   */
  post(endpoint: string, element: any) {
    return this.http.post<any>(`${this.path}${endpoint}`, element, this.getHttpOptions()).pipe(
      map(res => res instanceof HttpResponse ? res.body : res),
      catchError(this.errManager.handleError),
    );
  }

};
