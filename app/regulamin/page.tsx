export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Regulamin</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            Ostatnia aktualizacja: {new Date().toLocaleDateString('pl-PL')}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">§1. Postanowienia Ogólne</h2>
            <p className="text-gray-700 mb-4">
              1. Niniejszy Regulamin określa zasady korzystania ze sklepu internetowego NotSoFluffy.pl, zwanego dalej "Sklepem".
            </p>
            <p className="text-gray-700 mb-4">
              2. Właścicielem Sklepu jest Twój Startup z siedzibą w Polsce, zwany dalej "Sprzedawcą".
            </p>
            <p className="text-gray-700 mb-4">
              3. Korzystanie ze Sklepu oznacza akceptację niniejszego Regulaminu.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">§2. Definicje</h2>
            <p className="text-gray-700 mb-4">Użyte w Regulaminie pojęcia oznaczają:</p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
              <li><strong>Klient</strong> - osoba fizyczna, osoba prawna lub jednostka organizacyjna dokonująca zakupów w Sklepie</li>
              <li><strong>Konsument</strong> - osoba fizyczna dokonująca zakupów niezwiązanych z działalnością gospodarczą</li>
              <li><strong>Konto</strong> - indywidualne konto Klienta w Sklepie</li>
              <li><strong>Koszyk</strong> - lista produktów wybranych przez Klienta do zakupu</li>
              <li><strong>Zamówienie</strong> - oświadczenie woli Klienta zmierzające do zawarcia umowy sprzedaży</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">§3. Rejestracja i Konto Klienta</h2>
            <p className="text-gray-700 mb-4">
              1. Rejestracja w Sklepie jest dobrowolna i bezpłatna.
            </p>
            <p className="text-gray-700 mb-4">
              2. Zamówienia można składać również bez rejestracji.
            </p>
            <p className="text-gray-700 mb-4">
              3. Klient zobowiązany jest do podania prawdziwych danych podczas rejestracji.
            </p>
            <p className="text-gray-700 mb-4">
              4. Klient odpowiada za zachowanie poufności hasła do swojego Konta.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">§4. Składanie Zamówień</h2>
            <p className="text-gray-700 mb-4">
              1. Zamówienia można składać 24 godziny na dobę przez cały rok.
            </p>
            <p className="text-gray-700 mb-4">
              2. Proces składania zamówienia obejmuje:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
              <li>Wybór produktów i dodanie ich do Koszyka</li>
              <li>Wybór opcji personalizacji (rozmiar, kolor, dodatkowe usługi)</li>
              <li>Podanie danych do wysyłki i faktury</li>
              <li>Wybór metody płatności i dostawy</li>
              <li>Potwierdzenie zamówienia</li>
            </ul>
            <p className="text-gray-700 mb-4">
              3. Po złożeniu zamówienia Klient otrzymuje potwierdzenie na podany adres e-mail.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">§5. Ceny i Płatności</h2>
            <p className="text-gray-700 mb-4">
              1. Ceny produktów podane są w złotych polskich i zawierają podatek VAT.
            </p>
            <p className="text-gray-700 mb-4">
              2. Cena podana przy produkcie jest wiążąca w momencie złożenia zamówienia.
            </p>
            <p className="text-gray-700 mb-4">
              3. Dostępne formy płatności:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
              <li>Przelew bankowy</li>
              <li>Płatność online (karta, BLIK, przelewy)</li>
              <li>Płatność przy odbiorze (za pobraniem)</li>
            </ul>
            <p className="text-gray-700 mb-4">
              4. Faktury VAT wystawiane są na życzenie Klienta.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">§6. Dostawa</h2>
            <p className="text-gray-700 mb-4">
              1. Produkty dostarczane są na adres wskazany przez Klienta.
            </p>
            <p className="text-gray-700 mb-4">
              2. Koszt dostawy ponosi Klient, chyba że Sprzedawca postanowi inaczej.
            </p>
            <p className="text-gray-700 mb-4">
              3. Czas realizacji zamówienia wynosi od 7 do 21 dni roboczych.
            </p>
            <p className="text-gray-700 mb-4">
              4. Dostępne metody dostawy:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
              <li>Kurier DPD</li>
              <li>Kurier InPost</li>
              <li>Paczkomaty InPost</li>
              <li>Odbiór osobisty</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">§7. Prawo Odstąpienia od Umowy</h2>
            <p className="text-gray-700 mb-4">
              1. Konsument ma prawo odstąpić od umowy w terminie 14 dni bez podania przyczyny.
            </p>
            <p className="text-gray-700 mb-4">
              2. Termin biegnie od dnia otrzymania produktu.
            </p>
            <p className="text-gray-700 mb-4">
              3. Prawo odstąpienia nie przysługuje w przypadku:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
              <li>Produktów personalizowanych wykonanych na zamówienie</li>
              <li>Produktów ulegających szybkiemu zepsuciu</li>
              <li>Produktów zwróconych w stanie wskazującym na ich użycie</li>
            </ul>
            <p className="text-gray-700 mb-4">
              4. Aby odstąpić od umowy, należy przesłać oświadczenie na adres e-mail: notsofluffy.pl@gmail.com
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">§8. Reklamacje</h2>
            <p className="text-gray-700 mb-4">
              1. Sprzedawca odpowiada za wady produktu na podstawie przepisów o rękojmi.
            </p>
            <p className="text-gray-700 mb-4">
              2. Reklamację można złożyć:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
              <li>E-mailem na adres: notsofluffy.pl@gmail.com</li>
              <li>Pisemnie na adres siedziby Sprzedawcy</li>
            </ul>
            <p className="text-gray-700 mb-4">
              3. Reklamacja powinna zawierać:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
              <li>Dane Klienta</li>
              <li>Numer zamówienia</li>
              <li>Opis wady</li>
              <li>Żądanie Klienta</li>
              <li>Dokumentację fotograficzną (jeśli dotyczy)</li>
            </ul>
            <p className="text-gray-700 mb-4">
              4. Sprzedawca rozpatruje reklamację w terminie 14 dni.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">§9. Dane Osobowe</h2>
            <p className="text-gray-700 mb-4">
              1. Administratorem danych osobowych jest Twój Startup.
            </p>
            <p className="text-gray-700 mb-4">
              2. Dane osobowe przetwarzane są zgodnie z RODO.
            </p>
            <p className="text-gray-700 mb-4">
              3. Szczegółowe informacje znajdują się w <a href="/polityka-prywatnosci" className="text-indigo-600 hover:text-indigo-500">Polityce Prywatności</a>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">§10. Postanowienia Końcowe</h2>
            <p className="text-gray-700 mb-4">
              1. W sprawach nieuregulowanych stosuje się przepisy prawa polskiego.
            </p>
            <p className="text-gray-700 mb-4">
              2. Sprzedawca zastrzega sobie prawo do zmiany Regulaminu.
            </p>
            <p className="text-gray-700 mb-4">
              3. Zmiany wchodzą w życie po 14 dniach od opublikowania.
            </p>
            <p className="text-gray-700 mb-4">
              4. Spory rozstrzygane są polubownie lub przez właściwy sąd.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">§11. Kontakt</h2>
            <p className="text-gray-700 mb-4">
              Twój Startup<br />
              Polska<br />
              E-mail: notsofluffy.pl@gmail.com<br />
              Telefon: +48 XXX XXX XXX
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}