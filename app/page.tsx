import Link from "next/link";
import { Header } from "@/components/Header";
import { CategoryShowcase } from "@/components/CategoryShowcase";
import { ClientReviewsGallery } from "@/components/ClientReviewsGallery";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div>
      {/* Header with hero section */}
      <Header />

      {/* Main content */}
      <main>
        {/* Category showcase */}
        <CategoryShowcase />

        {/* Featured section */}
        <section
          aria-labelledby="comfort-heading"
          className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8"
        >
          <div className="relative overflow-hidden rounded-lg">
            <div className="absolute inset-0">
              <img
                src="https://tailwindui.com/plus/img/ecommerce-images/home-page-01-feature-section-02.jpg"
                alt="Featured section background"
                className="h-full w-full object-cover object-center"
              />
            </div>
            <div className="relative bg-gray-900 bg-opacity-75 px-6 py-32 sm:px-12 sm:py-40 lg:px-16">
              <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
                <h2
                  id="comfort-heading"
                  className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
                >
                  Komfort i ciepło dla Twojego pupila
                </h2>
                <p className="mt-3 text-xl text-white">
                  Odkryj naszą kolekcję ciepłych ubrań dla psów. Wysokiej
                  jakości materiały, stylowe wzory i idealne dopasowanie. Twój
                  pies będzie gotowy na każdą pogodę z naszymi produktami.
                </p>
                <Link
                  href="/products"
                  className="mt-8 block w-full rounded-md border border-transparent bg-white px-8 py-3 text-base font-medium text-gray-900 hover:bg-gray-100 sm:w-auto"
                >
                  Przejdź do sklepu
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Client Reviews Gallery */}
      <ClientReviewsGallery />

      {/* Footer */}
      <Footer />
    </div>
  );
}
