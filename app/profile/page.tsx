'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { apiClient, UserProfileResponse, UserAddressResponse, UserProfileRequest, UserAddressRequest } from '@/lib/api';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState<UserProfileRequest>({
    first_name: '',
    last_name: '',
    phone: '',
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Address form state
  const [addressForm, setAddressForm] = useState<UserAddressRequest>({
    label: '',
    first_name: '',
    last_name: '',
    company: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state_province: '',
    postal_code: '',
    country: 'Poland',
    phone: '',
    is_default: false,
  });
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/login';
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, authLoading]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const profileData = await apiClient.getUserProfile();
      setProfile(profileData);
      
      // Populate profile form
      setProfileForm({
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        phone: profileData.phone || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedProfile = await apiClient.updateUserProfile(profileForm);
      setProfile(updatedProfile);
      setIsEditingProfile(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAddressId) {
        await apiClient.updateUserAddress(editingAddressId, addressForm);
      } else {
        await apiClient.createUserAddress(addressForm);
      }
      
      // Refresh profile to get updated addresses
      await fetchProfile();
      
      // Reset form
      setAddressForm({
        label: '',
        first_name: '',
        last_name: '',
        company: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state_province: '',
        postal_code: '',
        country: 'Poland',
        phone: '',
        is_default: false,
      });
      setIsAddingAddress(false);
      setEditingAddressId(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save address');
    }
  };

  const handleEditAddress = (address: UserAddressResponse) => {
    setAddressForm({
      label: address.label,
      first_name: address.first_name,
      last_name: address.last_name,
      company: address.company || '',
      address_line1: address.address_line1,
      address_line2: address.address_line2 || '',
      city: address.city,
      state_province: address.state_province,
      postal_code: address.postal_code,
      country: address.country,
      phone: address.phone || '',
      is_default: address.is_default,
    });
    setEditingAddressId(address.id);
    setIsAddingAddress(true);
  };

  const handleDeleteAddress = async (id: number) => {
    if (!confirm('Czy na pewno chcesz usunąć ten adres?')) {
      return;
    }
    
    try {
      await apiClient.deleteUserAddress(id);
      await fetchProfile();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete address');
    }
  };

  const handleSetDefaultAddress = async (id: number) => {
    try {
      await apiClient.setDefaultAddress(id);
      await fetchProfile();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set default address');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="bg-white">
        <Header />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center">Ładowanie...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="bg-white">
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mój Profil</h1>
              <p className="text-gray-600 mt-2">Zarządzaj swoimi danymi i adresami</p>
            </div>
            <Link
              href="/orders"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Moje Zamówienia
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Profile Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Dane osobowe</h2>
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {isEditingProfile ? 'Anuluj' : 'Edytuj'}
              </button>
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Imię
                    </label>
                    <input
                      type="text"
                      value={profileForm.first_name}
                      onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nazwisko
                    </label>
                    <input
                      type="text"
                      value={profileForm.last_name}
                      onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Zapisz
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Anuluj
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="block text-sm font-medium text-gray-700">Email</span>
                    <span className="text-gray-900">{user.email}</span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">Imię</span>
                    <span className="text-gray-900">{profile?.first_name || 'Nie podano'}</span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">Nazwisko</span>
                    <span className="text-gray-900">{profile?.last_name || 'Nie podano'}</span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">Telefon</span>
                    <span className="text-gray-900">{profile?.phone || 'Nie podano'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Saved Addresses */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Zapisane adresy</h2>
              <button
                onClick={() => {
                  setIsAddingAddress(true);
                  setEditingAddressId(null);
                  setAddressForm({
                    label: '',
                    first_name: profile?.first_name || '',
                    last_name: profile?.last_name || '',
                    company: '',
                    address_line1: '',
                    address_line2: '',
                    city: '',
                    state_province: '',
                    postal_code: '',
                    country: 'Poland',
                    phone: profile?.phone || '',
                    is_default: false,
                  });
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Dodaj adres
              </button>
            </div>

            {/* Address Form */}
            {isAddingAddress && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingAddressId ? 'Edytuj adres' : 'Dodaj nowy adres'}
                </h3>
                <form onSubmit={handleAddressSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nazwa adresu *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.label}
                      onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                      placeholder="np. Dom, Praca"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Imię *
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.first_name}
                        onChange={(e) => setAddressForm({ ...addressForm, first_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nazwisko *
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.last_name}
                        onChange={(e) => setAddressForm({ ...addressForm, last_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Firma
                    </label>
                    <input
                      type="text"
                      value={addressForm.company}
                      onChange={(e) => setAddressForm({ ...addressForm, company: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adres *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.address_line1}
                      onChange={(e) => setAddressForm({ ...addressForm, address_line1: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adres c.d.
                    </label>
                    <input
                      type="text"
                      value={addressForm.address_line2}
                      onChange={(e) => setAddressForm({ ...addressForm, address_line2: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Miasto *
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Województwo *
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.state_province}
                        onChange={(e) => setAddressForm({ ...addressForm, state_province: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kod pocztowy *
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.postal_code}
                        onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
                        placeholder="00-000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kraj *
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.country}
                        onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefon
                      </label>
                      <input
                        type="tel"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_default"
                      checked={addressForm.is_default}
                      onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_default" className="ml-2 block text-sm text-gray-900">
                      Ustaw jako domyślny adres
                    </label>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {editingAddressId ? 'Zaktualizuj' : 'Dodaj'} adres
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingAddress(false);
                        setEditingAddressId(null);
                      }}
                      className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Anuluj
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Address List */}
            {profile?.addresses && profile.addresses.length > 0 ? (
              <div className="space-y-4">
                {profile.addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`p-4 border rounded-lg ${
                      address.is_default ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium text-gray-900">{address.label}</h3>
                          {address.is_default && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              Domyślny
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>{address.first_name} {address.last_name}</p>
                          {address.company && <p>{address.company}</p>}
                          <p>{address.address_line1}</p>
                          {address.address_line2 && <p>{address.address_line2}</p>}
                          <p>{address.postal_code} {address.city}, {address.state_province}</p>
                          <p>{address.country}</p>
                          {address.phone && <p>Tel: {address.phone}</p>}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditAddress(address)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Edytuj
                        </button>
                        {!address.is_default && (
                          <button
                            onClick={() => handleSetDefaultAddress(address.id)}
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            Ustaw domyślny
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAddress(address.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Usuń
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>Brak zapisanych adresów</p>
                <p className="text-sm">Dodaj swój pierwszy adres klikając przycisk powyżej</p>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}