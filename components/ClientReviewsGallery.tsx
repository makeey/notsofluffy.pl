"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface ClientReview {
  id: number;
  client_name: string;
  instagram_handle?: string;
  image_id: number;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  image?: {
    id: number;
    filename: string;
    original_name: string;
    path: string;
    size_bytes: number;
    mime_type: string;
    uploaded_by: number;
    created_at: string;
    updated_at: string;
  };
}

interface ClientReviewsResponse {
  client_reviews: ClientReview[];
}

interface ReviewCardProps {
  review: ClientReview;
}

function ReviewCard({ review }: ReviewCardProps) {
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    setIsActive(!isActive);
  };

  return (
    <div 
      className="flex-none w-64 sm:w-72 md:w-64 group relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer touch-manipulation"
      onClick={handleClick}
    >
      {/* Image with overlay */}
      <div className="relative w-full h-80 overflow-hidden">
        {review.image && (
          <Image
            src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/${review.image.path}`}
            alt={`Zdjęcie klienta ${review.client_name}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 256px, 256px"
          />
        )}
        
        {/* Overlay with client info - shows on hover (desktop) or active state (mobile) */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${
          isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h3 className="text-xl font-semibold mb-2 leading-tight">
              {review.client_name}
            </h3>
            {review.instagram_handle && (
              <a
                href={`https://instagram.com/${review.instagram_handle.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-white/90 hover:text-white transition-colors duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                @{review.instagram_handle.replace('@', '')}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ClientReviewsGallery() {
  const [reviews, setReviews] = useState<ClientReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClientReviews();
  }, []);

  const fetchClientReviews = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/client-reviews`);
      if (!response.ok) {
        throw new Error('Failed to fetch client reviews');
      }
      const data: ClientReviewsResponse = await response.json();
      setReviews(data.client_reviews);
    } catch (err) {
      console.error('Error fetching client reviews:', err);
      setError('Failed to load client reviews');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="bg-gray-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Nasi zadowoleni klienci
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Zobacz, jak nasze produkty cieszą psie serca
            </p>
          </div>
          <div className="mt-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !reviews || reviews.length === 0) {
    return null; // Don't show the section if there are no reviews
  }

  return (
    <section className="bg-gray-50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Nasi zadowoleni klienci
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Zobacz, jak nasze produkty cieszą psie serca
          </p>
        </div>
        
        <div className="mt-12 relative">
          {/* Gallery Container */}
          <div className={`${reviews.length >= 4 ? 'overflow-hidden' : ''} pb-4`}>
            <div className={`flex ${reviews.length >= 4 ? 'space-x-6 animate-scroll-slow' : 'justify-center flex-wrap gap-6'}`}>
              {/* Duplicate the reviews array for infinite scroll effect only if we have enough reviews */}
              {reviews.length >= 4 ? 
                [...reviews, ...reviews].map((review, index) => (
                  <ReviewCard key={`${review.id}-${index}`} review={review} />
                )) :
                reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))
              }
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes scroll-slow {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll-slow {
          animation: scroll-slow 60s linear infinite;
        }
        
        .animate-scroll-slow:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}