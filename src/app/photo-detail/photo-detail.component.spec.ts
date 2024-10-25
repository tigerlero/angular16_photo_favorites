import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PhotoDetailComponent } from './photo-detail.component';
import { ActivatedRoute, Router } from '@angular/router';
import { PhotoService } from '../photos.service';
import { of } from 'rxjs';
import { Photo } from '../models/photo.model';
import { MatSnackBar } from '@angular/material/snack-bar';

// Create a mock PhotoService
class MockPhotoService {
  getFavoritesSignal() {
    return () => [mockPhoto]; // Returning a mock favorite photo
  }

  removeFromFavorites(photo: Photo) {
    // Mock implementation
  }
}

const mockPhoto: Photo = {
  id: '123', // Mock ID
  url: 'https://picsum.photos/300/300', // Mock URL
  title: 'Mock Photo' // Mock Title
};

describe('PhotoDetailComponent', () => {
  let component: PhotoDetailComponent;
  let fixture: ComponentFixture<PhotoDetailComponent>;
  let snackBar: MatSnackBar;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PhotoDetailComponent],
      providers: [
        { provide: PhotoService, useClass: MockPhotoService },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '123' } } } },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
        { provide: MatSnackBar, useValue: { open: jasmine.createSpy('open') } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoDetailComponent);
    component = fixture.componentInstance;
    snackBar = TestBed.inject(MatSnackBar);
    router = TestBed.inject(Router);
    fixture.detectChanges(); // Run ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load photo from favorites on init', () => {
    expect(component.photo).toEqual(mockPhoto);
  });

  it('should remove photo from favorites and show snackbar', () => {
    component.removeFromFavorites();

    expect(snackBar.open).toHaveBeenCalledWith('Photo removed from favorites!', 'Close', { duration: 2000 });
    expect(router.navigate).toHaveBeenCalledWith(['/favorites']);
  });
});
