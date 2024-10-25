import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PhotosComponent } from './photos.component';
import { PhotoService } from '../photos.service';
import { Photo } from '../models/photo.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

class MockPhotoService {
  private favorites: Photo[] = []; // Array to mock favorites

  // Mocking the getPhotos method
  getPhotos(page: number) {
    const mockPhotos: Photo[] = [
      { id: '1', url: 'https://picsum.photos/300/300', title: 'Photo 1' },
      { id: '2', url: 'https://picsum.photos/300/300', title: 'Photo 2' },
    ];
    return of(mockPhotos); // Return an observable of mock photos
  }

  // Mocking the addToFavorites method
  addToFavorites(photo: Photo) {
    console.log('Mock addToFavorites called with:', photo);
    this.favorites.push(photo); // Add photo to favorites array
  }

  // Mocking the getFavoritesSignal method
  getFavoritesSignal() {
    return () => this.favorites; // Return a function that returns the favorites
  }
}

describe('PhotosComponent', () => {
  let component: PhotosComponent;
  let fixture: ComponentFixture<PhotosComponent>;
  let mockPhotoService: MockPhotoService;
  let snackBar: MatSnackBar;

  beforeEach(async () => {
    mockPhotoService = new MockPhotoService();

    await TestBed.configureTestingModule({
      declarations: [PhotosComponent],
      providers: [
        { provide: PhotoService, useValue: mockPhotoService },
        { provide: MatSnackBar, useValue: { open: jasmine.createSpy('open') } } // Mock MatSnackBar
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PhotosComponent);
    component = fixture.componentInstance;
    snackBar = TestBed.inject(MatSnackBar);
    fixture.detectChanges(); // Run change detection to initialize the component

    // Ensure the page is scrollable by adding more content
    const scrollableDiv = document.createElement('div');
    scrollableDiv.style.height = '2000px';
    document.body.appendChild(scrollableDiv);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load more photos on init', () => {
    expect(component.photos.length).toBe(2);
  });

  it('should add photo to favorites', () => {
    const mockPhoto: Photo = { id: '3', url: 'https://picsum.photos/300/300', title: 'Photo 3' };

    component.addToFavorites(mockPhoto);

    expect(snackBar.open).toHaveBeenCalledWith('Photo added to favorites!', 'Close', { duration: 2000 }); // Check if snackBar is called
  });

  it('should show message when photo is already in favorites', () => {
    const mockPhoto: Photo = { id: '1', url: 'https://picsum.photos/300/300', title: 'Photo 1' };

    // First, add the photo to favorites
    component.addToFavorites(mockPhoto);
    // Now try to add it again
    component.addToFavorites(mockPhoto);

    // Check that the snackbar shows the message for already existing favorites
    expect(snackBar.open).toHaveBeenCalledWith('Photo is already in favorites!', 'Close', { duration: 2000 });
  });

  it('should show error message when loading photos fails', () => {
    spyOn(mockPhotoService, 'getPhotos').and.returnValue(throwError('Error')); // Mock an error response
    component.loadMorePhotos(); // Call loadMorePhotos to trigger the error

    expect(snackBar.open).toHaveBeenCalledWith('Failed to load photos. Please try again.', 'Close', { duration: 3000 }); // Check if snackBar is called with error message
  });

  it('should increment currentPage after loading photos', () => {
    // Reset the currentPage before the test
    component.currentPage = 1;

    component.loadMorePhotos(); // Load more photos
    expect(component.currentPage).toBe(2); // Check if the page number is incremented

    // Call loadMorePhotos again to check if it increments correctly
    component.loadMorePhotos();
    expect(component.currentPage).toBe(3); // Check if the page number is incremented
  });
});
