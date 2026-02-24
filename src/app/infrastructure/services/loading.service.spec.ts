import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ─── Initial State ──────────────────────────────────────────────────────────

  it('should not be loading initially', () => {
    expect(service.loading()).toBe(false);
  });

  // ─── start() / stop() ───────────────────────────────────────────────────────

  it('should be loading after start()', () => {
    service.start();
    expect(service.loading()).toBe(true);
  });

  it('should not be loading after start() then stop()', () => {
    service.start();
    service.stop();
    expect(service.loading()).toBe(false);
  });

  // ─── Concurrent Operations ──────────────────────────────────────────────────

  it('should remain loading when one of two operations completes', () => {
    service.start();
    service.start();
    service.stop();
    expect(service.loading()).toBe(true);
  });

  it('should stop loading when all concurrent operations complete', () => {
    service.start();
    service.start();
    service.start();
    service.stop();
    service.stop();
    service.stop();
    expect(service.loading()).toBe(false);
  });

  // ─── Safety: stop() below zero ─────────────────────────────────────────────

  it('should not go below zero when stop() is called without start()', () => {
    service.stop();
    service.stop();
    expect(service.loading()).toBe(false);
  });

  it('should work correctly after an underflow recovery', () => {
    service.stop(); // underflow attempt
    service.start();
    expect(service.loading()).toBe(true);
    service.stop();
    expect(service.loading()).toBe(false);
  });
});
