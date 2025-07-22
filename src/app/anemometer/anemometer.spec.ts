import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnemometerComponent } from './anemometer';

describe('Anemometer', () => {
  let component: AnemometerComponent;
  let fixture: ComponentFixture<AnemometerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnemometerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnemometerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
