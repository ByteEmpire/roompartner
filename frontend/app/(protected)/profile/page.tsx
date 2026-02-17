'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useUserStore } from '@/store/userStore'
import Navbar from '@/components/layout/Navbar'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Loading from '@/components/ui/Loading'
import {
  MapPin,
  Briefcase,
  Home,
  Calendar,
  DollarSign,
  Edit,
  Wine,
  Cigarette,
  Dog,
  Utensils,
  X,
  Download,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import Image from 'next/image'
import { formatCurrency, getInitials } from '@/lib/utils'

function ProfileContent() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { profile, loadProfile, isLoading } = useUserStore()
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Loading className="py-20" text="Loading profile..." />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card variant="bordered" className="text-center py-12">
            <p className="text-gray-600 mb-4">No profile found</p>
            <Button onClick={() => router.push('/profile/setup')}>Create Profile</Button>
          </Card>
        </div>
      </div>
    )
  }

  const roomImages = profile.roomImages || []

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % roomImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + roomImages.length) % roomImages.length)
  }

  const downloadImage = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `room-image-${index + 1}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card variant="elevated">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              {profile.profileImage ? (
                <Image
                  src={profile.profileImage}
                  alt={profile.fullName}
                  width={100}
                  height={100}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                  <span className="text-3xl font-bold text-primary-600">
                    {getInitials(profile.fullName)}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{profile.fullName}</h1>
                <p className="text-gray-600">
                  {profile.age} years old • {profile.gender}
                </p>
              </div>
            </div>
            <Button onClick={() => router.push('/profile/edit')} variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>

          {/* About Section */}
          {profile.bio && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
              <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Location & Budget Section */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Location & Budget</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{profile.city}</div>
                    {profile.locality && <div className="text-sm text-gray-600">{profile.locality}</div>}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Home className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{formatCurrency(profile.budget)}</div>
                    <div className="text-sm text-gray-600">Monthly budget</div>
                  </div>
                </div>
                {profile.moveInDate && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <div className="font-medium">
                        {new Date(profile.moveInDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-600">Move-in date</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Preferences Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Preferences</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <Briefcase className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{profile.occupationType.replace('_', ' ')}</div>
                    <div className="text-sm text-gray-600">Occupation</div>
                  </div>
                </div>
                {profile.foodPreference && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Utensils className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <div className="font-medium">{profile.foodPreference}</div>
                      <div className="text-sm text-gray-600">Food preference</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lifestyle Tags */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Lifestyle</h3>
            <div className="flex flex-wrap gap-3">
              {profile.drinking && (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  <Wine className="w-4 h-4" />
                  Drinks occasionally
                </span>
              )}
              {profile.smoking && (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                  <Cigarette className="w-4 h-4" />
                  Smoker
                </span>
              )}
              {profile.pets && (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  <Dog className="w-4 h-4" />
                  Has pets
                </span>
              )}
              {!profile.drinking && !profile.smoking && !profile.pets && (
                <span className="text-gray-500 text-sm">No lifestyle preferences specified</span>
              )}
            </div>
          </div>

          {/* Room Photos Section */}
          {roomImages.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Flat Images</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {roomImages.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={imageUrl}
                      alt={`Room ${index + 1}`}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                    {/* Overlay with actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => openLightbox(index)}
                        className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                        title="View full size"
                      >
                        <ZoomIn className="w-5 h-5 text-gray-700" />
                      </button>
                      <button
                        onClick={() => downloadImage(imageUrl, index)}
                        className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                        title="Download"
                      >
                        <Download className="w-5 h-5 text-gray-700" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && roomImages.length > 0 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors z-10"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>

          {/* Download Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              downloadImage(roomImages[currentImageIndex], currentImageIndex)
            }}
            className="absolute top-4 right-20 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors z-10"
            title="Download"
          >
            <Download className="w-6 h-6 text-gray-700" />
          </button>

          {/* Previous Button */}
          {roomImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                prevImage()
              }}
              className="absolute left-4 p-3 bg-white rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-w-5xl max-h-[90vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={roomImages[currentImageIndex]}
              alt={`Room ${currentImageIndex + 1}`}
              width={1200}
              height={800}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm">
              {currentImageIndex + 1} / {roomImages.length}
            </div>
          </div>

          {/* Next Button */}
          {roomImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                nextImage()
              }}
              className="absolute right-4 p-3 bg-white rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}