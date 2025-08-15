"use client";

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="/images/bg.jpg"
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gray-900 opacity-60" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Logo */}
        <div className="mb-8">
          <img
            src="/images/logo2.svg"
            alt="Not so fluffy"
            className="h-16 w-auto mx-auto mb-4"
          />
        </div>

        {/* Main Message */}
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Już wkrótce
        </h1>

        <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto">
          Pracujemy nad czymś wyjątkowym dla Ciebie i Twojego psa. Wkrótce
          będziemy z powrotem z nowymi produktami i funkcjami.
        </p>

        {/* Additional Info */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-lg font-semibold text-white mb-3">
            Co nas czeka?
          </h2>
          <ul className="text-gray-200 space-y-2 text-sm">
            <li>• Nowe kolekcje ubranek dla psów</li>
            <li>• Ulepszona strona internetowa</li>
            <li>• Szybsze i łatwiejsze zakupy</li>
            <li>• Więcej opcji dostosowywania</li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="mt-8 text-gray-300">
          <p className="text-sm">Masz pytania? Skontaktuj się z nami:</p>
          <a
            href="mailto:notsofluffy.pl@gmail.com"
            className="text-white hover:text-gray-200 transition-colors underline"
          >
            notsofluffy.pl@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
