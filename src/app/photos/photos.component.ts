import { Component, OnInit, HostListener } from '@angular/core';
import { PhotoService } from '../photos.service';
import { Photo } from '../models/photo.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-photos',
  templateUrl: './photos.component.html',
  styleUrls: ['./photos.component.scss']
})
export class PhotosComponent implements OnInit {
  photos: Photo[] = [];
  loading: boolean = false;
  currentPage: number = 1;

  constructor(private photoService: PhotoService, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.loadMorePhotos();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event): void {
    // Check if event.target is defined
    const target = event.target ? (event.target as Document) : document;

    // Calculate if we're at the bottom of the page
    const isAtBottom =
      target.documentElement.scrollHeight - target.documentElement.scrollTop <=
      target.documentElement.clientHeight + 1;

    // If we're at the bottom and not loading, load more photos
    if (isAtBottom && !this.loading) {
      this.loadMorePhotos();
    }
  }

  loadMorePhotos(): void {
    this.loading = true;
    this.photoService.getPhotos(this.currentPage).subscribe(newPhotos => {
      this.photos.push(...newPhotos);
      this.loading = false;
      this.currentPage++;
    }, error => {
      console.error('Error loading photos:', error);
      this.snackBar.open('Failed to load photos. Please try again.', 'Close', {
        duration: 3000,
      });
      this.loading = false;
    });
  }

  addToFavorites(photo: Photo): void {
    const favorites = this.photoService.getFavoritesSignal()(); // Get current favorites

    const exists = favorites.some(fav => fav.id === photo.id); // Check if photo is already in favorites

    if (!exists) {
      this.photoService.addToFavorites(photo); // Add photo to favorites
      this.snackBar.open('Photo added to favorites!', 'Close', {
        duration: 2000,
      });
    } else {
      this.snackBar.open('Photo is already in favorites!', 'Close', {
        duration: 2000,
      });
    }
  }
}
