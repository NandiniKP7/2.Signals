import { Component } from '@angular/core';
import { ProductSelection } from './products/product-selection/product-selection';

@Component({
  selector: 'app-root',
  imports: [ProductSelection],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = 'Acme Product Management';
}
