'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/userStore'
import { ProfileFormData, Gender, GenderPreference, OccupationType, FoodPreference } from '@/types'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Loading from '@/components/ui/Loading'

export default function ProfileSetupPage() {
  const router = useRouter()
  const { profile, createProfile, loadProfile, isLoading, error } = useUserStore()

  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: '',
    age: 18,
    gender: Gender.MALE,
    phoneNumber: '',
    bio: '',
    city: '',
    locality: '',
    budget: 5000,
    moveInDate: '',
    preferredGender: GenderPreference.ANY,
    occupationType: OccupationType.WORKING_PROFESSIONAL,
    foodPreference: FoodPreference.VEGETARIAN,
    drinking: false,
    smoking: false,
    pets: false,
  })

  const [step, setStep] = useState(1)
  const [isChecking, setIsChecking] = useState(true)

  //  CHECK IF PROFILE ALREADY EXISTS
  useEffect(() => {
    const checkProfile = async () => {
      try {
        await loadProfile()
      } catch (error) {
        // Profile doesn't exist, that's fine
        console.log('No existing profile, proceeding with setup')
      } finally {
        setIsChecking(false)
      }
    }
    
    checkProfile()
  }, [loadProfile])

  //  REDIRECT IF PROFILE EXISTS
  useEffect(() => {
    if (!isChecking && profile) {
      console.log('✅ Profile already exists, redirecting to dashboard')
      router.push('/dashboard')
    }
  }, [isChecking, profile, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : type === 'number' ? Number(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const cleanedData: any = { ...formData }
    
    if (!cleanedData.phoneNumber) delete cleanedData.phoneNumber
    if (!cleanedData.bio) delete cleanedData.bio
    if (!cleanedData.locality) delete cleanedData.locality
    if (!cleanedData.moveInDate) delete cleanedData.moveInDate
    if (!cleanedData.foodPreference) delete cleanedData.foodPreference

    try {
      await createProfile(cleanedData)
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Profile setup failed:', error)
      
      //  HANDLE 409 CONFLICT
      if (error.response?.status === 409) {
        console.log('Profile already exists, redirecting...')
        router.push('/dashboard')
      }
    }
  }

  //  SHOW LOADING WHILE CHECKING
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center">
        <Loading text="Checking profile..." />
      </div>
    )
  }

  //  DON'T RENDER IF PROFILE EXISTS (redundant but safe)
  if (profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">Tell us about yourself to find the best matches</p>
          <div className="mt-4 flex justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 w-16 rounded-full transition-colors ${
                  s <= step ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        <Card variant="elevated">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
                <Input
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="Age"
                    name="age"
                    type="number"
                    min="18"
                    max="100"
                    value={formData.age}
                    onChange={handleChange}
                    required
                  />
                  <Select
                    label="Gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    options={[
                      { value: Gender.MALE, label: 'Male' },
                      { value: Gender.FEMALE, label: 'Female' },
                      { value: Gender.OTHER, label: 'Other' },
                    ]}
                    required
                  />
                </div>
                <Input
                  label="Phone Number"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                />
                <Textarea
                  label="Bio"
                  name="bio"
                  rows={4}
                  placeholder="Tell potential roommates about yourself..."
                  value={formData.bio}
                  onChange={handleChange}
                />
                <Button type="button" onClick={() => setStep(2)} className="w-full">
                  Next
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Location & Budget</h2>
                <Input
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g., Mumbai"
                  required
                />
                <Input
                  label="Locality"
                  name="locality"
                  value={formData.locality}
                  onChange={handleChange}
                  placeholder="e.g., Andheri West"
                />
                <Input
                  label="Monthly Budget (₹)"
                  name="budget"
                  type="number"
                  min="1000"
                  step="500"
                  value={formData.budget}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Move-in Date"
                  name="moveInDate"
                  type="date"
                  value={formData.moveInDate}
                  onChange={handleChange}
                />
                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button type="button" onClick={() => setStep(3)} className="flex-1">
                    Next
                  </Button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Preferences</h2>
                <Select
                  label="Preferred Roommate Gender"
                  name="preferredGender"
                  value={formData.preferredGender}
                  onChange={handleChange}
                  options={[
                    { value: GenderPreference.MALE, label: 'Male' },
                    { value: GenderPreference.FEMALE, label: 'Female' },
                    { value: GenderPreference.ANY, label: 'Any' },
                  ]}
                  required
                />
                <Select
                  label="Occupation"
                  name="occupationType"
                  value={formData.occupationType}
                  onChange={handleChange}
                  options={[
                    { value: OccupationType.STUDENT, label: 'Student' },
                    { value: OccupationType.WORKING_PROFESSIONAL, label: 'Working Professional' },
                    { value: OccupationType.FREELANCER, label: 'Freelancer' },
                    { value: OccupationType.OTHER, label: 'Other' },
                  ]}
                  required
                />
                <Select
                  label="Food Preference"
                  name="foodPreference"
                  value={formData.foodPreference || ''}
                  onChange={handleChange}
                  options={[
                    { value: FoodPreference.VEGETARIAN, label: 'Vegetarian' },
                    { value: FoodPreference.NON_VEGETARIAN, label: 'Non-Vegetarian' },
                    { value: FoodPreference.VEGAN, label: 'Vegan' },
                    { value: FoodPreference.JAIN, label: 'Jain' },
                  ]}
                />
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="drinking"
                      checked={formData.drinking}
                      onChange={handleChange}
                      className="w-5 h-5 text-primary-600 rounded"
                    />
                    <span className="text-gray-700">I drink occasionally</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="smoking"
                      checked={formData.smoking}
                      onChange={handleChange}
                      className="w-5 h-5 text-primary-600 rounded"
                    />
                    <span className="text-gray-700">I smoke</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="pets"
                      checked={formData.pets}
                      onChange={handleChange}
                      className="w-5 h-5 text-primary-600 rounded"
                    />
                    <span className="text-gray-700">I have pets</span>
                  </label>
                </div>
                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">
                    Back
                  </Button>
                  <Button type="submit" isLoading={isLoading} className="flex-1">
                    Complete Setup
                  </Button>
                </div>
              </>
            )}
          </form>
        </Card>
      </div>
    </div>
  )
}