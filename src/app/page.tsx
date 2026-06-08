'use client';

import { Navigation } from '@/components/navigation/Navigation';
import { Hero } from '@/components/hero/Hero';
import { About } from '@/components/about/About';
import { Gallery } from '@/components/gallery/Gallery';
import { Team } from '@/components/team/Team';
import { Testimonials } from '@/components/testimonials/Testimonials';
import { BookingCTA } from '@/components/booking/BookingCTA';
import { Footer } from '@/components/footer/Footer';
import { Preloader } from '@/components/ui/Preloader';
import { MagneticCursor } from '@/components/ui/MagneticCursor';

export default function Home() {
  return (
    <>
      <Preloader />
      <MagneticCursor />
      <Navigation />
      <main>
        <Hero />
        <About />
        <Gallery />
        <Team />
        <Testimonials />
        <BookingCTA />
      </main>
      <Footer />
    </>
  );
}
