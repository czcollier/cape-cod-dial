import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Anemometer } from './anemometer';

describe('Anemometer', () => {
  let component: Anemometer;
  let fixture: ComponentFixture<Anemometer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Anemometer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Anemometer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
