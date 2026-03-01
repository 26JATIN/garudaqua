import Hero from './components/hero';
import CategoryShowcase from './components/CategoryShowcase';
import Footer from './components/Footer';
export default function Home() {
  return (
    <main className="min-h-screen relative overflow-x-hidden">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-linear-to-br from-white via-[#FEFEFE] to-[#F3F8FE] dark:from-black dark:via-[#050505] dark:to-[#0A0A0A] -z-10" />

      {/* Hero Section */}
      <Hero />
      {/*Category Showcase*/}
      <CategoryShowcase />
      {/*Footer*/}
      <Footer/>
    </main>
  );
}