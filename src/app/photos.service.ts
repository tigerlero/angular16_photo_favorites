import { Injectable, Signal, signal } from '@angular/core';
import { Photo } from './models/photo.model';
import { v4 as uuidv4 } from 'uuid';
import { Observable, forkJoin, of } from 'rxjs';
import { map, delay, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  baseUrl = 'https://picsum.photos/300/300';
  private favoritesSignal = signal<Photo[]>([]);

  constructor(private http: HttpClient) {
    this.loadFavoritesFromStorage();
  }

  getPhotos(page: number): Observable<Photo[]> {
    const photoRequests: Observable<Photo>[] = [];

    // Adjust the number of photos based on your pagination logic
    for (let i = 0; i < 9; i++) {
      photoRequests.push(
        this.http.get(this.baseUrl, { responseType: 'blob', observe: 'response' }).pipe(
          map(response => {
            const imageUrl = response.url || '';
            return {
              id: uuidv4(), // Generate a UUID for the photo
              url: imageUrl, // Use the extracted URL
              title: `Random Photo ${i + (page - 1) * 9}` // Optional title with pagination
            };
          }),
          catchError(error => {
            console.error('Error fetching photo:', error);
            return of({ id: uuidv4(), url: '', title: 'Error fetching photo' }); // Fallback object
          })
        )
      );
    }

    return forkJoin(photoRequests).pipe(
      delay(Math.random() * 100 + 200) // Simulate network delay
    );
  }

  getFavoritesSignal(): Signal<Photo[]> {
    return this.favoritesSignal;
  }

  addToFavorites(photo: Photo): void {
    const currentFavorites = this.favoritesSignal(); // Get current list of favorites
    // Check if the photo is already in favorites before adding
    if (!currentFavorites.some(f => f.url === photo.url)) {
      const newFavorites = [...currentFavorites, photo]; // Add new photo to favorites
      this.favoritesSignal.set(newFavorites); // Update the signal
      this.updateLocalStorage(newFavorites); // Update local storage
    } else {
      console.log('Photo already in favorites'); // Optional: log if already a favorite
    }
  }

  removeFromFavorites(photo: Photo): void {
    const currentFavorites = this.favoritesSignal(); // Get current list of favorites
    const newFavorites = currentFavorites.filter(f => f.url !== photo.url); // Remove the specified photo
    this.favoritesSignal.set(newFavorites); // Update the signal
    this.updateLocalStorage(newFavorites); // Update local storage
  }

  loadFavoritesFromStorage(): void {
    const storedFavorites = localStorage.getItem('favorites'); // Get favorites from local storage
    this.favoritesSignal.set(storedFavorites ? JSON.parse(storedFavorites) : []); // Set the signal
  }

  private updateLocalStorage(favorites: Photo[]): void {
    localStorage.setItem('favorites', JSON.stringify(favorites)); // Save favorites to local storage
  }
}
