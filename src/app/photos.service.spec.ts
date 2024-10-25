import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PhotoService } from './photos.service';
import { Photo } from './models/photo.model';

describe('PhotoService', () => {
  let service: PhotoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PhotoService]
    });

    service = TestBed.inject(PhotoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Ensure no outstanding requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch 9 photos', () => {
    // Call the getPhotos method and subscribe to the response
    service.getPhotos(1).subscribe(photos => {
      expect(photos.length).toBe(9); // Expecting 9 photos to be returned
      expect(photos.every(photo => photo.id)).toBe(true); // Validate that each photo has an ID
      expect(photos[0].url).toContain('https://picsum.photos/300/300'); // Check that the URL is from the expected base URL
    });

    // Expecting 9 requests to the base URL since we fetch 9 photos
    const reqs = httpMock.match(service.baseUrl); // Get all requests matching the base URL
    expect(reqs.length).toBe(9); // Check that we have exactly 9 requests

    // Iterate over each request to verify and flush the responses
    reqs.forEach(req => {
      expect(req.request.method).toBe('GET'); // Verify that the method is GET
      req.flush(new Blob(), { status: 200, statusText: 'OK' }); // Respond with an empty blob for each request
    });

    // Ensure no other requests are pending
    httpMock.verify();
  });

  it('should add a photo to favorites', () => {
    const photo: Photo = { id: '1', url: 'https://picsum.photos/300/300', title: 'Photo 1' }; // Including ID

    service.addToFavorites(photo);
    const favorites = service.getFavoritesSignal()();
    expect(favorites).toContain(photo); // Check if photo was added to favorites
  });

  it('should not add duplicate favorites', () => {
    const photo: Photo = { id: '1', url: 'https://picsum.photos/300/300', title: 'Photo 1' };
    let favorites = service.getFavoritesSignal()();
    let counter = favorites.length;
    const exists = favorites.some(fav => fav.id === photo.id);
    if (!exists){
      service.addToFavorites(photo);
      service.addToFavorites(photo);
      counter=counter+1
      favorites = service.getFavoritesSignal()();
    }
    expect(favorites.length).toBe(counter); // Should still be 1, no duplicates
  });

  it('should remove a photo from favorites', () => {
    const photo: Photo = { id: '1', url: 'https://picsum.photos/300/300', title: 'Photo 1' };

    service.addToFavorites(photo);
    service.removeFromFavorites(photo);
    const favorites = service.getFavoritesSignal()();
    expect(favorites).not.toContain(photo); // Check if photo was removed from favorites
  });

  it('should load favorites from local storage', () => {
    const favorites: Photo[] = [
      { id: '1', url: 'https://picsum.photos/300/300', title: 'Photo 1' },
      { id: '2', url: 'https://picsum.photos/300/301', title: 'Photo 2' }
    ];
    localStorage.setItem('favorites', JSON.stringify(favorites));

    service.loadFavoritesFromStorage();
    const loadedFavorites = service.getFavoritesSignal()();
    expect(loadedFavorites).toEqual(favorites); // Check if favorites loaded correctly
  });

  it('should update local storage when favorites change', () => {
    const photo: Photo = { id: '1', url: 'https://picsum.photos/300/300', title: 'Photo 1' };

    service.addToFavorites(photo); // This will trigger the updateLocalStorage method
    const storedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    expect(storedFavorites).toContain(photo); // Check if local storage updated correctly
  });
});
