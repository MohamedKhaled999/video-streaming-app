import { CommonModule } from '@angular/common';
import { Component, input, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { TabsRelatedComponent } from './tabs-related/tabs-related.component';
import { IMediaDetails } from '../../core/interfaces/IMediaDetails';
import { MovieService } from '../../core/services/movie/movie.service';
import { SeriesService } from '../../core/services/series/series.service';
import { language } from '../../core/utils/language.enum';
import { mediaType } from '../../core/utils/media-type.enum';
import { TabsEpisodesComponent } from './tabs-episodes/tabs-episodes.component';

@Component({
  selector: 'app-tabs',
  imports: [CommonModule, TabsRelatedComponent, TabsEpisodesComponent],
  templateUrl: './tabs.component.html',
})
export class TabsComponent implements OnInit, OnChanges {

  selectedIndex = 0;
  isSeries:boolean = true;

  mediadetails: IMediaDetails = {
    countSeasons: 0,
    countEpisodes: 0,
    categories: [],
    description: '',
    cast: []
  };


  mediaId = input.required<number>();
  mediaType = input.required<mediaType>();

  seriesName=''
  posterUrl:string="";

  constructor(private movieService:MovieService ,private seriesService:SeriesService ){}

  ngOnChanges(changes: SimpleChanges): void {
    this.isSeries = this.mediaType() === mediaType.series
    this.fetchMediaInfo(this.mediaId(), this.mediaType());
  }

  ngOnInit(): void {
    this.isSeries = this.mediaType() === mediaType.series
    this.fetchMediaInfo(this.mediaId(), this.mediaType());
  }



  allTabs = [
    { label: 'Episodes', content: 'This is the Episodes tab content.' },
    { label: 'Promos', content: 'This is the Promos tab content.' },
    { label: 'Related', content: 'This is the Related tab content.' },
    { label: 'More Info', content: 'This is the More Info tab content.' }

  ];

  fetchMediaInfo(id : number, tybe : mediaType){
    if(tybe === mediaType.series){
      this.seriesService.getSeriesDetails(id,language.english).subscribe({
        next: details=>{
          this.mediadetails.countSeasons=details.seasons.length;
          this.mediadetails.countEpisodes=details.number_of_episodes;
          this.mediadetails.description=details.overview;
          this.mediadetails.categories.push(...details.genres);

          this.seriesName=details.name;

        },
        error: err=>
        {
          console.log(`cannot get details for series with id ${id}`)
        }
      })
      this.seriesService.getSeriesCredits(id,language.english).subscribe({
        next: credits=>{
          this.mediadetails.cast.push(...credits.cast.map(c => c.name).slice(0,10))
        }
      })
      this.seriesService.getSeriesImages(id).subscribe({
        next:img=>{
          this.posterUrl=img.posters[1].file_path?
          `https://image.tmdb.org/t/p/original/${img.backdrops[1].file_path}`
          :img.posters[0].file_path? `https://image.tmdb.org/t/p/original/${img.backdrops[0].file_path}`
          :"images/wallpapers/blur.jpg"

        }
      })

    }
    else
    {
      this.movieService.getMovieDetails(id,language.english).subscribe({
        next: details=>{
          this.mediadetails.description=details.overview;
          this.mediadetails.categories.push(...details.genres);

        },
        error: err=>
        {
          console.log(`cannot get details for series with id ${id}`)
        }
      })
      this.movieService.getMovieCredits(id,language.english).subscribe({
        next: credits=>{
          this.mediadetails.cast.push(...credits.cast.map(c=>c.name).slice(0,10))
        }
      })
    }
  }

  onShare(event: Event): void {
    event.stopPropagation();
    // Implement share functionality
    console.log('Sharing episode:', this.mediaId);
  }

  get tabs(){
    if(this.isSeries)
      return this.allTabs;
    else
      return this.allTabs.filter(t=>t.label=="Related"||t.label=="More Info");
  }


  selectTab(index: number) {
    this.selectedIndex = index;
  }
}
