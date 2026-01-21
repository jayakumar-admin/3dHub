
import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../data.service';
import { NotificationService } from '../../../notification.service';
import { Feature, Settings, SocialMediaLink, Testimonial, QuickLink, HeroSlide, TeamMember } from '../../../models';

type SettingsTab = 'general' | 'home' | 'about' | 'shipping' | 'returns' | 'payment' | 'footer' | 'seo';

@Component({
  selector: 'app-admin-settings',
  templateUrl: './settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
})
export class AdminSettingsComponent {
  dataService = inject(DataService);
  fb: FormBuilder = inject(FormBuilder);
  notificationService = inject(NotificationService);

  activeTab = signal<SettingsTab>('general');
  loadingImages = signal<Record<string, boolean>>({});
  settingsForm: FormGroup;

  constructor() {
    this.settingsForm = this.fb.group({
      general: this.fb.group({
        websiteName: ['', Validators.required],
        logoUrlLight: [''],
        logoUrlDark: [''],
        faviconUrl: [''],
      }),
      contact: this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        phone: ['', Validators.required],
        whatsappNumber: ['', Validators.required],
        address: ['', Validators.required],
        whatsappEnabled: [true],
        whatsappDefaultMessage: [''],
      }),
      footer: this.fb.group({
        description: [''],
        copyrightText: [''],
        socialMediaLinks: this.fb.array([]),
        quickLinks: this.fb.array([]),
      }),
      homePage: this.fb.group({
        heroSection: this.fb.group({
          enabled: [true],
          slides: this.fb.array([]),
        }),
        featuresSection: this.fb.group({
          enabled: [true],
          title: [''],
          features: this.fb.array([]),
        }),
        testimonialsSection: this.fb.group({
          enabled: [true],
          title: [''],
          testimonials: this.fb.array([]),
        }),
      }),
      seo: this.fb.group({
        metaTitle: ['', Validators.required],
        metaDescription: ['', Validators.required],
      }),
      aboutPage: this.fb.group({
        heroTitle: ['', Validators.required],
        heroSubtitle: [''],
        heroImageUrl: [''],
        storyTitle: ['', Validators.required],
        storyContent: ['', Validators.required],
        storyImageUrl: [''],
        missionVisionSection: this.fb.group({
          enabled: [true],
          title: [''],
          missionTitle: [''],
          missionContent: [''],
          visionTitle: [''],
          visionContent: [''],
        }),
        teamSection: this.fb.group({
          enabled: [true],
          title: [''],
          members: this.fb.array([]),
        }),
      }),
      payment: this.fb.group({
        razorpayEnabled: [true],
        razorpayKeyId: ['', Validators.required],
        companyNameForPayment: [''],
        companyLogoForPayment: [''],
      }),
      shipping: this.fb.group({
        flatRateEnabled: [true],
        flatRateCost: [0, [Validators.required, Validators.min(0)]],
        freeShippingEnabled: [true],
        freeShippingThreshold: [0, [Validators.required, Validators.min(0)]],
      }),
      returns: this.fb.group({
        returnsEnabled: [true],
        returnWindowDays: [15, [Validators.required, Validators.min(0)]],
        returnPolicy: [''],
      })
    });

    // Load initial data
    this.loadSettings();
  }
  
  loadSettings() {
    const currentSettings = this.dataService.getSettings()();
    this.settingsForm.patchValue(currentSettings);
    
    // Populate FormArrays
    this.slides.clear();
    currentSettings.homePage.heroSection.slides.forEach(slide => this.addSlide(slide));

    this.socialMediaLinks.clear();
    currentSettings.footer.socialMediaLinks.forEach(link => this.addSocialMediaLink(link));
    
    this.quickLinks.clear();
    currentSettings.footer.quickLinks.forEach(link => this.addQuickLink(link));
    
    this.features.clear();
    currentSettings.homePage.featuresSection.features.forEach(feature => this.addFeature(feature));

    this.testimonials.clear();
    currentSettings.homePage.testimonialsSection.testimonials.forEach(t => this.addTestimonial(t));

    this.teamMembers.clear();
    currentSettings.aboutPage.teamSection.members.forEach(member => this.addTeamMember(member));
  }

  // Getters for FormArrays
  get slides() { return this.settingsForm.get('homePage.heroSection.slides') as FormArray; }
  get socialMediaLinks() { return this.settingsForm.get('footer.socialMediaLinks') as FormArray; }
  get quickLinks() { return this.settingsForm.get('footer.quickLinks') as FormArray; }
  get features() { return this.settingsForm.get('homePage.featuresSection.features') as FormArray; }
  get testimonials() { return this.settingsForm.get('homePage.testimonialsSection.testimonials') as FormArray; }
  get teamMembers() { return this.settingsForm.get('aboutPage.teamSection.members') as FormArray; }

  // Hero Slides
  addSlide(slide?: HeroSlide) {
    this.slides.push(this.fb.group({
      title: [slide?.title || '', Validators.required],
      subtitle: [slide?.subtitle || ''],
      ctaText: [slide?.ctaText || '', Validators.required],
      ctaLink: [slide?.ctaLink || '', Validators.required],
      imageUrl: [slide?.imageUrl || '', Validators.required],
    }));
  }
  removeSlide(index: number) { this.slides.removeAt(index); }


  // Social Media Links
  addSocialMediaLink(link?: SocialMediaLink) {
    this.socialMediaLinks.push(this.fb.group({
      platform: [link?.platform || 'facebook', Validators.required],
      url: [link?.url || '', Validators.required],
    }));
  }
  removeSocialMediaLink(index: number) { this.socialMediaLinks.removeAt(index); }

  // Quick Links
  addQuickLink(link?: QuickLink) {
    this.quickLinks.push(this.fb.group({
      title: [link?.title || '', Validators.required],
      url: [link?.url || '', Validators.required],
    }));
  }
  removeQuickLink(index: number) { this.quickLinks.removeAt(index); }

  // Features
  addFeature(feature?: Feature) {
    this.features.push(this.fb.group({
      icon: [feature?.icon || 'sparkles', Validators.required],
      title: [feature?.title || '', Validators.required],
      description: [feature?.description || '', Validators.required],
    }));
  }
  removeFeature(index: number) { this.features.removeAt(index); }

  // Testimonials
  addTestimonial(testimonial?: Testimonial) {
    this.testimonials.push(this.fb.group({
      author: [testimonial?.author || '', Validators.required],
      role: [testimonial?.role || '', Validators.required],
      quote: [testimonial?.quote || '', Validators.required],
      avatarUrl: [testimonial?.avatarUrl || ''],
    }));
  }
  removeTestimonial(index: number) { this.testimonials.removeAt(index); }
  
  // Team Members
  addTeamMember(member?: TeamMember) {
    this.teamMembers.push(this.fb.group({
      name: [member?.name || '', Validators.required],
      role: [member?.role || '', Validators.required],
      bio: [member?.bio || ''],
      imageUrl: [member?.imageUrl || ''],
    }));
  }
  removeTeamMember(index: number) { this.teamMembers.removeAt(index); }
  
  onFileChange(event: Event, formControlPath: string, folder: string) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.loadingImages.update(l => ({ ...l, [formControlPath]: true }));
      this.dataService.uploadImage(file, folder).subscribe({
        next: (res) => {
          this.settingsForm.get(formControlPath)?.setValue(res.imageUrl);
          this.notificationService.show('Image uploaded!', 'success');
        },
        error: (err) => {
          const message = err?.error?.message || 'Please try again.';
          this.notificationService.show(`Upload failed: ${message}`, 'error');
           this.loadingImages.update(l => ({ ...l, [formControlPath]: false }));
        },
        complete: () => {
          this.loadingImages.update(l => ({ ...l, [formControlPath]: false }));
        }
      });
    }
  }

  onArrayFileChange(event: Event, formArrayPath: string, index: number, controlName: string, folder: string) {
    const file = (event.target as HTMLInputElement).files?.[0];
    const loadingKey = `${formArrayPath}.${index}.${controlName}`;
    if (file) {
      this.loadingImages.update(l => ({ ...l, [loadingKey]: true }));
      this.dataService.uploadImage(file, folder).subscribe({
        next: (res) => {
          const formArray = this.settingsForm.get(formArrayPath) as FormArray;
          formArray.at(index).get(controlName)?.setValue(res.imageUrl);
          this.notificationService.show('Image uploaded!', 'success');
        },
        error: (err) => {
          const message = err?.error?.message || 'Please try again.';
          this.notificationService.show(`Upload failed: ${message}`, 'error');
           this.loadingImages.update(l => ({ ...l, [loadingKey]: false }));
        },
        complete: () => {
          this.loadingImages.update(l => ({ ...l, [loadingKey]: false }));
        }
      });
    }
  }
  
  removeImage(formControlPath: string) {
    this.settingsForm.get(formControlPath)?.setValue('');
    this.notificationService.show('Image removed.');
  }

  removeArrayImage(formArrayPath: string, index: number, controlName: string) {
    const formArray = this.settingsForm.get(formArrayPath) as FormArray;
    formArray.at(index).get(controlName)?.setValue('');
    this.notificationService.show('Image removed.');
  }

  saveSettings() {
    if (this.settingsForm.valid) {
      this.dataService.saveSettings(this.settingsForm.getRawValue() as Settings);
      this.notificationService.show('Settings saved successfully!', 'success');
    } else {
      this.notificationService.show('Please fill all required fields correctly.', 'error');
      this.settingsForm.markAllAsTouched();
    }
  }

  setTab(tab: SettingsTab) {
    this.activeTab.set(tab);
  }
}
