import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Home3DComponent } from './home3-d.component';

describe('Home3DComponent', () => {
  let component: Home3DComponent;
  let fixture: ComponentFixture<Home3DComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home3DComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Home3DComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
