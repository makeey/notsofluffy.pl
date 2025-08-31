'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export function Footer() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      // TODO: Implement newsletter subscription API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      setMessage('Dziękujemy za zapisanie się do newslettera!');
      setEmail('');
    } catch {
      setMessage('Wystąpił błąd. Spróbuj ponownie.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer aria-labelledby="footer-heading" className="bg-gray-900">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-20 xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="grid grid-cols-2 gap-8 xl:col-span-2">
            <div className="space-y-12 md:grid md:grid-cols-2 md:gap-8 md:space-y-0">
              <div>
                <h3 className="text-sm font-medium text-white">Sklep</h3>
                <ul role="list" className="mt-6 space-y-6">
                  <li className="text-sm">
                    <Link href="/products?category=charty" className="text-gray-300 hover:text-white">
                      Charty
                    </Link>
                  </li>
                  <li className="text-sm">
                    <Link href="/products?category=inne-rasy" className="text-gray-300 hover:text-white">
                      Inne rasy
                    </Link>
                  </li>
                  <li className="text-sm">
                    <Link href="/products" className="text-gray-300 hover:text-white">
                      Wszystkie produkty
                    </Link>
                  </li>
                  <li className="text-sm">
                    <Link href="/products?category=akcesoria" className="text-gray-300 hover:text-white">
                      Akcesoria
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-medium text-white">Firma</h3>
                <ul role="list" className="mt-6 space-y-6">
                  <li className="text-sm">
                    <Link href="/regulamin" className="text-gray-300 hover:text-white">
                      Regulamin
                    </Link>
                  </li>
                  <li className="text-sm">
                    <Link href="/polityka-prywatnosci" className="text-gray-300 hover:text-white">
                      Polityka prywatności
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="space-y-12 md:grid md:grid-cols-2 md:gap-8 md:space-y-0">
              <div>
                <h3 className="text-sm font-medium text-white">Kontakt</h3>
                <ul role="list" className="mt-6 space-y-6">
                  <li className="text-sm">
                    <a href="https://www.facebook.com/profile.php?id=100089252553530" className="text-gray-300 hover:text-white">
                      Facebook
                    </a>
                  </li>
                  <li className="text-sm">
                    <a href="https://www.instagram.com/notsofluffy_pl/" className="text-gray-300 hover:text-white">
                      Instagram
                    </a>
                  </li>
                  <li className="text-sm">
                    <a href="mailto:notsofluffy.pl@gmail.com" className="text-gray-300 hover:text-white">
                      E-mail
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Newsletter signup */}
          <div className="mt-12 md:mt-16 xl:mt-0">
            <h3 className="text-sm font-medium text-white">Zapisz się do newslettera</h3>
            <p className="mt-6 text-sm text-gray-300">
              Najnowsze oferty i promocje, wysyłane na Twój e-mail co tydzień.
            </p>
            <form className="mt-2 flex sm:max-w-md" onSubmit={handleNewsletterSubmit}>
              <label htmlFor="email-address" className="sr-only">Adres e-mail</label>
              <input
                id="email-address"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Wprowadź swój e-mail"
                className="w-full min-w-0 appearance-none rounded-md border border-white bg-white px-4 py-2 text-base text-gray-900 placeholder-gray-500 shadow-sm focus:border-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
              />
              <div className="ml-4 flex-shrink-0">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50"
                >
                  {isSubmitting ? 'Zapisywanie...' : 'Zapisz się'}
                </button>
              </div>
            </form>
            {message && (
              <p className={`mt-2 text-sm ${message.includes('błąd') ? 'text-red-400' : 'text-green-400'}`}>
                {message}
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-gray-800 py-10">
          <p className="text-sm text-gray-400">
            Copyright © 2025 notsofluffy.pl - Wszystkie prawa zastrzeżone
          </p>
        </div>
      </div>
    </footer>
  );
}