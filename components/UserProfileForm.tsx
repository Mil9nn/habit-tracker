'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface UserProfile {
  weightKg: number
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  climate: 'cold' | 'moderate' | 'hot' | 'very_hot'
  dietPreferences: {
    highProtein: boolean
    salty: boolean
    spicy: boolean
    caffeine: boolean
    fruits: boolean
    vegetables: boolean
    soups: boolean
  }
}

export default function UserProfileForm() {
  const [profile, setProfile] = useState<UserProfile>({
    weightKg: 70,
    activityLevel: 'moderate',
    climate: 'moderate',
    dietPreferences: {
      highProtein: false,
      salty: false,
      spicy: false,
      caffeine: false,
      fruits: false,
      vegetables: false,
      soups: false,
    }
  })
  
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        if (data) {
          setProfile(data)
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSaved(false)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      })

      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDietPreferenceChange = (key: keyof typeof profile.dietPreferences) => {
    setProfile(prev => ({
      ...prev,
      dietPreferences: {
        ...prev.dietPreferences,
        [key]: !prev.dietPreferences[key]
      }
    }))
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Personalize Your Water Intake</CardTitle>
        <p className="text-sm text-gray-600">
          Tell us about yourself so we can calculate your optimal daily water intake
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Body Weight */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Body Weight (kg)
            </label>
            <Input
              type="number"
              min="30"
              max="300"
              value={profile.weightKg}
              onChange={(e) => setProfile(prev => ({ ...prev, weightKg: Number(e.target.value) }))}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              This is the primary factor for water calculation
            </p>
          </div>

          {/* Activity Level */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Activity Level
            </label>
            <select
              value={profile.activityLevel}
              onChange={(e) => setProfile(prev => ({ ...prev, activityLevel: e.target.value as any }))}
              className="w-full p-2 border rounded-md"
            >
              <option value="sedentary">🪑 Sedentary (Desk job, little exercise)</option>
              <option value="light">🚶 Light (Light exercise 1-3 days/week)</option>
              <option value="moderate">🏃 Moderate (Moderate exercise 3-5 days/week)</option>
              <option value="active">💪 Active (Hard exercise 6-7 days/week)</option>
              <option value="very_active">🔥 Very Active (Very hard exercise + physical job)</option>
            </select>
          </div>

          {/* Climate */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Climate/Temperature
            </label>
            <select
              value={profile.climate}
              onChange={(e) => setProfile(prev => ({ ...prev, climate: e.target.value as any }))}
              className="w-full p-2 border rounded-md"
            >
              <option value="cold">❄️ Cold</option>
              <option value="moderate">🌤️ Moderate</option>
              <option value="hot">☀️ Hot</option>
              <option value="very_hot">🔥 Very Hot (like Indian summers)</option>
            </select>
          </div>

          {/* Diet Preferences */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Diet Preferences
            </label>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">Foods that increase water needs:</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'highProtein', label: '🥩 High Protein', description: 'More water needed' },
                  { key: 'salty', label: '🧂 Salty Foods', description: '+300ml' },
                  { key: 'spicy', label: '🌶️ Spicy Food', description: '+150ml' },
                  { key: 'caffeine', label: '☕ Caffeine', description: '+250ml' },
                ].map(({ key, label, description }) => (
                  <label key={key} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.dietPreferences[key as keyof typeof profile.dietPreferences]}
                      onChange={() => handleDietPreferenceChange(key as keyof typeof profile.dietPreferences)}
                      className="rounded"
                    />
                    <span className="text-sm">
                      {label} <span className="text-gray-500">({description})</span>
                    </span>
                  </label>
                ))}
              </div>

              <p className="text-sm text-gray-600 mt-3">Foods that decrease water needs:</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'fruits', label: '🍎 Fruits', description: '-100ml' },
                  { key: 'vegetables', label: '🥬 Vegetables', description: '-100ml' },
                  { key: 'soups', label: '🍲 Soups', description: '-150ml' },
                ].map(({ key, label, description }) => (
                  <label key={key} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.dietPreferences[key as keyof typeof profile.dietPreferences]}
                      onChange={() => handleDietPreferenceChange(key as keyof typeof profile.dietPreferences)}
                      className="rounded"
                    />
                    <span className="text-sm">
                      {label} <span className="text-gray-500">({description})</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Profile'}
            </Button>
            {saved && (
              <span className="text-green-600 text-sm">Profile saved successfully!</span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
