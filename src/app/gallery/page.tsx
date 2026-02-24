// app/gallery/page.tsx
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, MapPin, Clock, Users } from 'lucide-react';

// Sample turf images data
const turfImages = [
  {
    id: 1,
    src: '/images/turf1.jpg',
    alt: 'Main Football Turf - Day View',
    title: 'Main Football Turf',
    description: 'Professional-grade artificial turf perfect for 5v5 and 7v7 matches',
    category: 'football',
  },
  {
    id: 2,
    src: '/images/turf2night.jpg',
    alt: 'Night Match Under Floodlights',
    title: 'Night Gaming Experience',
    description: 'Premium floodlight setup for evening matches',
    category: 'football',
  },
  {
    id: 3,
    src: '/images/voltaout.jpg',
    alt: 'Turf Area',
    title: 'Night out view',
    description: 'Dedicated practice area with goals and training equipment',
    category: 'training',
  },
  {
    id: 4,
    src: '/images/turf-4.jpg',
    alt: 'Changing Rooms',
    title: 'Modern Facilities',
    description: 'Clean and spacious changing rooms with lockers',
    category: 'facilities',
  },
  {
    id: 5,
    src: '/images/turf-5.jpg',
    alt: 'Spectator Area',
    title: 'Viewing Area',
    description: 'Comfortable seating for spectators and supporters',
    category: 'facilities',
  },
  {
    id: 6,
    src: '/images/turf-6.jpg',
    alt: 'Mini Turf',
    title: 'Mini Turf',
    description: 'Perfect for 3v3 matches and small group training',
    category: 'football',
  },
];

const categories = [
  { id: 'all', label: 'All Images' },
  { id: 'football', label: 'Football Turfs' },
  { id: 'training', label: 'Training Areas' },
  { id: 'facilities', label: 'Facilities' },
];

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [lightboxImage, setLightboxImage] = useState<number | null>(null);

  const filteredImages = selectedCategory === 'all' 
    ? turfImages 
    : turfImages.filter(img => img.category === selectedCategory);

  const openLightbox = (index: number) => {
    setLightboxImage(index);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  const showPrevious = () => {
    if (lightboxImage !== null) {
      setLightboxImage(lightboxImage === 0 ? filteredImages.length - 1 : lightboxImage - 1);
    }
  };

  const showNext = () => {
    if (lightboxImage !== null) {
      setLightboxImage(lightboxImage === filteredImages.length - 1 ? 0 : lightboxImage + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-4">Our Gallery</h1>
            <p className="text-xl text-green-100">
              Explore our world-class football turf facilities
            </p>
          </div>
        </div>
      </div>

      {/* Features Bar */}
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3">
              <MapPin className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">Prime Location</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Clock className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">Open 6 AM - 11 PM</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Users className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">All Skill Levels</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-2.5 rounded-full font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-green-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-green-50 border border-gray-200'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((image, index) => (
            <div
              key={image.id}
              onClick={() => openLightbox(index)}
              className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer bg-gray-100 aspect-[4/3] hover:shadow-2xl transition-all duration-300"
            >
              {/* Actual Image */}
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                onError={(e) => {
                  // Fallback if image fails to load
                  e.currentTarget.style.display = 'none';
                }}
              />
              
              {/* Fallback placeholder */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center -z-10">
                <div className="text-center text-white p-6">
                  <div className="text-6xl mb-2">🏟️</div>
                  <p className="font-semibold">{image.title}</p>
                </div>
              </div>
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-xl font-bold mb-2">{image.title}</h3>
                  <p className="text-sm text-gray-200">{image.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImage !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Previous Button */}
          <button
            onClick={showPrevious}
            className="absolute left-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <ChevronLeft className="w-12 h-12" />
          </button>

          {/* Next Button */}
          <button
            onClick={showNext}
            className="absolute right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <ChevronRight className="w-12 h-12" />
          </button>

          {/* Image Container */}
          <div className="max-w-6xl max-h-[90vh] w-full">
            <div className="relative aspect-[4/3] bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
              <div className="text-center text-white p-8">
                <div className="text-8xl mb-4">🏟️</div>
                <h3 className="text-3xl font-bold mb-3">{filteredImages[lightboxImage].title}</h3>
                <p className="text-lg text-gray-100">{filteredImages[lightboxImage].description}</p>
              </div>
            </div>
            
            {/* Image Info */}
            <div className="text-center mt-4 text-white">
              <p className="text-sm">
                {lightboxImage + 1} / {filteredImages.length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="bg-green-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Book Your Slot?</h2>
          <p className="text-xl text-green-100 mb-8">
            Experience these amazing facilities yourself
          </p>
          <a
            href="/booking"
            className="inline-block bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
          >
            Book Now
          </a>
        </div>
      </div>
    </div>
  );
}