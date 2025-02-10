import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import PocketBase from 'pocketbase';

@Injectable({
  providedIn: 'root'
})
export class RealtimeSalesService {
  private pb: PocketBase;
  private salesSubject = new BehaviorSubject<any[]>([]);
  public sales$ = this.salesSubject.asObservable();

  constructor() {
    this.pb = new PocketBase('https://db.buckapi.com:8095');
    
    // Autenticación
    this.pb.collection('users')
      .authWithPassword('admin@email.com', 'admin1234')
      .then(() => {
        console.log('Autenticado');
        this.subscribeToRealtimeChanges();
      })
      .catch(err => {
        console.error('Error al autenticar:', err);
      });
  }

  private subscribeToRealtimeChanges(): void {
    // Obtener todos los registros existentes
    this.pb.collection('sales').getList(1, 50).then(records => {    
      this.salesSubject.next(records.items);
      
      // Suscribirse a los cambios en tiempo real
      this.pb.collection('sales').subscribe('*', (e) => {
        console.log(e.action, e.record);
        
        const currentSales = this.salesSubject.value;
        let updatedSales;

        switch (e.action) {
          case 'create':
            updatedSales = [...currentSales, e.record];
            break;
          case 'update':
            updatedSales = currentSales.map(req => 
              req.id === e.record.id ? e.record : req
            );
            break;
          case 'delete':
            updatedSales = currentSales.filter(req => req.id !== e.record.id);
            break;
          default:
            updatedSales = currentSales;  
        }

        this.salesSubject.next(updatedSales);
      });
    });
  }

  public unsubscribeFromRealtimeChanges(): void {
    this.pb.collection('sales').unsubscribe('*');
  }
}