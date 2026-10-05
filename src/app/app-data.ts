import { InMemoryDbService } from 'angular-in-memory-web-api';

import { ProductData } from './products/product-data';
import { ReviewData } from './reviews/review-data';

// Required class for the In Memory Web API
export class AppData implements InMemoryDbService {

  // Creates the 'in memory' database
  // Can then issue http requests to retrieve this data,
  // just as if the data were located on a backend server
  createDb() {
    const products = ProductData.products;
    const reviews = ReviewData.reviews;
    return { products, reviews };
  }
}
