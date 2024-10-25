import { Component, OnInit, Signal } from '@angular/core';
import { Router } from '@angular/router'; // Import Router
import { PhotoService } from '../photos.service';
import { Photo } from '../models/photo.model';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit {
  favorites: Signal<Photo[]>;

  constructor(private photoService: PhotoService, private router: Router) {
    this.favorites = this.photoService.getFavoritesSignal();
  }

  ngOnInit(): void {
    // No need to loadFavorites here since we have a signal
  }

  removeFromFavorites(photo: Photo): void {
    this.photoService.removeFromFavorites(photo);
  }

  goToDetail(photo: Photo): void {
    this.router.navigate(['/photos', photo.id]);
  }

  // Directly use the URL stored in the photo object for display
  getImageUrl(photo: Photo): string {
    return photo.url;
  }
}
