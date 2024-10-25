import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { FavoritesComponent } from './favorites.component';
import { PhotoService } from '../photos.service';
import { Photo } from '../models/photo.model';
import { Signal, signal } from '@angular/core';

class MockPhotoService {
  private favoritesSignal = signal<Photo[]>([
    { id: '1', url: 'https://picsum.photos/300/300', title: 'Photo 1' },
    { id: '2', url: 'https://picsum.photos/300/300', title: 'Photo 2' },
  ]);

  // Mock the signal to return an observable array for favorites
  getFavoritesSignal(): Signal<Photo[]> {
    return this.favoritesSignal;
  }

  // Mock removeFromFavorites method
  removeFromFavorites(photo: Photo) {
    console.log('Mock removeFromFavorites called with:', photo);
    const currentFavorites = this.favoritesSignal();
    this.favoritesSignal.set(currentFavorites.filter(f => f.id !== photo.id));
  }
}

describe('FavoritesComponent', () => {
  let component: FavoritesComponent;
  let fixture: ComponentFixture<FavoritesComponent>;
  let mockPhotoService: MockPhotoService;

  beforeEach(async () => {
    mockPhotoService = new MockPhotoService();

    await TestBed.configureTestingModule({
      declarations: [FavoritesComponent],
      providers: [
        { provide: PhotoService, useValue: mockPhotoService },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } }, // Mock Router
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FavoritesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Run change detection
  });

  it('should create', () => {
    expect(component).toBeTruthy(); // Check if the component is created
  });

  it('should call removeFromFavorites and update favorites', () => {
    const mockPhoto: Photo = { id: '1', url: 'https://picsum.photos/300/300', title: 'Test Photo' }; // Mock Photo

    spyOn(mockPhotoService, 'removeFromFavorites').and.callThrough(); // Spy on the remove method

    component.removeFromFavorites(mockPhoto); // Call the method to remove from favorites

    expect(mockPhotoService.removeFromFavorites).toHaveBeenCalledWith(mockPhoto); // Check if the method was called with the correct photo
    expect(component.favorites().length).toBe(1); // Check if the favorites list was updated
  });

  it('should navigate to photo detail page', () => {
    const mockRouter = TestBed.inject(Router); // Get the mocked Router instance
    const mockPhoto: Photo = { id: '1', url: 'https://picsum.photos/300/300', title: 'Test Photo' };

    component.goToDetail(mockPhoto); // Call the method to navigate to detail

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/photos', mockPhoto.id]); // Check if the navigation occurred with the correct path
  });

  it('should return the image URL correctly', () => {
    const mockPhoto: Photo = { id: '1', url: 'https://picsum.photos/300/300', title: 'Test Photo' };

    const url = component.getImageUrl(mockPhoto); // Call the method to get image URL

    expect(url).toBe(mockPhoto.url); // Check if the returned URL is correct
  });
});
