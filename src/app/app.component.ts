import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalService } from './services/global.service';
import { AuthPocketbaseService } from './services/auth-pocketbase.service';
import { ScriptService } from './services/script-service';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './components/home/home.component';
import { InventoryComponent } from './components/inventory/inventory.component';
import { SalesComponent } from './components/sales/sales.component';
import { EmployeesComponent } from './components/employees/employees.component';
import { SettingsComponent } from './components/settings/settings.component';
import { AccountingComponent } from './components/accounting/accounting.component';
import { TopNavbarComponent } from './components/ui/top-navbar/top-navbar.component';
import { SidebarComponent } from './components/ui/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    HomeComponent,
    InventoryComponent,
    SalesComponent,
    EmployeesComponent,
    SettingsComponent,
    AccountingComponent,
    TopNavbarComponent,
    SidebarComponent

  ],

  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'sistemaInventario';
constructor(
  public global: GlobalService,
  public auth:AuthPocketbaseService,
  public script: ScriptService
){
  this.auth.permision();  
  this.script.load(
    'jquery',
    'bootstrap',
    'phosphor',
    'file-upload',
    'plyr',
    'dataTables',
    'full-calendar',
    'jquery-ui',
    'editor-quill',
    'apex-charts',
    'jquery-jvectormap',
    'jquery-jvectormap-world',
    'main',
  )
    .then(() => {
      // console.log('Todos los scripts se cargaron correctamente');
    })
    .catch(error => console.log(error));
    

  
}
}
