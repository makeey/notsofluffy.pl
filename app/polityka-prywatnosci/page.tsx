import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Polityka Prywatności | NotSoFluffy',
  description: 'Polityka prywatności sklepu NotSoFluffy. Dowiedz się jak chronimy Twoje dane osobowe i jakie są Twoje prawa.',
  keywords: ['polityka prywatności', 'ochrona danych', 'RODO', 'prywatność', 'NotSoFluffy'],
  openGraph: {
    title: 'Polityka Prywatności | NotSoFluffy',
    description: 'Polityka prywatności sklepu NotSoFluffy. Informacje o przetwarzaniu danych osobowych.',
    type: 'website',
    url: 'https://notsofluffy.pl/polityka-prywatnosci',
    siteName: 'NotSoFluffy',
  },
  twitter: {
    card: 'summary',
    title: 'Polityka Prywatności | NotSoFluffy',
    description: 'Polityka prywatności sklepu NotSoFluffy. Informacje o przetwarzaniu danych osobowych.',
  },
  robots: {
    index: false, // Don't index legal pages
    follow: true,
  },
  alternates: {
    canonical: 'https://notsofluffy.pl/polityka-prywatnosci',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Polityka Prywatności</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            Ostatnia aktualizacja: {new Date().toLocaleDateString('pl-PL')}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Informacje Ogólne</h2>
            <p className="text-gray-700 mb-4">
              Niniejsza Polityka Prywatności określa zasady przetwarzania i ochrony danych osobowych użytkowników serwisu NotSoFluffy.pl (dalej: "Serwis"), prowadzonego przez Twój Startup (dalej: "Administrator").
            </p>
            <p className="text-gray-700 mb-4">
              Administrator przykłada szczególną wagę do poszanowania prywatności użytkowników Serwisu.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Administrator Danych</h2>
            <p className="text-gray-700 mb-4">
              Administratorem danych osobowych jest Twój Startup z siedzibą w Polsce. W sprawach związanych z ochroną danych osobowych można skontaktować się z Administratorem poprzez formularz kontaktowy dostępny na stronie Serwisu lub pod adresem e-mail: notsofluffy.pl@gmail.com.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Rodzaje Zbieranych Danych</h2>
            <p className="text-gray-700 mb-4">W ramach korzystania z Serwisu zbieramy następujące kategorie danych:</p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
              <li>Dane identyfikacyjne: imię, nazwisko</li>
              <li>Dane kontaktowe: adres e-mail, numer telefonu</li>
              <li>Dane adresowe: adres dostawy, adres rozliczeniowy</li>
              <li>Dane transakcyjne: historia zamówień, wybrane produkty</li>
              <li>Dane techniczne: adres IP, typ przeglądarki, system operacyjny</li>
              <li>Dane firmowe (opcjonalnie): nazwa firmy, NIP</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Cele Przetwarzania Danych</h2>
            <p className="text-gray-700 mb-4">Przetwarzamy dane osobowe w następujących celach:</p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
              <li>Realizacja zamówień i świadczenie usług</li>
              <li>Obsługa konta użytkownika</li>
              <li>Komunikacja z klientami</li>
              <li>Wystawianie faktur i prowadzenie dokumentacji księgowej</li>
              <li>Marketing własnych produktów i usług (za zgodą)</li>
              <li>Analiza i ulepszanie funkcjonowania Serwisu</li>
              <li>Zapewnienie bezpieczeństwa i zapobieganie oszustwom</li>
              <li>Wypełnianie obowiązków prawnych</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Podstawy Prawne Przetwarzania</h2>
            <p className="text-gray-700 mb-4">Przetwarzamy dane osobowe na podstawie:</p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
              <li>Wykonania umowy - w celu realizacji zamówień (art. 6 ust. 1 lit. b RODO)</li>
              <li>Obowiązków prawnych - w celu wystawiania faktur (art. 6 ust. 1 lit. c RODO)</li>
              <li>Prawnie uzasadnionych interesów - w celu marketingu bezpośredniego (art. 6 ust. 1 lit. f RODO)</li>
              <li>Zgody - w przypadku zapisania się na newsletter (art. 6 ust. 1 lit. a RODO)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Okres Przechowywania Danych</h2>
            <p className="text-gray-700 mb-4">Dane osobowe przechowujemy przez okres:</p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
              <li>Dane konta użytkownika - do czasu usunięcia konta</li>
              <li>Dane zamówień - 5 lat od końca roku, w którym złożono zamówienie</li>
              <li>Dane faktur - 5 lat od końca roku podatkowego</li>
              <li>Dane marketingowe - do czasu wycofania zgody</li>
              <li>Dane techniczne - maksymalnie 2 lata</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Udostępnianie Danych</h2>
            <p className="text-gray-700 mb-4">Dane osobowe mogą być udostępniane:</p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
              <li>Firmom kurierskim - w celu dostawy zamówień</li>
              <li>Operatorom płatności - w celu obsługi transakcji</li>
              <li>Dostawcom usług IT - w celu utrzymania infrastruktury</li>
              <li>Księgowości - w celu prowadzenia dokumentacji</li>
              <li>Organom państwowym - gdy wymagają tego przepisy prawa</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Prawa Użytkowników</h2>
            <p className="text-gray-700 mb-4">Każdy użytkownik ma prawo do:</p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
              <li>Dostępu do swoich danych osobowych</li>
              <li>Sprostowania nieprawidłowych danych</li>
              <li>Usunięcia danych ("prawo do bycia zapomnianym")</li>
              <li>Ograniczenia przetwarzania danych</li>
              <li>Przenoszenia danych</li>
              <li>Sprzeciwu wobec przetwarzania</li>
              <li>Wycofania zgody w dowolnym momencie</li>
              <li>Wniesienia skargi do organu nadzorczego (PUODO)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Pliki Cookies</h2>
            <p className="text-gray-700 mb-4">
              Serwis wykorzystuje pliki cookies w celu:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
              <li>Utrzymania sesji użytkownika</li>
              <li>Zapamiętania preferencji</li>
              <li>Prowadzenia statystyk odwiedzin</li>
              <li>Dostosowania treści reklamowych</li>
            </ul>
            <p className="text-gray-700 mb-4">
              Użytkownik może w każdej chwili zmienić ustawienia dotyczące cookies w swojej przeglądarce internetowej.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Bezpieczeństwo Danych</h2>
            <p className="text-gray-700 mb-4">
              Administrator stosuje odpowiednie środki techniczne i organizacyjne zapewniające ochronę przetwarzanych danych osobowych, w szczególności:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
              <li>Szyfrowanie połączeń SSL/TLS</li>
              <li>Bezpieczne przechowywanie haseł</li>
              <li>Regularne kopie zapasowe</li>
              <li>Ograniczony dostęp do danych</li>
              <li>Monitoring systemów informatycznych</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Dane Dzieci</h2>
            <p className="text-gray-700 mb-4">
              Serwis nie jest przeznaczony dla osób poniżej 16 roku życia. Nie zbieramy świadomie danych osobowych od dzieci.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Zmiany Polityki Prywatności</h2>
            <p className="text-gray-700 mb-4">
              Administrator zastrzega sobie prawo do wprowadzania zmian w Polityce Prywatności. O wszelkich zmianach użytkownicy zostaną poinformowani poprzez umieszczenie informacji na stronie Serwisu.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Kontakt</h2>
            <p className="text-gray-700 mb-4">
              W sprawach związanych z ochroną danych osobowych prosimy o kontakt:
            </p>
            <ul className="list-none text-gray-700 mb-4 ml-4">
              <li>E-mail: notsofluffy.pl@gmail.com</li>
              <li>Formularz kontaktowy: <a href="/kontakt" className="text-indigo-600 hover:text-indigo-500">dostępny tutaj</a></li>
              <li>Adres: Twój Startup, Polska</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}