import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { loadingInterceptor } from './loading.interceptor';
import { LoadingService } from '../services/loading.service';

describe('loadingInterceptor', () => {
  let httpClient: HttpClient;
  let httpTesting: HttpTestingController;
  let loadingService: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([loadingInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    loadingService = TestBed.inject(LoadingService);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should set loading to true when a request starts', () => {
    httpClient.get('/api/heroes').subscribe();
    expect(loadingService.loading()).toBe(true);

    httpTesting.expectOne('/api/heroes').flush([]);
  });

  it('should set loading to false when a request completes', () => {
    httpClient.get('/api/heroes').subscribe();
    httpTesting.expectOne('/api/heroes').flush([]);

    expect(loadingService.loading()).toBe(false);
  });

  it('should set loading to false when a request errors', () => {
    httpClient.get('/api/heroes').subscribe({
      error: () => { /* expected error */ },
    });

    httpTesting.expectOne('/api/heroes').error(
      new ProgressEvent('error'),
      { status: 500, statusText: 'Internal Server Error' }
    );

    expect(loadingService.loading()).toBe(false);
  });

  it('should handle concurrent requests correctly', () => {
    httpClient.get('/api/heroes').subscribe();
    httpClient.get('/api/heroes/1').subscribe();

    expect(loadingService.loading()).toBe(true);

    httpTesting.expectOne('/api/heroes').flush([]);
    expect(loadingService.loading()).toBe(true);

    httpTesting.expectOne('/api/heroes/1').flush({});
    expect(loadingService.loading()).toBe(false);
  });
});
