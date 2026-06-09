'use client';

import { Navigation } from '@/components/navigation/Navigation';
import { Hero } from '@/components/hero/Hero';
import { About } from '@/components/about/About';
import { Services } from '@/components/services/Services';
import { Team } from '@/components/team/Team';
import { Gallery } from '@/components/gallery/Gallery';
import { Contact } from '@/components/contact/Contact';
import { BookingCTA } from '@/components/booking/BookingCTA';
import { Footer } from '@/components/footer/Footer';
import { Preloader } from '@/components/ui/Preloader';

export default function Home() {
  return (
    <>
      <Preloader />
      <Navigation />
      <main>
        <Hero />
        <About />
        <Services />
        <Team />
        <Gallery />
        <Contact />
        <BookingCTA />
      </main>
      <Footer />
    </>
  );
}
