import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import PocketBase from 'pocketbase';

@Injectable({
  providedIn: 'root'
})
export class RealtimeCategoriesService {
  private pb: PocketBase;
  private categoriesSubject = new BehaviorSubject<any[]>([]);
  public categories$ = this.categoriesSubject.asObservable();

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
    this.pb.collection('categories').getList(1, 50).then(records => {
      this.categoriesSubject.next(records.items);
      
      // Suscribirse a los cambios en tiempo real
      this.pb.collection('categories').subscribe('*', (e) => {
        console.log(e.action, e.record);
        
        const currentCategories = this.categoriesSubject.value;
        let updatedCategories;

        switch (e.action) {
          case 'create':
            updatedCategories = [...currentCategories, e.record];
            break;
          case 'update':
            updatedCategories = currentCategories.map(req => 
              req.id === e.record.id ? e.record : req
            );
            break;
          case 'delete':
            updatedCategories = currentCategories.filter(req => req.id !== e.record.id);
            break;
          default:
            updatedCategories = currentCategories;
        }

        this.categoriesSubject.next(updatedCategories);
      });
    });
  }

  public unsubscribeFromRealtimeChanges(): void {
    this.pb.collection('categories').unsubscribe('*');
  }
}