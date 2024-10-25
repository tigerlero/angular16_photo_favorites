import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PhotoService } from '../photos.service';
import { Photo } from '../models/photo.model';
import { MatSnackBar } from '@angular/material/snack-bar'; // Import MatSnackBar


@Component({
  selector: 'app-photo-detail',
  templateUrl: './photo-detail.component.html',
  styleUrls: ['./photo-detail.component.scss']
})
export class PhotoDetailComponent implements OnInit {
  photo: Photo | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private photoService: PhotoService,
    private snackBar: MatSnackBar
  ) { }
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const favorites: Photo[] = this.photoService.getFavoritesSignal()();

    this.photo = favorites.find(f => f.id === id) || null;
  }

  removeFromFavorites(): void {
    if (this.photo) {
      this.photoService.removeFromFavorites(this.photo);
      this.snackBar.open('Photo removed from favorites!', 'Close', {
        duration: 2000,
      });
      this.router.navigate(['/favorites']);
    }
  }
}
