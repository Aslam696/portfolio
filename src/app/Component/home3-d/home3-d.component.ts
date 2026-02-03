import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { ThreeService } from '../../Services/three.service';

type Project = {
  id: string;
  title: string;
  duration?: string;
  summary: string;
  points: string[];
  tech: string[];
  images?: string[];
};
@Component({
  selector: 'app-home3-d',
  imports: [CommonModule],
  templateUrl: './home3-d.component.html',
  styleUrl: './home3-d.component.css'
})
export class Home3DComponent {
  @ViewChild('canvas', { static: true })
  canvas!: ElementRef<HTMLDivElement>;

  @ViewChild('profileBtn')
  profileBtn?: ElementRef<HTMLButtonElement>;

  private stars?: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>;
  private starsPositions?: Float32Array;
  private readonly starsCount = 1400;
  private readonly starsDepth = 120;
  private readonly starsSpread = 90;
  private readonly starSpeed = 0.32;

  constructor(private three: ThreeService) { }

  projects: Project[] = [
    {
      id: 'erp',
      title: 'ERP System',
      duration: 'Present',
      summary: 'Enterprise Resource Planning (ERP) system built as a structured, end-to-end web application.',
      points: [
        'Building a fully structured ERP project end-to-end (frontend, backend, and database).',
        'Developing the UI using Angular 19 with scalable architecture and reusable components.',
        'Integrating .NET Core Web APIs with SQL Server for secure and efficient data operations.'
      ],
      tech: ['Angular 19', 'ASP.NET Core', 'SQL Server']
    },
    {
      id: 'aiasl-revenue',
      title: ' Revenue Management System',
      summary: 'Service platform to manage airport-based revenue operations.',
      points: [
        'A service platform designed to manage airport-based revenue operations for each flight, based on customer contracts at every station.',
        'Automates invoice generation for the finance team according to the specific rules and terms defined in the contracts.',
        'Developed using .NET Core, Angular 17, and SQL Server to ensure secure, efficient, and scalable performance.'
      ],
      tech: ['Angular 17', '.NET Core', 'SQL Server']
    },
    {
      id: 'aiasl-asset',
      title: ' Asset Maintenance',
      summary: 'Asset tracking and maintenance management system for airport service equipment.',
      points: [
        'A system designed to manage and track airport service equipment used for various operational and maintenance activities.',
        'Handles asset maintenance based on category and asset list integrated from the ERP system, ensuring accurate and organized asset management.',
        'Allows users to raise service/complaint tickets for faulty equipment and automatically assigns operators or technicians for resolution.',
        'Developed using .NET Core, Angular 17, and SQL Server for efficient monitoring and streamlined maintenance workflows.'
      ],
      tech: ['Angular 17', '.NET Core', 'SQL Server']
    }
  ];

  activeProject: Project | null = null;
  isProfileOpen = false;
  profilePopoverStyle: { [k: string]: string } = {};
  lightboxImage: string | null = null;

  openProject(project: Project): void {
    this.activeProject = project;
    document.body.style.overflow = 'hidden';
  }

  closeProject(): void {
    this.activeProject = null;
    if (!this.isProfileOpen) document.body.style.overflow = '';
  }

  openProfile(): void {
    this.isProfileOpen = true;
    document.body.style.overflow = 'hidden';
    this.updateProfilePopoverPosition();
  }

  closeProfile(): void {
    this.isProfileOpen = false;
    if (!this.activeProject) document.body.style.overflow = '';
  }

  private updateProfilePopoverPosition(): void {
    const btn = this.profileBtn?.nativeElement;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const margin = 10;

    // Prefer opening below the avatar; if near bottom, open above.
    const desiredWidth = 360;
    const desiredHeight = 280;

    let top = rect.bottom + margin;
    let left = rect.right - desiredWidth;

    // Clamp to viewport.
    const maxLeft = window.innerWidth - desiredWidth - margin;
    const maxTop = window.innerHeight - desiredHeight - margin;
    left = Math.max(margin, Math.min(left, maxLeft));

    // If it would overflow bottom, open above.
    if (top > maxTop) {
      top = rect.top - desiredHeight - margin;
    }
    top = Math.max(margin, Math.min(top, maxTop));

    this.profilePopoverStyle = {
      top: `${Math.round(top)}px`,
      left: `${Math.round(left)}px`,
      width: `${desiredWidth}px`,
    };
  }

  scrollToSection(id: string): void {
    const el = document.getElementById(id);
    if (!el) return;

    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  openImageLightbox(image: string): void {
    this.lightboxImage = image;
    document.body.style.overflow = 'hidden';
  }

  closeImageLightbox(): void {
    this.lightboxImage = null;
    if (!this.activeProject && !this.isProfileOpen) {
      document.body.style.overflow = '';
    }
  }

  getProjectGradient(index: number): string {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    ];
    return gradients[index % gradients.length];
  }

  getTechIcon(tech: string): string {
    const icons: { [key: string]: string } = {
      'Angular': '🅰️',
      'Angular 17': '🅰️',
      'Angular 19': '🅰️',
      '.NET Core': '⚡',
      'ASP.NET Core': '⚡',
      'SQL Server': '🗄️',
      'TypeScript': '📘',
      'C#': '🔷'
    };
    return icons[tech] || '💻';
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.isProfileOpen) this.updateProfilePopoverPosition();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (this.isProfileOpen) this.updateProfilePopoverPosition();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.lightboxImage) {
      this.closeImageLightbox();
    } else if (this.activeProject) {
      this.closeProject();
    } else if (this.isProfileOpen) {
      this.closeProfile();
    }
  }

  ngAfterViewInit(): void {
    this.three.init(this.canvas.nativeElement);

    // Black background and subtle moving stars
    this.three.scene.background = new THREE.Color('#000000');
    this.three.renderer.setClearColor(0x000000, 1);

    this.createStars();
    this.three.setFrameCallback(() => this.animateStars());
  }

  ngOnDestroy(): void {
    this.three.setFrameCallback(null);
    this.three.destroy();
  }

  private createStars(): void {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.starsCount * 3);

    for (let i = 0; i < this.starsCount; i++) {
      const idx = i * 3;
      positions[idx] = (Math.random() - 0.5) * this.starsSpread; // x
      positions[idx + 1] = (Math.random() - 0.5) * this.starsSpread; // y
      positions[idx + 2] = (Math.random() - 0.5) * this.starsDepth; // z
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.055,
      transparent: true,
      opacity: 0.9,
      depthWrite: false
    });

    const points = new THREE.Points(geometry, material);
    this.three.scene.add(points);

    this.stars = points;
    this.starsPositions = positions;

    // Ensure the camera sees the star field
    this.three.camera.position.z = 6;
  }

  private animateStars(): void {
    if (!this.stars || !this.starsPositions) return;

    for (let i = 0; i < this.starsCount; i++) {
      const zIdx = i * 3 + 2;
      this.starsPositions[zIdx] -= this.starSpeed;
      if (this.starsPositions[zIdx] < -this.starsDepth / 2) {
        this.starsPositions[zIdx] = this.starsDepth / 2;
      }
    }

    const posAttr = this.stars.geometry.getAttribute('position') as THREE.BufferAttribute;
    posAttr.needsUpdate = true;
  }
}
